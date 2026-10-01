import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { projects as zh } from '../data/projects-zh-TW.ts';
import { projects as en } from '../data/projects-en.ts';
import { projects as ja } from '../data/projects-ja.ts';
import { projects as legacy } from '../data/projects.ts';

test('every portfolio dataset contains only personal projects', () => {
  const personal = new Set(['moniit-asset-management', 'eatswiper', 'promptlingo']);
  for (const projects of [zh, en, ja, legacy]) {
    assert.ok(projects.length > 0);
    assert.ok(projects.every(project => personal.has(project.id)));
  }
  for (const projects of [zh, en, ja]) {
    assert.deepEqual(new Set(projects.map(project => project.id)), personal);
  }
});

test('employer screenshots and logos are absent from public assets', () => {
  for (const directory of ['csms', 'pv-ems', 'salesplatform']) {
    assert.equal(existsSync(new URL(`../public/images/projects/${directory}`, import.meta.url)), false);
  }
});
