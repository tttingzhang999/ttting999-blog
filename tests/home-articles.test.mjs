import assert from "node:assert/strict";
import { test } from "node:test";
import { getHomeArticles } from "../utils/home/articles.ts";

test("technical metadata is published, current, ordered and body-free without mutating source", () => {
  const rows = Array.from({ length: 7 }, (_, i) =>
    Object.freeze({
      path: `/blog/${i}`,
      title: `Article ${i}`,
      description: "Summary",
      date: `2026-01-0${i + 1}`,
      category: "技術",

      body: "private body",
    }),
  );
  const input = Object.freeze([
    ...rows,
    { ...rows[0], path: "/blog/life", category: "生活" },
  ]);
  const result = getHomeArticles(input);
  assert.equal(result.all.length, 7);
  assert.equal(result.latest.length, 5);
  assert.equal(result.latest[0].path, "/blog/6");
  assert.equal(result.timeline[0].path, "/blog/0");
  assert.ok(!JSON.stringify(result).includes("private body"));
  assert.equal(input[0].path, "/blog/0");
  assert.equal(
    getHomeArticles([
      ...input,
      { ...rows[0], path: "/blog/new", date: "2026-02-01" },
    ]).latest[0].path,
    "/blog/new",
  );
});
test("empty and invalid entries are safe; equal dates have stable path ordering", () => {
  assert.deepEqual(getHomeArticles([]), { all: [], latest: [], timeline: [] });
  const entry = {
    title: "T",
    path: "/blog/b",
    description: "",
    date: "2026-01-01",
    category: "AI",

  };
  const result = getHomeArticles([
    entry,
    { ...entry, path: "/blog/a" },
    { ...entry, date: "invalid" },
  ]);
  assert.deepEqual(
    result.all.map((row) => row.path),
    ["/blog/a", "/blog/b"],
  );
});
