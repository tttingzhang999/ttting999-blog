import { readFile, access, writeFile } from 'node:fs/promises';
import { publishedRoutes } from './published-routes.mjs';

const manifest = JSON.parse(await readFile('.blog-sync/manifest.json', 'utf8'));
const routes = publishedRoutes(manifest);
for (const route of routes) await access(`.output/public${route}/index.html`);
await writeFile('.output/published-routes.json', JSON.stringify(routes, null, 2) + '\n');
console.log(`Counter allowlist verified against ${routes.length} generated article routes.`);
