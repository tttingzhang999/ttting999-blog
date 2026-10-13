import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parse } from 'yaml';

const notification = parse(await readFile('.github/workflows/notify-infra.yml', 'utf8'));
const script = notification.jobs.notify.steps.find(step => step.id === 'verify').with.script;
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const sha = 'a'.repeat(40);
const run = () => ({ id: 12, status: 'completed', conclusion: 'success', event: 'push', head_branch: 'main', head_sha: sha, path: '.github/workflows/ci.yml', repository: { full_name: 'tttingzhang999/ttting999-blog' }, head_repository: { full_name: 'tttingzhang999/ttting999-blog' } });
const artifact = () => ({ id: 34, name: 'blog-release', expired: false, size_in_bytes: 1000, digest: `sha256:${'b'.repeat(64)}`, expires_at: '2099-01-01T00:00:00Z', workflow_run: { id: 12, head_sha: sha, head_branch: 'main' } });
async function verify({ eventRun = run(), apiRun = run(), artifacts = [artifact()] } = {}) {
  const outputs = {};
  const github = { rest: { actions: {
    getWorkflowRun: async () => ({ data: apiRun }),
    listWorkflowRunArtifacts: async () => ({ data: { total_count: artifacts.length, artifacts } }),
  } } };
  await new AsyncFunction('github', 'context', 'core', script)(github, { repo: { owner: 'tttingzhang999', repo: 'ttting999-blog' }, payload: { workflow_run: eventRun } }, { setOutput: (key, value) => { outputs[key] = value; } });
  return outputs;
}
test('only exact completed trusted source produces five-field dispatch identity', async () => {
  const result = await verify();
  assert.deepEqual(JSON.parse(result.payload), { source_repository: 'tttingzhang999/ttting999-blog', source_sha: sha, run_id: 12, artifact_id: 34, artifact_digest: `sha256:${'b'.repeat(64)}` });
});
for (const change of [{ event: 'pull_request' }, { head_branch: 'feature' }, { conclusion: 'failure' }, { status: 'in_progress' }, { head_sha: 'main' }, { head_repository: { full_name: 'attacker/fork' } }, { repository: { full_name: 'attacker/fork' } }, { path: 'other.yml' }, { id: -1 }]) {
  test(`reject source ${JSON.stringify(change)}`, async () => { await assert.rejects(verify({ apiRun: { ...run(), ...change } })); });
}
test('reject event/API identity mismatch', async () => { await assert.rejects(verify({ eventRun: { ...run(), head_sha: 'c'.repeat(40) } })); });
for (const change of [{ expired: true }, { expires_at: '2000-01-01' }, { expires_at: 'invalid' }, { size_in_bytes: 104857601 }, { size_in_bytes: 0 }, { digest: 'no-digest' }, { id: 0 }, { name: 'other' }, { workflow_run: { id: 99, head_sha: sha, head_branch: 'main' } }, { workflow_run: { id: 12, head_sha: 'c'.repeat(40), head_branch: 'main' } }]) {
  test(`reject artifact ${JSON.stringify(change)}`, async () => { await assert.rejects(verify({ artifacts: [{ ...artifact(), ...change }] })); });
}
test('reject missing or duplicate artifacts', async () => { await assert.rejects(verify({ artifacts: [] })); await assert.rejects(verify({ artifacts: [artifact(), artifact()] })); });

