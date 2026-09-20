import fs from "node:fs";
import { files, hash, inside, readIfExists, atomicWrite } from "./files.mjs";
import { transformArticle, articleRoute } from "./transform.mjs";

export const manifestPath = ".blog-sync/manifest.json";
export function planSync({ vault, repo, allowEmpty = false }) {
  vault = fs.realpathSync(vault);
  repo = fs.realpathSync(repo);
  const sourceRoot = inside(vault, "03 Writing/blog");
  const sources = files(sourceRoot).filter((p) => p.endsWith(".md"));
  if (!sources.length && !allowEmpty)
    throw new Error(
      "Empty blog collection; use --allow-empty only for intentional full withdrawal",
    );
  const assetFiles = files(inside(vault, "_assets"));
  const previousBytes = readIfExists(inside(repo, manifestPath));
  const previous = previousBytes
    ? JSON.parse(previousBytes)
    : { version: 1, files: {}, articles: [] };
  if (
    previous.version !== 1 ||
    !previous.files ||
    !Array.isArray(previous.articles)
  )
    throw new Error("Invalid sync manifest");
  const desired = {},
    inputs = {},
    articles = [],
    errors = [];
  for (const relative of sources) {
    try {
      const raw = fs.readFileSync(inside(sourceRoot, relative), "utf8");
      inputs["03 Writing/blog/" + relative] = hash(raw);
      const result = transformArticle({ vault, relative, raw, assetFiles });
      if (
        articles.some(
          (a) => a.route.toLowerCase() === result.route.toLowerCase(),
        )
      )
        throw new Error(`Route collision: ${relative} -> ${result.route}`);
      if (result.route === "/blog/")
        throw new Error(`Route collision with blog index: ${relative}`);
      desired["content/blog/" + relative] = Buffer.from(result.markdown);
      const refs = Object.keys(result.assets).sort();
      for (const [target, asset] of Object.entries(result.assets)) {
        inside(repo, target);
        if (desired[target] && !desired[target].equals(asset.bytes))
          throw new Error(`Asset collision: ${target}`);
        desired[target] = asset.bytes;
        inputs[asset.source] = hash(asset.bytes);
      }
      articles.push({
        source: relative,
        route: result.route,
        sourceHash: hash(raw),
        assets: refs,
      });
    } catch (error) {
      errors.push(error.message);
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));
  const existingMarkdown = files(inside(repo, "content/blog"), true)
    .filter((p) => p.endsWith(".md"))
    .map((p) => "content/blog/" + p);
  // On initial adoption only assets referenced by existing articles become managed.
  const legacyAssets = previousBytes
    ? []
    : existingMarkdown
        .flatMap((p) => {
          const raw = fs.readFileSync(inside(repo, p), "utf8");
          return [...raw.matchAll(/\/images\/blog\/[^\s"'<>)]*/g)].map(
            (m) => "public" + decodeURIComponent(m[0]),
          );
        })
        .filter((p) => fs.existsSync(inside(repo, p)));
  const targets = [
    ...new Set([
      ...Object.keys(previous.files),
      ...existingMarkdown,
      ...legacyAssets,
      ...Object.keys(desired),
    ]),
  ].sort();
  const changes = [],
    current = {};
  for (const target of targets) {
    if (
      !target.startsWith("content/blog/") &&
      !target.startsWith("public/images/blog/")
    )
      throw new Error(`Unsafe managed path: ${target}`);
    const bytes = readIfExists(inside(repo, target));
    current[target] = bytes ? hash(bytes) : null;
    const wanted = desired[target] ? hash(desired[target]) : null;
    if (
      previous.files[target] &&
      current[target] !== previous.files[target] &&
      current[target] !== wanted
    )
      throw new Error(
        `Output conflict: ${target}; reconcile edits in Vault first`,
      );
    if (current[target] !== wanted)
      changes.push({
        action: !wanted ? "delete" : !bytes ? "add" : "update",
        path: target,
      });
  }
  const priorRoutes = previousBytes
    ? previous.articles.map((a) => a.route)
    : existingMarkdown.map((p) =>
        articleRoute(p.slice("content/blog/".length)),
      );
  const withdrawn = [
    ...new Set([...(previous.withdrawn ?? []), ...priorRoutes]),
  ]
    .filter((route) => !articles.some((a) => a.route === route))
    .sort();
  const manifest = {
    version: 1,
    articles,
    withdrawn,
    files: Object.fromEntries(
      Object.keys(desired)
        .sort()
        .map((p) => [p, hash(desired[p])]),
    ),
  };
  const manifestBytes = Buffer.from(JSON.stringify(manifest, null, 2) + "\n");
  return {
    vault,
    repo,
    allowEmpty,
    articles,
    changes,
    desired,
    manifest,
    manifestBytes,
    manifestChanged: !previousBytes?.equals(manifestBytes),
    fingerprint: hash(
      JSON.stringify({
        inputs,
        current,
        previous: previousBytes?.toString(),
        manifest,
      }),
    ),
    withdrawn: previous.articles
      .filter((a) => !articles.some((b) => b.route === a.route))
      .map((a) => a.route),
  };
}
export function applySync(plan) {
  const fresh = planSync(plan);
  if (fresh.fingerprint !== plan.fingerprint)
    throw new Error("Source or output changed since plan; review a fresh plan");
  const writes = [
    ...plan.changes.map((c) => ({
      path: c.path,
      bytes: plan.desired[c.path] ?? null,
    })),
    ...(plan.manifestChanged
      ? [{ path: manifestPath, bytes: plan.manifestBytes }]
      : []),
  ];
  const backups = writes.map((w) => ({
    ...w,
    previous: readIfExists(inside(plan.repo, w.path)),
  }));
  try {
    for (const w of writes) {
      const target = inside(plan.repo, w.path);
      if (w.bytes === null) fs.rmSync(target);
      else atomicWrite(target, w.bytes);
    }
  } catch (error) {
    const failures = [];
    for (const w of backups.reverse()) {
      try {
        const target = inside(plan.repo, w.path);
        if (w.previous === null) fs.rmSync(target, { force: true });
        else atomicWrite(target, w.previous);
      } catch (restoreError) {
        failures.push(restoreError);
      }
    }
    if (failures.length)
      throw new AggregateError(
        [error, ...failures],
        "Sync failed; rollback incomplete",
      );
    throw error;
  }
  return plan;
}
