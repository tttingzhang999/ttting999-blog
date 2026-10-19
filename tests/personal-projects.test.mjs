import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { projects as zh } from '../data/projects-zh-TW.ts';
import { projects as en } from '../data/projects-en.ts';
import { projects as ja } from '../data/projects-ja.ts';
import { projects as legacy } from '../data/projects.ts';

test('every portfolio dataset contains only personal projects', () => {
  const personal = new Set(['moniit-asset-management', 'wedding', 'eatswiper', 'aws-diagram', 'promptlingo']);
  for (const projects of [zh, en, ja, legacy]) {
    assert.ok(projects.length > 0);
    assert.ok(projects.every(project => personal.has(project.id)));
  }
  for (const projects of [zh, en, ja]) {
    assert.deepEqual(new Set(projects.map(project => project.id)), personal);
  }
});

test('new projects have usable galleries and only public destination links', () => {
  for (const projects of [zh, en, ja, legacy]) {
    for (const id of ['wedding', 'aws-diagram']) {
      const project = projects.find(project => project.id === id);
      assert.ok(project, `${id} must be present`);
      assert.ok(project.description && project.highlights.length >= 3);
      assert.ok(project.images?.length >= 2);
      for (const image of project.images) {
        assert.ok(existsSync(new URL(`../public${image}`, import.meta.url)), image);
      }
    }
    assert.equal(projects.find(project => project.id === 'wedding').github, undefined);
    assert.equal(projects.find(project => project.id === 'wedding').demo, 'https://wedding.tttingzhang999.com/');
    assert.equal(projects.find(project => project.id === 'aws-diagram').github, 'https://github.com/tttingzhang999/aws-diagram');
  }
});

test('employer screenshots and logos are absent from public assets', () => {
  for (const directory of ['csms', 'pv-ems', 'salesplatform']) {
    assert.equal(existsSync(new URL(`../public/images/projects/${directory}`, import.meta.url)), false);
  }
});
