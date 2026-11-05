import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const caller = readFileSync(new URL('../.github/workflows/auto-approve.yml', import.meta.url), 'utf8');
const immutableCall = /^    uses: victron-venus\/venus-os-ci-toolkit\/\.github\/workflows\/auto-approve-reusable\.yml@[0-9a-f]{40}(?:[ \t]+#[^\r\n]*)?$/gm;

function boundaryProblems(text) {
  const problems = [];
  if ([...text.matchAll(immutableCall)].length !== 1) problems.push('immutable shared workflow');
  const jobs = [...(text.split('\njobs:\n')[1] ?? '').matchAll(/^  ([\w-]+):$/gm)].map(match => match[1]);
  if (JSON.stringify(jobs) !== JSON.stringify(['auto-approve'])) problems.push('only approval job');
  if (/^\s*(?:-\s*)?(?:steps|run|runs-on|container|services):/m.test(text)) problems.push('no local execution');
  if (/^\s*secrets:\s*inherit\s*$/m.test(text)) problems.push('explicit secrets');
  const secrets = [...text.matchAll(/^      (\w+): \$\{\{ secrets\.(\w+) \}\}$/gm)].map(match => match.slice(1)).sort();
  if (JSON.stringify(secrets) !== JSON.stringify([['APPROVAL_PAT', 'APPROVAL_PAT'], ['BOT_PAT', 'BOT_PAT']])) problems.push('reviewer secrets only');
  return problems;
}

test('approval caller confines credentials to immutable shared code', () => {
  assert.deepEqual(boundaryProblems(caller), []);
  assert.match(caller, /permissions:\n  contents: read\n  pull-requests: write\n/);
  assert.match(caller, /github\.event\.pull_request\.base\.ref == github\.event\.repository\.default_branch/);
  assert.match(caller, /!github\.event\.pull_request\.draft/);
});

test('floating references and uncommented suffixes fail the boundary', () => {
  for (const replacement of ['main', `${'a'.repeat(40)} extra`]) {
    assert.ok(boundaryProblems(caller.replace(/(?<=\.yml@)[0-9a-f]{40}/, replacement)).includes('immutable shared workflow'));
  }
});

test('local execution and inherited credentials fail the boundary', () => {
  assert.ok(boundaryProblems(`${caller}\n    steps:\n      - run: echo unsafe\n`).includes('no local execution'));
  assert.ok(boundaryProblems(caller.replace('    secrets:\n', '    secrets: inherit\n')).includes('explicit secrets'));
  assert.ok(boundaryProblems(`${caller}\n  extra:\n    run: echo unsafe\n`).includes('only approval job'));
});

test('unexpected secret forwarding fails the boundary', () => {
  assert.ok(boundaryProblems(`${caller}      EXTRA: \u0024{{ secrets.EXTRA }}\n`).includes('reviewer secrets only'));
});