test('workflow policy keeps public builds unprivileged and uploads activation/main-only', async () => {
  const ciText = await readFile('.github/workflows/ci.yml', 'utf8');
  const ci = parse(ciText);
  assert.deepEqual(Object.keys(ci.on).sort(), ['pull_request', 'push']);
  assert.deepEqual(ci.on.push.branches, ['main']);
  assert.deepEqual(ci.permissions, { contents: 'read' });
  assert.equal(ci.concurrency['cancel-in-progress'], true);
  assert.ok(!/secrets\.|cache:|pull_request_target|schedule:/.test(ciText));
  for (const workflow of [ci, notification]) {
    for (const job of Object.values(workflow.jobs)) {
      assert.equal(job['runs-on'], 'ubuntu-24.04');
      assert.ok(job['timeout-minutes'] > 0 && job['timeout-minutes'] <= 25);
      for (const step of job.steps) {
        if (step.uses) assert.match(step.uses, /^actions\/[a-z-]+@[a-f0-9]{40}$/);
      }
    }
  }
  const job = ci.jobs['test-build'];
  for (const condition of ["github.event_name == 'push'", "github.ref == 'refs/heads/main'", "github.repository == 'tttingzhang999/ttting999-blog'", "vars.INFRA_HANDOFF_ENABLED == 'true'"]) assert.ok(job.env.RELEASE_ENABLED.includes(condition));
  const uploads = job.steps.filter(step => step.uses?.startsWith('actions/upload-artifact@'));
  assert.equal(uploads.length, 1);
  assert.equal(uploads[0].if, "env.RELEASE_ENABLED == 'true'");
  assert.equal(uploads[0].with.path, '.output/blog-release.tar.gz');
  assert.equal(uploads[0].with['retention-days'], 1);
  assert.equal(uploads[0].with['compression-level'], 0);
  assert.equal(job.steps.find(step => step.run === 'node scripts/release-transport.mjs').if, uploads[0].if);
});
test('notifier has no checkout or application execution and scopes token to target only', () => {
  assert.deepEqual(notification.on, { workflow_run: { workflows: ['Blog CI'], types: ['completed'] } });
  assert.deepEqual(notification.permissions, { actions: 'read' });
  assert.ok(notification.jobs.notify.if.includes("vars.INFRA_HANDOFF_ENABLED == 'true'"));
  for (const step of notification.jobs.notify.steps) {
    assert.equal(step.run, undefined);
    assert.ok(!/checkout|download/.test(step.uses));
    if (step.uses.startsWith('actions/github-script@')) assert.equal(step.with.retries, 0);
  }
  const app = notification.jobs.notify.steps.find(step => step.id === 'app');
  assert.equal(app.with.owner, 'tttingzhang999');
  assert.equal(app.with.repositories, 'ttting999-cloudflare-infra');
  assert.equal(app.with['permission-contents'], 'write');
});
test('dispatch sends exact verified payload only to fixed target without retry', async () => {
  const step = notification.jobs.notify.steps.at(-1);
  const payload = { source_repository: 'tttingzhang999/ttting999-blog', source_sha: sha, run_id: 12, artifact_id: 34, artifact_digest: `sha256:${'b'.repeat(64)}` };
  const calls = [];
  const github = { rest: { repos: { createDispatchEvent: async value => { calls.push(value); } } } };
  await new AsyncFunction('github', 'process', step.with.script)(github, { env: { RELEASE_PAYLOAD: JSON.stringify(payload) } });
  assert.deepEqual(calls, [{ owner: 'tttingzhang999', repo: 'ttting999-cloudflare-infra', event_type: 'blog-release', client_payload: payload }]);
});
test('API failures stop handoff and dispatch failures are not retried', async () => {
  const github = { rest: { actions: { getWorkflowRun: async () => { throw new Error('API unavailable'); } } } };
  await assert.rejects(new AsyncFunction('github', 'context', 'core', script)(github,
    { payload: { workflow_run: run() } }, {}), /API unavailable/);
  let calls = 0;
  const dispatch = { rest: { repos: { createDispatchEvent: async () => { calls += 1; throw new Error('Dispatch unavailable'); } } } };
  await assert.rejects(new AsyncFunction('github', 'process', notification.jobs.notify.steps.at(-1).with.script)(dispatch,
    { env: { RELEASE_PAYLOAD: '{}' } }), /Dispatch unavailable/);
  assert.equal(calls, 1);
});
