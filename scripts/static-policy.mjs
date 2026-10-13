import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// vercel.json remains the single policy source while both hosts are supported.
export function staticPolicy(policy) {
  const headers = policy.headers.map(({ source, headers }) => {
    // Only translate the existing suffix wildcard, not arbitrary Vercel regexes.
    assert.ok(/^\/(?:[\w/-]+\/)?\(\.\*\)$/.test(source), `Unsupported header pattern: ${source}`);
    return [source.replace('(.*)', '*'), ...headers.map(({ key, value }) => `  ${key}: ${value}`)].join('\n');
  }).join('\n\n') + '\n';
  const redirects = policy.redirects.map(({ source, destination, permanent }) => {
    assert.ok(/^\/[\w/-]+$/.test(source) && /^\/[\w/-]+$/.test(destination), 'Only literal redirect paths are supported');
    assert.equal(typeof permanent, 'boolean');
    return `${source} ${destination} ${permanent ? 308 : 307}`;
  }).join('\n') + '\n';
  return { headers, redirects };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { headers, redirects } = staticPolicy(JSON.parse(await readFile('vercel.json', 'utf8')));
  await writeFile('.output/public/_headers', headers);
  await writeFile('.output/public/_redirects', redirects);
}
