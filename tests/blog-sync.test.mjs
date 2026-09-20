import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { planSync, applySync } from "../scripts/blog/sync.mjs";

const article = (body = "Hello", extra = "") =>
  `---\ntitle: Example\ndescription: Summary\ndate: '2026-09-20'\ntags: [Test]\ncategory: 技術\nauthor: Ting Zhang\nimage: ''\n${extra}---\n\n${body}\n`;
function setup(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-sync-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const vault = path.join(root, "vault"),
    repo = path.join(root, "repo");
  const write = (p, s) => {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, s);
  };
  for (const p of ["03 Writing/blog", "03 Writing/drafts", "_assets"])
    fs.mkdirSync(path.join(vault, p), { recursive: true });
  fs.mkdirSync(repo);
  return {
    vault,
    repo,
    write,
    source: (p, s) => write(path.join(vault, "03 Writing/blog", p), s),
    output: (p) => path.join(repo, p),
  };
}
test("recursive mirror, image updates, withdrawal, and idempotent re-run", (t) => {
  const f = setup(t);
  f.source(
    "Leetcode Contest/test.md",
    article(
      "![[test-diagram.png|600]]\n\n> [!note] Reminder\n> Body\n\n[[Note|Alias]]\n\n```md\n![[literal.png]]\n```",
    ),
  );
  f.write(path.join(f.vault, "_assets/test-diagram.png"), "image-one");
  const p = planSync(f);
  assert.equal(p.articles[0].route, "/blog/leetcode-contest/test");
  applySync(p);
  const out = fs.readFileSync(
    f.output("content/blog/Leetcode Contest/test.md"),
    "utf8",
  );
  assert.match(out, /width="600"/);
  assert.match(out, /\*\*Note: Reminder\*\*/);
  assert.match(out, /Alias/);
  assert.match(out, /!\[\[literal.png\]\]/);
  assert.equal(planSync(f).changes.length, 0);
  f.write(path.join(f.vault, "_assets/test-diagram.png"), "image-two");
  assert.equal(
    planSync(f).changes.filter((c) => c.action === "update").length,
    1,
  );
  applySync(planSync(f));
  fs.renameSync(
    path.join(f.vault, "03 Writing/blog/Leetcode Contest/test.md"),
    path.join(f.vault, "03 Writing/drafts/test.md"),
  );
  assert.throws(() => planSync(f), /empty/i);
  const removal = planSync({ ...f, allowEmpty: true });
  assert.equal(removal.changes.filter((c) => c.action === "delete").length, 2);
  applySync(removal);
  assert.equal(
    fs.existsSync(f.output("content/blog/Leetcode Contest/test.md")),
    false,
  );
});
test("invalid source does not partially write; missing source never means delete all", (t) => {
  const f = setup(t);
  f.source("one.md", article());
  applySync(planSync(f));
  f.source("two.md", article("![[missing.png]]"));
  assert.throws(() => planSync(f), /missing/i);
  assert.equal(fs.existsSync(f.output("content/blog/two.md")), false);
  fs.rmSync(path.join(f.vault, "03 Writing/blog"), { recursive: true });
  assert.throws(() => planSync(f), /ENOENT/);
  assert.ok(fs.existsSync(f.output("content/blog/one.md")));
});
test("manual output edits and source changes since plan are conflicts", (t) => {
  const f = setup(t);
  f.source("one.md", article());
  applySync(planSync(f));
  f.write(f.output("content/blog/one.md"), "manual change");
  assert.throws(() => planSync(f), /conflict/i);
  f.write(f.output("content/blog/one.md"), article());
  const p = planSync(f);
  f.source("one.md", article("updated"));
  assert.throws(() => applySync(p), /changed/i);
});
test("normalized route collisions, draft metadata, note embeds, invalid dates fail", (t) => {
  const f = setup(t);
  f.source("My Post.md", article());
  f.source("my-post.md", article());
  assert.throws(() => planSync(f), /collision/i);
  fs.rmSync(path.join(f.vault, "03 Writing/blog/my-post.md"));
  for (const s of [
    article("ok", "draft: false\n"),
    article("![[Note]]"),
    article().replace("2026-09-20", "2026-02-30"),
  ]) {
    f.source("My Post.md", s);
    assert.throws(() => planSync(f));
  }
});
test("legacy assets, markdown references, shared images and unsafe paths", (t) => {
  const f = setup(t);
  f.write(path.join(f.vault, "_assets/one-banner.png"), "banner");
  f.write(path.join(f.vault, "_assets/shared.png"), "shared");
  f.source(
    "one.md",
    article("![diagram][fig]\n\n[fig]: shared.png").replace(
      "image: ''",
      "image: /images/blog/one/banner.png",
    ),
  );
  applySync(planSync(f));
  assert.ok(fs.existsSync(f.output("public/images/blog/one/banner.png")));
  assert.match(
    fs.readFileSync(f.output("content/blog/one.md"), "utf8"),
    /\/images\/blog\/one\/shared.png/,
  );
  f.source("one.md", article("![bad](../../../../secret.png)"));
  assert.throws(() => planSync(f), /outside|unsafe/i);
});
test("nested same filenames stay distinct; renaming removes old files", (t) => {
  const f = setup(t);
  f.source("a/post.md", article());
  f.source("b/post.md", article());
  applySync(planSync(f));
  fs.renameSync(
    path.join(f.vault, "03 Writing/blog/a/post.md"),
    path.join(f.vault, "03 Writing/blog/a/new.md"),
  );
  const p = planSync(f);
  assert.deepEqual(p.changes.map((c) => c.action).sort(), ["add", "delete"]);
  applySync(p);
  assert.equal(planSync(f).changes.length, 0);
});
test("inline code, remote images, HTML images, alt text and legacy bootstrap are handled", (t) => {
  const f = setup(t);
  f.write(path.join(f.vault, "_assets/photo.png"), "photo");
  f.source(
    "中文/Article.md",
    article(
      '`![[not-an-image.png]]`\n\n![[photo.png|Caption]]\n\n<img src="photo.png" alt="photo" />\n\n![remote](https://example.com/photo.png)',
    ),
  );
  f.write(
    f.output("content/blog/old.md"),
    article("![photo](/images/blog/old/photo.png)"),
  );
  f.write(f.output("public/images/blog/old/photo.png"), "old");
  const p = planSync(f);
  assert.ok(p.manifest.withdrawn.includes("/blog/old"));
  applySync(p);
  const s = fs.readFileSync(f.output("content/blog/中文/Article.md"), "utf8");
  assert.match(s, /Caption/);
  assert.match(s, /`!\[\[not-an-image.png\]\]`/);
  assert.match(s, /https:\/\/example.com/);
  assert.equal(
    fs.existsSync(f.output("public/images/blog/old/photo.png")),
    false,
  );
});
test("ambiguous assets, malformed metadata, symlinks and reserved routes are rejected", (t) => {
  const f = setup(t);
  f.write(path.join(f.vault, "_assets/a/photo.png"), "a");
  f.write(path.join(f.vault, "_assets/b/photo.png"), "b");
  f.source("one.md", article("![[photo.png]]"));
  assert.throws(() => planSync(f), /ambiguous/);
  const invalid = [
    article().replace("tags: [Test]", "tags: nope"),
    article().replace("category: 技術", "category: 42"),
    article().replace("title: Example", "title: ''"),
    article("body", "path: /custom\n"),
    article("body", "language: bad_value\n"),
    article().replace("image: ''", "image: 42"),
    article().replace("title: Example", "title: [broken"),
  ];
  for (const raw of invalid) {
    f.source("one.md", raw);
    assert.throws(() => planSync(f));
  }
  f.source("one.md", article());
  fs.symlinkSync("/tmp", path.join(f.vault, "03 Writing/blog/link"));
  assert.throws(() => planSync(f), /symlink/);
  fs.unlinkSync(path.join(f.vault, "03 Writing/blog/link"));
  f.source("index.md", article());
  assert.throws(() => planSync(f), /collision/);
});
test("filesystem failure rolls back already-written output and keeps manifest", (t) => {
  const f = setup(t);
  f.source("one.md", article());
  applySync(planSync(f));
  const before = fs.readFileSync(f.output(".blog-sync/manifest.json"), "utf8");
  f.source("one.md", article("changed"));
  f.source("two.md", article());
  const p = planSync(f);
  const original = fs.renameSync;
  t.mock.method(fs, "renameSync", (from, to) => {
    if (to.endsWith("/two.md")) throw new Error("simulated disk error");
    return original(from, to);
  });
  assert.throws(() => applySync(p), /simulated disk error/);
  assert.equal(
    fs.readFileSync(f.output("content/blog/one.md"), "utf8"),
    article(),
  );
  assert.equal(
    fs.readFileSync(f.output(".blog-sync/manifest.json"), "utf8"),
    before,
  );
});
test('callout-looking prose outside a blockquote remains literal', t => {
  const f = setup(t);
  f.source('one.md', article('[!note] literal prose\n\n> [!tip] Callout'));
  const p = planSync(f);
  const text = p.desired['content/blog/one.md'].toString();
  assert.match(text, /\[!note\] literal prose/);
  assert.match(text, /\*\*Tip: Callout\*\*/);
});
