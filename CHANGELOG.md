# Changelog

## 0.3.0

Stable release of virtual series batteries and the 24-language interface. Promotes the verified 0.3.0-rc.1 feature set; the JavaScript differs only in its version constant.

- Group configurable physical packs into independent virtual series while retaining every pack and cell, nominal voltage metadata and display thresholds.
- Use complete-only derived voltages, explicit upstream bank sensors, separate lowest-member SOC diagnostics and unavailable-data handling.
- Follow the Home Assistant profile language automatically, with per-card overrides and RTL support.
- Include illustrated configuration, eight YAML examples, screenshots, ESPHome deployment guidance, troubleshooting and an operations runbook.
- Preserve existing flat `batteries` configurations. Install through the HACS custom repository or the published JavaScript asset.

## 0.3.0-rc.1

Release candidate for virtual series batteries. Promotes the beta feature set with no runtime behavior changes; only the embedded version and package metadata change. This remains an opt-in prerelease.

## 0.3.0-beta.1

First beta of virtual series batteries. This opt-in prerelease leaves 0.1.0 as the latest stable release.

- Add virtual series groups containing one or more physical packs, preserving every physical cell and the legacy flat configuration.
- Sum only complete member voltages; support explicit upstream bank voltage/current/power/SOC, labelled power estimation, and separate lowest-member SOC/range diagnostics. Never sum series current/Ah or average member SOC.
- Add group/pack nominal voltages, display ranges, inherited thresholds, group availability gates, normalized voltage/current/power units, and complete-cell group statistics.
- Add configurable one-through-five-pack synthetic demos, independent strings, other cell counts/chemistries and failure cases.
- Document architecture and missing-data semantics with SVG diagrams, voltage chart, example YAML, setup, troubleshooting and operations runbook; update all 24 localized quickstarts with the virtual-series model.

## 0.2.0-beta.1

First prerelease of the 0.2 series. This beta introduces the changes below;
the latest stable release remains 0.1.0.

- Add 24 complete, bundled language packs with English canonical source and fallback.
- Follow the Home Assistant profile automatically; support optional card overrides and regional Chinese/script mappings.
- Localize labels, default names, status, configuration errors, picker description and accessibility text.
- Add Arabic, Persian and Hebrew RTL layout with isolated numeric values and units.
- Add deterministic translation generation and tests for every language, safe interpolation, regional fallback and live profile changes.
- Add installation and configuration guides in all 24 supported languages, plus HACS publishing, ESPHome deployment and Echo Dot Bluetooth compatibility documentation.
- Require official HACS plugin validation and documentation link checks in CI.
- Exercise the distributable in five required browser/OS targets using synthetic data, with recorded runtime identities, failure diagnostics and complete-coverage enforcement in CI.

## 0.1.0

- Responsive battery overview with charge rings, voltage, optional current/power/temperature, and individual cell voltage bars.
- Multiple chains using explicit HA entity IDs, configurable display thresholds, V/mV conversion, complete-cell min/max/spread.
- English/Russian text, Home Assistant themes, keyboard-accessible more-info dialogs.
- Unavailable values remain missing; optional per-battery availability gating and explicit freshness limitation.
- Dependency-free distributable, HACS custom repository manifest, synthetic demo and regression tests.
