import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

export const hash = (value) => createHash("sha256").update(value).digest("hex");
export function inside(root, relative) {
  const target = path.resolve(root, relative);
  if (!target.startsWith(path.resolve(root) + path.sep))
    throw new Error(`Unsafe path outside root: ${relative}`);
  const parts = path.relative(root, target).split(path.sep);
  for (let i = 1; i <= parts.length; i++) {
    const p = path.join(root, ...parts.slice(0, i));
    if (fs.existsSync(p) && fs.lstatSync(p).isSymbolicLink())
      throw new Error(`Unsafe symlink: ${p}`);
  }
  return target;
}
export function files(root, optional = false) {
  if (optional && !fs.existsSync(root)) return [];
  if (fs.lstatSync(root).isSymbolicLink())
    throw new Error(`Unsafe symlink: ${root}`);
  return fs
    .readdirSync(root, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((e) => {
      if (e.name.startsWith(".")) return [];
      if (e.isSymbolicLink()) throw new Error(`Unsafe symlink: ${e.name}`);
      return e.isDirectory()
        ? files(path.join(root, e.name)).map((p) => `${e.name}/${p}`)
        : [e.name];
    });
}
export const readIfExists = (p) =>
  fs.existsSync(p) ? fs.readFileSync(p) : null;
export function atomicWrite(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.sync-${process.pid}`;
  try {
    fs.writeFileSync(temporary, data);
    fs.renameSync(temporary, file);
  } finally {
    if (fs.existsSync(temporary)) fs.rmSync(temporary);
  }
}
