# User guides in 24 languages

English is the canonical language. Each guide covers HACS and manual installation, a working configuration example, automatic language selection and overrides, ESPHome deployment, and measurement-quality limits. These guides match all supported interface languages.

Detailed technical references remain in English. This is a complete set of translated quickstarts, not a claim that every technical reference has been translated. All 24 interface languages require version **0.2.0 or newer**; check the [published release notes](https://github.com/ha-homelab/ha-jbd-bms-card/releases) before downloading.

- [English](README.en.md) — `en`
- [العربية](README.ar.md) — `ar`
- [বাংলা](README.bn.md) — `bn`
- [Čeština](README.cs.md) — `cs`
- [Deutsch](README.de.md) — `de`
- [Español](README.es.md) — `es`
- [فارسی](README.fa.md) — `fa`
- [Français](README.fr.md) — `fr`
- [עברית](README.he.md) — `he`
- [हिन्दी](README.hi.md) — `hi`
- [Bahasa Indonesia](README.id.md) — `id`
- [Italiano](README.it.md) — `it`
- [日本語](README.ja.md) — `ja`
- [한국어](README.ko.md) — `ko`
- [Nederlands](README.nl.md) — `nl`
- [Polski](README.pl.md) — `pl`
- [Português](README.pt.md) — `pt`
- [Русский](README.ru.md) — `ru`
- [ไทย](README.th.md) — `th`
- [Türkçe](README.tr.md) — `tr`
- [Українська](README.uk.md) — `uk`
- [Tiếng Việt](README.vi.md) — `vi`
- [简体中文](README.zh-Hans.md) — `zh-Hans`
- [繁體中文](README.zh-Hant.md) — `zh-Hant`

## Detailed references

- [Main README](../../README.md)
- [Configuration and data semantics](../configuration.md)
- [Language selection and translation contributions](../i18n.md)
- [HACS installation, migration and publication](../hacs.md)
- [ESPHome deployment without Victron or Cerbo GX](../esphome-deployment.md)
- [Echo Dot Bluetooth feasibility](../echo-dot-bluetooth.md)

## Correct or add a guide

Use the [English guide](README.en.md) as the technical source. Keep YAML keys, example entity IDs, resource paths and link targets unchanged. Translate the explanatory text and use the matching locale code in the explicit language-override example. Preserve the distinction between available entities and fresh physical measurements. Do not add private device addresses, credentials or real battery data.

After adding a UI locale, add its guide here and link it from the main README. Run `npm run check:docs` to check local links, guide coverage, code fences and configuration parity. Automated checks do not replace native-speaker review; wording corrections are welcome.
