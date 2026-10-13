import { execFileSync } from "node:child_process";
import { hash } from "./files.mjs";
import { manifestPath } from "./sync.mjs";

export function deploymentState({
  localChanges,
  localManifest,
  productionManifest,
  latestState,
  latestMatches = false,
}) {
  const equal =
    productionManifest &&
    hash(JSON.stringify(localManifest.files)) ===
      hash(JSON.stringify(productionManifest.files));
  if (localChanges) return "待同步";
  if (
    latestMatches &&
    ["pending", "queued", "in_progress"].includes(latestState)
  )
    return "部署中";
  if (latestMatches && ["error", "failure"].includes(latestState))
    return "部署失敗";
  return equal ? "已上線" : "已同步，待部署";
}
export async function inspectDeployment(
  plan,
  { verify = false, origin = "https://info.tttingzhang999.com", gh } = {},
) {
  const run =
    gh ??
    ((args) =>
      JSON.parse(
        execFileSync("gh", args, {
          cwd: plan.repo,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        }),
      ));
  const repository = run([
    "repo",
    "view",
    "--json",
    "nameWithOwner",
  ]).nameWithOwner;
  const deployments = run([
    "api",
    `repos/${repository}/deployments?environment=Production&per_page=30`,
  ]).filter((deployment) => deployment.environment === "Production");
  if (!deployments.length)
    return { state: "尚無 Production 部署紀錄", verified: false };
  let latestState,
    latestMatches = false,
    production = null,
    productionManifest = null,
    productionDigest = null;
  const contentAt = (sha) => {
    try {
      const file = run([
        "api",
        `repos/${repository}/contents/${manifestPath}?ref=${sha}`,
      ]);
      if (file.encoding !== "base64" || typeof file.content !== "string")
        throw new Error("Deployment manifest content is unavailable");
      const bytes = Buffer.from(file.content, "base64");
      return {
        manifest: JSON.parse(bytes.toString("utf8")),
        digest: hash(bytes),
      };
    } catch (error) {
      if (String(error.stderr ?? error.message).includes("404")) return null;
      throw error;
    }
  };
  for (let i = 0; i < deployments.length; i++) {
    const deployment = deployments[i];
    const status = run([
      "api",
      `repos/${repository}/deployments/${deployment.id}/statuses?per_page=1`,
    ])[0];
    if (i === 0) {
      latestState = status?.state;
      const manifest = contentAt(deployment.sha)?.manifest;
      latestMatches =
        !!manifest &&
        hash(JSON.stringify(manifest.files)) ===
          hash(JSON.stringify(plan.manifest.files));
    }
    if (status?.state === "success") {
      production = deployment;
      const content = contentAt(deployment.sha);
      productionManifest = content?.manifest;
      productionDigest = content?.digest;
      break;
    }
  }
  const state = deploymentState({
    localChanges: plan.changes.length > 0 || plan.manifestChanged,
    localManifest: plan.manifest,
    productionManifest,
    latestState,
    latestMatches,
  });
  const result = {
    state,
    latestState,
    productionSha: production?.sha ?? null,
    verified: false,
  };
  if (verify && state === "已上線") {
    const checks = [
      ...plan.articles.map((a) => ({ route: a.route, expected: 200 })),
      ...(plan.manifest.withdrawn ?? []).map((route) => ({
        route,
        expected: 404,
      })),
    ];
    const failures = [];
    try {
      const response = await fetch(new URL("/release.json", origin), {
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      if (response.status !== 200) {
        await response.body?.cancel();
        failures.push({
          route: "/release.json",
          expected: 200,
          actual: response.status,
        });
      } else {
        const live = await response.json();
        if (
          live?.sourceSha !== production.sha ||
          live?.contentManifestDigest !== productionDigest
        )
          failures.push({
            route: "/release.json",
            reason: "release_identity_mismatch",
          });
      }
    } catch {
      failures.push({
        route: "/release.json",
        reason: "release_metadata_unavailable",
      });
    }
    for (const check of checks) {
      const url = new URL(check.route, origin);
      const response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(15000),
      });
      await response.body?.cancel();
      if (response.status !== check.expected)
        failures.push({ ...check, actual: response.status });
    }
    result.verified = failures.length === 0;
    result.failures = failures;
    if (failures.length) result.state = "部署成功，網址驗證失敗";
  }
  return result;
}
