# Troubleshooting

Use this guide with the [configuration reference](configuration.md) and [runbook](runbook.md). Keep physical BMS/inverter protections active; this card only displays data.

## The card does not load

1. Check that the installed release supports the configured features. `virtual_batteries` is absent from 0.2.0-beta.1.
2. Confirm one JavaScript **module** resource exists: the manual `/local/ha-jbd-bms-card.js` URL or HACS `/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js` URL.
3. Open that resource in the same authenticated HA browser. A login page, 404, HTML error or blocked URL is not JavaScript.
4. Remove duplicate resource registrations, then reload. For a manual update, change the version query and hard-reload. Follow [HACS migration](hacs.md#move-from-a-manual-installation-to-hacs) when switching installers.
5. For “Custom element doesn't exist”, inspect the browser console for the first module-loading or syntax error. Record the card release and browser version.

Creating `/config/www` for the first time needs one HA restart. Replacing an existing resource normally needs a browser reload, not a restart.

## The bank voltage is blank, or seems wrong

- With **derived voltage**, every physical pack needs a valid positive voltage in V/mV (or no unit). Check each member's exact entity state and unit. An unavailable member intentionally prevents a partial sum.
- With an explicit group `voltage`, inspect that sensor. The card will not switch to a sum when it fails.
- Check that a BMS appears exactly once in its group. Match each entity to the correct device; similar BMS names on two ESP32 monitors can be misleading.
- Do not put an already-aggregated string voltage in a physical pack's `voltage` field. That would count the string again.
- `nominal_voltage` is a label, not the measured voltage. A 48 V-class four-pack LiFePO₄ bank is nominally 51.2 V; its operating measurement can differ.
- Verify units upstream rather than renaming a 13,200 mV value to “V”. Correct 13,200 mV and 13.2 V describe the same measurement.

## Current, power or SOC is blank

Group current and SOC need explicitly mapped sources. They are deliberately not synthesized from member readings. In series, current and Ah do not add; averaging member SOC does not establish bank SOC.

Without explicit power, a V × I estimate needs valid group voltage and explicit group current. A configured-but-unavailable power sensor remains missing. Verify current units and sign convention upstream. Member minimum/range SOC diagnostics need **every** member SOC to be valid, and are not equivalent to group SOC.

## Cell spread is missing even though most cells are visible

One missing, zero, malformed, nonfinite or unsupported-unit cell invalidates complete-cell minimum/maximum/spread. Check all configured cells. The card retains the remaining visible readings to help locate the problem; it never treats the missing cell as zero or reports a reassuring zero spread.

A missing cell does not automatically invalidate a separately valid pack-voltage entity. The voltage sum and cell statistics describe different inputs. If your installation requires a single all-fields-valid decision, provide an upstream validated availability gate.

## Everything in a pack or bank disappears

Inspect its `availability` entity. Allowed states are `on`, `online`, `true`, `connected`; other/missing states deny measurements. A group gate also hides its children. Confirm that the gate measures the intended condition and has not been configured with inverted meaning.

An ESP32 MQTT LWT is a transport indicator. It does not prove every BMS connection or each field is current. Do not bypass a gate merely to make numbers reappear; repair the upstream validity/expiry contract if it is incorrect.

## Values look plausible but may be old

The frontend cannot establish sample age from separate entity values. MQTT retained values may survive device disconnection; unchanged measurements can make HA timestamps misleading. Inspect producer connectivity, BMS readiness, boot/sequence metadata and configured expiry upstream. Use the firmware [telemetry contract](https://github.com/victron-venus/esphome-jbd-bms-mqtt/blob/main/docs/battery-telemetry.md) for consumers that need stronger guarantees.

## Wrong colors or unexpected range

Set `thresholds.cell_min` / `cell_max` for the actual chemistry and display intent. These are **per-cell volts**, while `voltage_range` is the group/pack **total volts**. Spread thresholds are **millivolts**. Thresholds inherit top level → group → pack. A pack override can therefore differ from the group summary's thresholds.

A group nominal/range does not automatically divide itself among physical packs. The card does not infer chemistry or safe charge limits. Inspect the configured display values instead of changing BMS settings to match a color.

## Wrong language, duplicate entities, or cramped layout

Use `language: auto` to follow the HA profile, or a supported fixed language code. YAML names are literal and never translated; detailed technical docs remain English. See [language rules](i18n.md).

If both MQTT and native ESPHome integrations expose the same battery, select a consistent set and verify its device identity before editing the card. Do not delete active discovery records merely to make names simpler.

Use a full-width Panel view for several series groups or many cells. A narrow sidebar can legitimately collapse into one column. Test the desired HA theme and phone width; do not infer a broken sensor from a wrapped label.

## Reporting a reproducible issue

Include card release/commit, HA version, browser/OS, installation method, sanitized card YAML, relevant entity states **and units**, expected result, actual result and a screenshot. State whether data is synthetic or live. Include only the smallest affected group. Remove credentials, tokens, Bluetooth addresses and unrelated private information before sharing. The [synthetic demo](../demo/index.html) can distinguish rendering problems from HA/source problems without exposing live telemetry.
