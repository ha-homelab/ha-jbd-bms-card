# Documentation

Reference material for the read-only Home Assistant card that displays virtual series
batteries, their physical packs and every individual cell, using entities from ESPHome
JBD BMS MQTT or any integration exposing numeric battery sensors.

## Set up and configure

- [HACS installation and publication](hacs.md) — installing as a HACS custom repository and what each release contains.
- [Configuration and data semantics](configuration.md) — the card options, entity mapping and display ranges, with no guessed entity IDs.
- [Virtual batteries: physical packs in series](virtual-batteries.md) — the series-string model, how member voltages sum, and why current and SOC are never averaged.
- [From JBD BMS to this Home Assistant card](esphome-deployment.md) — the monitoring path from BMS to entities without Victron equipment.
- [Operations runbook](runbook.md) — inventorying the physical topology and installing and maintaining the read-only card.
- [Troubleshooting](troubleshooting.md) — the card not loading, missing data and misconfigured entities.

## Reference

- [Languages and translation contributions](i18n.md) — the 24 language packs, automatic selection and the overrides.
- [Visual previews and reproducible screenshots](screenshots.md) — the synthetic demo, its diagrams and the labelling rules for captures.
- [Browser compatibility checks](browser-compatibility.md) — the browser and OS targets every pull request executes the card in.
- [Can a converted Echo Dot replace the ESP32 battery collector?](echo-dot-bluetooth.md) — the BLE proxy assessment and why it cannot poll JBD measurements.

## Translations

- [User guides in 24 languages](translations/README.md) — the translated quickstarts and their language list.
- [JBD Battery & Cell Card — русский язык](README.ru.md) — the Russian introduction, pointing at the full Russian guide.
