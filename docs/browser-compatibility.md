# Browser compatibility checks

Every pull request, main-branch push and manual CI run executes the actual root
`ha-jbd-bms-card.js` in five required browser/OS targets:

- Ubuntu: Chromium, Firefox and WebKit.
- Windows Server 2022: Chromium.
- macOS 15: WebKit.

The [inventory](../.github/browser-compatibility.json) pins Playwright 1.64.0
and each bundled browser version. Its separate, integrity-locked
[toolchain](../tools/browser-compatibility/playwright-1-64-0/package-lock.json)
does not add a runtime dependency to the card. This is a five-target baseline;
it does not claim Safari application, mobile device, or the shared toolkit's
35-target release qualification.

## What runs

The [browser acceptance script](../scripts/browser-acceptance.cjs) serves a
synthetic Home Assistant fixture and the unchanged distributable from an
ephemeral loopback HTTP server. It checks eight batteries and 32 cells at
desktop and 320-pixel widths in light/dark themes, missing and unavailable data,
zero SOC, negative current, V/mV conversion, and incomplete cell statistics.
Click, Enter and Space must open the correct more-info event; relevant updates
must preserve keyboard focus, while unrelated updates must preserve the DOM.
Profile language changes and overrides are exercised separately from literal
device labels. Unexpected external requests or browser errors fail the run.

The fixture contains no real device addresses, telemetry or credentials and
does not contact a live Home Assistant instance. The workflow does not install
the card, publish a release, or change production devices.

## Workflow and evidence

The [CI workflow](../.github/workflows/ci.yml) calls the shared
[`typescript-ci.yml` at `94b1116`](https://github.com/victron-venus/venus-os-ci-toolkit/blob/94b1116449af128810b86f4c0c723602be17b372/.github/workflows/typescript-ci.yml).
That revision includes the reviewed hosted Ubuntu dependency-installation fix.
Its runtime verification records the actual OS, browser engine/version,
Playwright version, source commit and workflow attempt. The application adds
the tested JavaScript SHA-256 and the successful scenario names.
Checkout preserves LF line endings on every platform; the test compares the
served JavaScript with its Git blob before launching a browser, so Windows
cannot silently validate a CRLF-transformed copy.

Each target uploads `browser-compatibility-<target>-<attempt>` artifacts for
14 days, including its runtime/result receipts and synthetic screenshots and
trace. Failure details are retained when the test reaches the fixture. A setup
failure is a failed target, not a passing application test.

The always-running **CI gate** requires the existing unit/package and HACS
checks plus the browser job. It also checks the shared coverage receipt:
exactly the five declared targets must pass, with no omitted platforms.
Failures, cancellations, skipped jobs, partial Linux-only coverage and missing
receipts are rejected. Repository protection continues to require the same
GitHub Actions check.

## Maintain the baseline

Run `npm run check:ci` and `actionlint .github/workflows/ci.yml` when changing
CI. The local contracts check the inventory, isolated lock, required workflow
wiring, and rejection of invalid gate receipts; they do not launch browsers.
The remote five-target run is the browser compatibility evidence.

Update the reviewed workflow SHA, Playwright lock, expected browser versions
and contracts together when changing the toolchain. Do not relabel a failed
target as extended or remove it to obtain a passing gate. Inspect the target's
retained diagnostics, fix the test or application defect, and rerun the required
targets for the final revision.
