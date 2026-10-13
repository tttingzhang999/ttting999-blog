import { execFileSync } from "node:child_process";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  deploymentState,
  inspectDeployment,
} from "../scripts/blog/deployment.mjs";
import { hash } from "../scripts/blog/files.mjs";
const manifest = { files: { "content/blog/a.md": "aaa" } };
const manifestBytes = JSON.stringify(manifest, null, 2) + "\n";
const content = {
  encoding: "base64",
  content: Buffer.from(manifestBytes).toString("base64"),
};
const sha = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
const release = { sourceSha: sha, contentManifestDigest: hash(manifestBytes) };
test("sync, deploy, failed deployment and previous successful version remain separate", () => {
  const base = {
    intendedSha: sha,
    productionSha: sha,
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
    if (args[1].includes("/contents/"))
      return args.includes("--jq") ? manifest : content;
    if (args[1].includes("/statuses")) return [{ state: "success" }];
    return [{ id: 1, sha, environment: "Production" }];
  };
  const result = await inspectDeployment(
    { repo: ".", manifest, changes: [], manifestChanged: false },
    { gh },
  );
  assert.equal(result.state, "已上線");
  assert.equal(result.productionSha, sha);
  assert.equal(result.verified, false);
  assert.ok(calls.some((a) => a[1].includes("environment=Production")));
});
test("URL verification checks published and withdrawn routes and reports failures", async (t) => {
  const gh = (args) =>
    args[0] === "repo"
      ? { nameWithOwner: "owner/repo" }
      : args[1].includes("/contents/")
        ? args.includes("--jq")
          ? manifest
          : content
        : args[1].includes("/statuses")
          ? [{ state: "success" }]
          : [{ id: 1, sha, environment: "Production" }];
  const plan = {
    repo: ".",
    manifest: { ...manifest, withdrawn: ["/blog/old"] },
    articles: [{ route: "/blog/a" }],
    changes: [],
    manifestChanged: false,
  };
  t.mock.method(globalThis, "fetch", async (url) =>
    url.pathname === "/release.json"
      ? Response.json(release)
      : new Response("", { status: url.pathname.endsWith("/old") ? 404 : 200 }),
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
  assert.equal(failed.failures.length, 3);
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
    return [{ id: 1, sha: "old", environment: "Production" }];
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

const plan = {
  repo: ".",
  manifest,
  articles: [{ route: "/blog/a" }],
  changes: [],
  manifestChanged: false,
};
function github(
  deployments = [{ id: 1, sha, environment: "Production" }],
  states = {},
) {
  return (args) => {
    if (args[0] === "repo") return { nameWithOwner: "owner/repo" };
    if (args[1].includes("/contents/"))
      return args.includes("--jq") ? manifest : content;
    if (args[1].includes("/statuses"))
      return [
        { state: states[args[1].match(/deployments\/(\d+)/)[1]] ?? "success" },
      ];
    return deployments;
  };
}
for (const [name, response] of [
  [
    "stale code with identical articles",
    () => Response.json({ ...release, sourceSha: "b".repeat(40) }),
  ],
  [
    "digest of reserialized rather than exact committed bytes",
    () =>
      Response.json({
        ...release,
        contentManifestDigest: hash(JSON.stringify(manifest)),
      }),
  ],
  ["missing release", () => new Response("missing", { status: 404 })],
  ["non-JSON release", () => new Response("<html>fallback</html>")],
  ["null release", () => Response.json(null)],
  [
    "unreachable release",
    () => {
      throw new Error("offline");
    },
  ],
]) {
  test(name + " cannot verify Production", async (t) => {
    t.mock.method(globalThis, "fetch", async (url) =>
      url.pathname === "/release.json" ? response() : new Response("ok"),
    );
    const result = await inspectDeployment(plan, {
      gh: github(),
      verify: true,
    });
    assert.equal(result.verified, false);
    assert.notEqual(result.state, "已上線");
    assert.ok(
      result.failures.some((failure) => failure.route === "/release.json"),
    );
  });
}
test("preview records cannot supply Production identity", async () => {
  const result = await inspectDeployment(plan, {
    gh: github([{ id: 1, sha, environment: "Preview" }]),
    verify: true,
  });
  assert.equal(result.verified, false);
  assert.notEqual(result.state, "已上線");
});
test("failed latest release preserves previous successful SHA without claiming verified", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    assert.fail("failed deployment must not verify");
  });
  const previous = "b".repeat(40);
  const result = await inspectDeployment(plan, {
    gh: github(
      [
        { id: 2, sha, environment: "Production" },
        { id: 1, sha: previous, environment: "Production" },
      ],
      { 2: "failure" },
    ),
    verify: true,
  });
  assert.equal(result.state, "部署失敗");
  assert.equal(result.productionSha, previous);
  assert.equal(result.verified, false);
});

test("old successful record and matching old live release do not verify newer checkout HEAD", async (t) => {
  const previous = "b".repeat(40);
  t.mock.method(globalThis, "fetch", async (url) =>
    url.pathname === "/release.json"
      ? Response.json({ ...release, sourceSha: previous })
      : new Response("ok"),
  );
  const result = await inspectDeployment(plan, {
    gh: github([{ id: 1, sha: previous, environment: "Production" }]),
    verify: true,
  });
  assert.equal(result.verified, false);
  assert.equal(result.state, "已同步，待部署");
  assert.equal(result.intendedSha, sha);
  assert.equal(result.productionSha, previous);
});
for (const latestState of ["pending", "queued", "in_progress"]) {
  test(
    latestState + " intended release preserves previous successful identity",
    async (t) => {
      t.mock.method(globalThis, "fetch", () =>
        assert.fail("pending source cannot verify"),
      );
      const previous = "b".repeat(40);
      const result = await inspectDeployment(plan, {
        gh: github(
          [
            { id: 2, sha, environment: "Production" },
            { id: 1, sha: previous, environment: "Production" },
          ],
          { 2: latestState },
        ),
        verify: true,
      });
      assert.equal(result.state, "部署中");
      assert.equal(result.verified, false);
      assert.equal(result.productionSha, previous);
    },
  );
}
test("a failed unrelated revision does not label the intended revision failed", async () => {
  const result = await inspectDeployment(plan, {
    gh: github(
      [
        { id: 2, sha: "c".repeat(40), environment: "Production" },
        { id: 1, sha: "b".repeat(40), environment: "Production" },
      ],
      { 2: "failure" },
    ),
  });
  assert.equal(result.state, "已同步，待部署");
  assert.equal(result.latestState, "failure");
  assert.equal(result.verified, false);
});
