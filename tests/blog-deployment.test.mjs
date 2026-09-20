import { test } from "node:test";
import assert from "node:assert/strict";
import {
  deploymentState,
  inspectDeployment,
} from "../scripts/blog/deployment.mjs";
const manifest = { files: { "content/blog/a.md": "aaa" } };
test("sync, deploy, failed deployment and previous successful version remain separate", () => {
  const base = {
    localChanges: false,
    localManifest: manifest,
    productionManifest: null,
  };
  assert.equal(deploymentState({ ...base, localChanges: true }), "待同步");
  assert.equal(deploymentState(base), "已同步，待部署");
  assert.equal(
    deploymentState({ ...base, productionManifest: manifest }),
    "已上線",
  );
  assert.equal(
    deploymentState({ ...base, latestState: "pending", latestMatches: true }),
    "部署中",
  );
  assert.equal(
    deploymentState({ ...base, latestState: "failure", latestMatches: true }),
    "部署失敗",
  );
  assert.equal(
    deploymentState({ ...base, latestState: "failure", latestMatches: false }),
    "已同步，待部署",
  );
});
test("provider success must match the manifest; status uses production not preview", async () => {
  const calls = [];
  const gh = (args) => {
    calls.push(args);
    if (args[0] === "repo") return { nameWithOwner: "owner/repo" };
    if (args[1].includes("/contents/")) return manifest;
    if (args[1].includes("/statuses")) return [{ state: "success" }];
    return [{ id: 1, sha: "commit" }];
  };
  const result = await inspectDeployment(
    { repo: ".", manifest, changes: [], manifestChanged: false },
    { gh },
  );
  assert.equal(result.state, "已上線");
  assert.equal(result.productionSha, "commit");
  assert.equal(result.verified, false);
  assert.ok(calls.some((a) => a[1].includes("environment=Production")));
});
test("URL verification checks published and withdrawn routes and reports failures", async (t) => {
  const gh = (args) =>
    args[0] === "repo"
      ? { nameWithOwner: "owner/repo" }
      : args[1].includes("/contents/")
        ? manifest
        : args[1].includes("/statuses")
          ? [{ state: "success" }]
          : [{ id: 1, sha: "commit" }];
  const plan = {
    repo: ".",
    manifest: { ...manifest, withdrawn: ["/blog/old"] },
    articles: [{ route: "/blog/a" }],
    changes: [],
    manifestChanged: false,
  };
  t.mock.method(
    globalThis,
    "fetch",
    async (url) =>
      new Response("", { status: url.pathname.endsWith("/old") ? 404 : 200 }),
  );
  assert.equal(
    (
      await inspectDeployment(plan, {
        gh,
        verify: true,
        origin: "https://example.com",
      })
    ).verified,
    true,
  );
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("", { status: 503 }),
  );
  const failed = await inspectDeployment(plan, { gh, verify: true });
  assert.equal(failed.state, "部署成功，網址驗證失敗");
  assert.equal(failed.failures.length, 2);
});
test("missing deployment and pre-manifest deployment do not imply success", async () => {
  const noDeploy = await inspectDeployment(
    { repo: "." },
    {
      gh: (args) => (args[0] === "repo" ? { nameWithOwner: "owner/repo" } : []),
    },
  );
  assert.match(noDeploy.state, /尚無/);
  const gh = (args) => {
    if (args[0] === "repo") return { nameWithOwner: "owner/repo" };
    if (args[1].includes("/contents/")) throw new Error("HTTP 404");
    if (args[1].includes("/statuses")) return [{ state: "success" }];
    return [{ id: 1, sha: "old" }];
  };
  assert.equal(
    (
      await inspectDeployment(
        { repo: ".", manifest, changes: [], manifestChanged: false },
        { gh },
      )
    ).state,
    "已同步，待部署",
  );
});
