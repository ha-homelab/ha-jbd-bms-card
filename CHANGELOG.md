# Changelog

## 0.2.0

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
