import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import slugify from "slugify";
import { blogSlugifyOptions } from "../../utils/blog/path.ts";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { inside } from "./files.mjs";

const imageExt = /\.(png|jpe?g|gif|webp|svg|avif)$/i;
const encodePath = (p) => p.split("/").map(encodeURIComponent).join("/");
const escapeHtml = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
// Mirrors @nuxt/content 3.7 path-meta (covered against generated routes at build time).
export function articleRoute(relative) {
  const parts = relative
    .replace(/\.md$/i, "")
    .split("/")
    .map((part) => {
      const name = part.split(":").pop();
      const refined = /^\d+(?:\.\d+)*(?:\.x)?$/.test(name)
        ? name
        : name
            .replace(/(\d+\.)?(.*)/, "$2")
            .replace(/^index(\.draft)?$/, "")
            .replace(/\.draft$/, "");
      const slug = slugify(refined, blogSlugifyOptions);
      if (!slug && name !== "index")
        throw new Error(`Empty route segment: ${relative}`);
      return slug;
    });
  return "/blog/" + parts.join("/").replace(/\/$/, "");
}
export function transformArticle({ vault, relative, raw, assetFiles }) {
  const front = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!front) throw new Error(`${relative}: missing frontmatter`);
  const doc = YAML.parseDocument(front[1]);
  if (doc.errors.length)
    throw new Error(`${relative}: ${doc.errors[0].message}`);
  const meta = doc.toJS();
  if (!meta || typeof meta !== "object" || Array.isArray(meta))
    throw new Error(`${relative}: invalid frontmatter`);
  if ("draft" in meta)
    throw new Error(`${relative}: remove draft; folders determine publication`);
  if (["path", "stem", "id", "extension"].some((k) => k in meta))
    throw new Error(`${relative}: reserved path metadata`);
  for (const k of ["title", "description", "date", "category"])
    if (typeof meta[k] !== "string")
      throw new Error(`${relative}: missing/invalid ${k}`);
  if (!meta.title.trim()) throw new Error(`${relative}: empty title`);
  for (const k of ["date", "updatedAt"])
    if (
      meta[k] !== undefined &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(meta[k]) ||
        new Date(meta[k]).toISOString().slice(0, 10) !== meta[k])
    )
      throw new Error(`${relative}: invalid ${k}`);
  if (!Array.isArray(meta.tags) || meta.tags.some((x) => typeof x !== "string"))
    throw new Error(`${relative}: invalid tags`);
  for (const k of ["image", "author"])
    if (meta[k] !== undefined && typeof meta[k] !== "string")
      throw new Error(`${relative}: invalid ${k}`);
  if (
    meta.language !== undefined &&
    !/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(meta.language)
  )
    throw new Error(`${relative}: invalid language`);
  const body = raw.slice(front[0].length),
    stem = relative.replace(/\.md$/i, ""),
    base = path.posix.basename(stem);
  const assets = {};
  function imageUrl(url) {
    if (/^https?:\/\//i.test(url)) return url;
    const decoded = decodeURIComponent(url);
    if (!imageExt.test(decoded))
      throw new Error(`${relative}: unsupported image or note embed: ${url}`);
    let source, destination;
    if (decoded.startsWith("/images/blog/")) {
      const rel = decoded.slice("/images/blog/".length);
      inside(vault, "_assets/" + rel);
      const legacy = rel.replaceAll("/", "-");
      const matches = assetFiles.filter(
        (p) => p === rel || path.posix.basename(p) === legacy,
      );
      if (matches.length !== 1)
        throw new Error(`${relative}: missing/ambiguous image ${url}`);
      source = "_assets/" + matches[0];
      destination = "public" + decoded;
    } else {
      if (/^[a-z]+:|^\/|\\/i.test(decoded))
        throw new Error(`${relative}: unsafe image ${url}`);
      const local = path.posix.normalize(
        path.posix.join(
          "03 Writing/blog",
          path.posix.dirname(relative),
          decoded,
        ),
      );
      inside(vault, local);
      const matches = fs.existsSync(inside(vault, local))
        ? [local]
        : assetFiles
            .filter((p) => p === decoded || path.posix.basename(p) === decoded)
            .map((p) => "_assets/" + p);
      if (matches.length !== 1)
        throw new Error(`${relative}: missing/ambiguous image ${url}`);
      source = matches[0];
      const name = path.posix
        .basename(decoded)
        .replace(
          new RegExp("^" + base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "-"),
          "",
        );
      destination = `public/images/blog/${stem}/${name}`;
    }
    const bytes = fs.readFileSync(inside(vault, source));
    if (assets[destination] && !assets[destination].bytes.equals(bytes))
      throw new Error(`${relative}: image collision ${destination}`);
    assets[destination] = { source, bytes };
    return encodePath(destination.slice("public".length));
  }
  if (meta.image) doc.set("image", imageUrl(meta.image));
  const tree = unified().use(remarkParse).use(remarkGfm).parse(body);
  const edits = [];
  const imageDefinitions = new Set();
  function collect(n) {
    if (n.type === "imageReference") imageDefinitions.add(n.identifier);
    n.children?.forEach(collect);
  }
  collect(tree);
  function visit(n, inQuote = false) {
    const start = n.position?.start.offset,
      end = n.position?.end.offset;
    const original = body.slice(start, end);
    if (n.type === "image") {
      const url = imageUrl(n.url);
      edits.push({
        start,
        end,
        text: `![${(n.alt || "").replaceAll("]", "\\]")}](${url}${n.title ? " " + JSON.stringify(n.title) : ""})`,
      });
    } else if (n.type === "definition" && imageDefinitions.has(n.identifier)) {
      edits.push({
        start,
        end,
        text: `[${n.label || n.identifier}]: ${imageUrl(n.url)}${n.title ? " " + JSON.stringify(n.title) : ""}`,
      });
    } else if (n.type === "text") {
      const text = original
        .replace(/(?<!\\)(!)?\[\[([^\]\n]+)\]\]/g, (_, embed, inner) => {
          const [target, alias] = inner.split("|");
          if (!embed) return alias || target;
          const url = imageUrl(target);
          if (alias && /^\d+$/.test(alias))
            return `<img src="${escapeHtml(url)}" width="${alias}" alt="${escapeHtml(path.posix.basename(target))}" />`;
          return `![${(alias || path.posix.basename(target)).replaceAll("]", "\\]")}](${url})`;
        })
        .replace(
          /^\[!([\w-]+)\][+-]?(?:[ \t]+([^\n]+))?/,
          (match, type, title) => !inQuote ? match :
            `**${type[0].toUpperCase() + type.slice(1)}${title ? ": " + title : ""}**`,
        );
      if (text !== original) edits.push({ start, end, text });
    } else if (n.type === "html") {
      const text = original.replace(
        /(<img\b[^>]*?\bsrc=)(["'])(.*?)\2/gi,
        (_, prefix, quote, url) =>
          prefix + quote + escapeHtml(imageUrl(url)) + quote,
      );
      if (text !== original) edits.push({ start, end, text });
    }
    n.children?.forEach(child => visit(child, inQuote || n.type === "blockquote"));
  }
  visit(tree);
  const transformed = edits
    .sort((a, b) => b.start - a.start)
    .reduce((s, e) => s.slice(0, e.start) + e.text + s.slice(e.end), body);
  // Preserve the original YAML formatting unless an image path actually changes.
  const metadata =
    meta.image && doc.get("image") !== meta.image
      ? `---\n${doc.toString()}---\n`
      : front[0];
  return {
    markdown: metadata + transformed,
    assets,
    route: articleRoute(relative),
  };
}
