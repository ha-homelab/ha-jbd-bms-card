import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function verifyBrowserCoverage(environment, targets) {
  for (const key of ["CHECKS_RESULT", "HACS_RESULT", "BROWSER_RESULT"]) {
    assert.equal(environment[key], "success", `${key} must succeed; skipped/cancelled work is not coverage`);
  }
  const coverage = JSON.parse(environment.BROWSER_COVERAGE || "null");
  assert.ok(coverage && coverage.schema === 1, "Missing browser coverage receipt");
  assert.equal(coverage.status, "selected-targets-passed");
  assert.equal(coverage.hostedRunnersEnabled, true, "Native Windows/macOS coverage requires hosted targets");
  assert.equal(coverage.platformScope, "all");
  assert.equal(coverage.requestedScope, "all");
  assert.equal(coverage.releaseChannel, "", "This five-target baseline is not release qualification");
  assert.deepEqual(coverage.skippedTargets, [], "Required platforms must not be omitted");
  assert.ok(Array.isArray(coverage.selectedTargetIds), "Missing target identities");
  assert.deepEqual([...coverage.selectedTargetIds].sort(), targets.map(({ id }) => id).sort(), "Every declared target must pass exactly once");
  return coverage;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const targets = JSON.parse(readFileSync(new URL("../.github/browser-compatibility.json", import.meta.url)));
  verifyBrowserCoverage(process.env, targets);
  console.log(`CI gate passed: unit/package checks, HACS, and all ${targets.length} browser targets.`);
}
