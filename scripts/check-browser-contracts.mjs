import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { verifyBrowserCoverage } from "./check-browser-coverage.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const targets = JSON.parse(read(".github/browser-compatibility.json"));
const expected = [
  ["ubuntu-latest", "chromium", "156.0.8078.4"],
  ["ubuntu-latest", "firefox", "157.0"],
  ["ubuntu-latest", "webkit", "27.2"],
  ["windows-2022", "chromium", "156.0.8078.4"],
  ["macos-15", "webkit", "27.2"],
];
assert.deepEqual(targets.map(({ os, engine, browser_version }) => [os, engine, browser_version]), expected);
assert.equal(new Set(targets.map(({ id }) => id)).size, 5);
for (const row of targets) {
  assert.equal(row.id, `${row.os}-${row.engine}-1-64-0`);
  assert.equal(row.tier, "required");
  assert.equal(row.playwright, "1.64.0");
  assert.equal(row.toolchain, "tools/browser-compatibility/playwright-1-64-0");
  assert.ok(!row.channel);
}
const toolchain = targets[0].toolchain;
const pkg = JSON.parse(read(`${toolchain}/package.json`));
const lock = JSON.parse(read(`${toolchain}/package-lock.json`));
assert.deepEqual(pkg.dependencies, { playwright: "1.64.0" });
assert.deepEqual(lock.packages[""].dependencies, pkg.dependencies);
assert.deepEqual(Object.keys(lock.packages).sort(), ["", "node_modules/playwright", "node_modules/playwright-core"]);
for (const name of ["playwright", "playwright-core"]) {
  const entry = lock.packages[`node_modules/${name}`];
  assert.equal(entry.version, "1.64.0");
  assert.equal(entry.resolved, `https://registry.npmjs.org/${name}/-/${name}-1.64.0.tgz`);
  assert.match(entry.integrity, /^sha512-[A-Za-z0-9+/]+={0,2}$/);
}

const workflow = read(".github/workflows/ci.yml");
assert.match(workflow, /uses: victron-venus\/venus-os-ci-toolkit\/\.github\/workflows\/typescript-ci\.yml@94b1116449af128810b86f4c0c723602be17b372/);
assert.match(workflow, /force-full: true/);
assert.match(workflow, /browser-platform-scope: all/);
assert.match(workflow, /browser-matrix-file: \.github\/browser-compatibility\.json/);
assert.match(workflow, /browser-test-command: node scripts\/browser-acceptance\.cjs/);
assert.match(workflow, /  gate:\n    name: CI gate\n    if: always\(\)\n    needs: \[checks, hacs, browser-compatibility\]/);
assert.match(workflow, /BROWSER_COVERAGE: \$\{\{ needs\.browser-compatibility\.outputs\.browser-coverage \}\}/);
assert.match(workflow, /run: node scripts\/check-browser-coverage\.mjs/);
assert.doesNotMatch(workflow, /continue-on-error:/);

const coverage = {
  schema: 1, status: "selected-targets-passed", hostedRunnersEnabled: true,
  platformScope: "all", requestedScope: "all", releaseChannel: "",
  selectedTargetIds: targets.map(({ id }) => id), skippedTargets: [],
};
const environment = { CHECKS_RESULT: "success", HACS_RESULT: "success", BROWSER_RESULT: "success", BROWSER_COVERAGE: JSON.stringify(coverage) };
verifyBrowserCoverage(environment, targets);
let rejected = 0;
const rejects = (changed) => { assert.throws(() => verifyBrowserCoverage(changed, targets)); rejected++; };
for (const key of ["CHECKS_RESULT", "HACS_RESULT", "BROWSER_RESULT"]) {
  for (const result of ["failure", "cancelled", "skipped", "", undefined]) rejects({ ...environment, [key]: result });
}
for (const receipt of ["", "not-json", "null", "{}"] ) rejects({ ...environment, BROWSER_COVERAGE: receipt });
for (const changed of [
  { schema: 2 }, { status: "documentation-only" }, { hostedRunnersEnabled: false },
  { platformScope: "linux" }, { requestedScope: "linux" }, { releaseChannel: "stable" },
  { skippedTargets: [{ id: targets[4].id }] },
  { selectedTargetIds: coverage.selectedTargetIds.slice(0, 4) },
  { selectedTargetIds: [...coverage.selectedTargetIds, targets[0].id] },
  { selectedTargetIds: [...coverage.selectedTargetIds.slice(0, 4), "unreviewed-target"] },
]) rejects({ ...environment, BROWSER_COVERAGE: JSON.stringify({ ...coverage, ...changed }) });
console.log(`Browser contracts passed: five pinned targets, isolated lock, required CI wiring; ${rejected} invalid gate receipts rejected.`);
