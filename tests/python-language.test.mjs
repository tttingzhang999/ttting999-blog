import test from "node:test";
import assert from "node:assert/strict";
import { unified } from "unified";
import remarkParse from "remark-parse";
import pythonLanguage from "../utils/markdown/python-language.mjs";

test("normalizes Python fences, including nested blocks, without changing source nodes", async () => {
  const processor = unified().use(remarkParse).use(pythonLanguage);
  const tree = processor.parse('```Python\nprint("hello")\n```\n\n> ```Python\n> pass\n> ```');
  const original = structuredClone(tree);
  const result = await processor.run(tree);
  assert.equal(result.children[0].lang, "python");
  assert.equal(result.children[1].children[0].lang, "python");
  assert.equal(result.children[0].value, 'print("hello")');
  assert.deepEqual(tree, original);
});

test("preserves other languages, metadata, plain code and inline code", async () => {
  const processor = unified().use(remarkParse).use(pythonLanguage);
  for (const language of ["python", "bash", "", "unknown"]) {
    const tree = processor.parse(`\`\`\`${language} [example]\nPython\n\`\`\`\n\n\`Python\``);
    assert.deepEqual(await processor.run(tree), tree);
  }
});
