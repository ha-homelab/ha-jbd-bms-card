# Configuration and data semantics

The [virtual battery guide](virtual-batteries.md) explains the physical model and calculation limits. All entity IDs below are illustrative; obtain actual IDs from **Developer Tools → States**. Virtual grouping is a development feature until a release explicitly includes it; 0.2.0-beta.1 supports the legacy flat list only.

## Top level

- `type`: `custom:ha-jbd-bms-card`.
- `title`: optional literal heading; defaults to the localized “Battery atlas”.
- `language`: optional locale override, for example `en`, `de`, `fr-CA`, or `zh-Hant`. Omit it or use `auto` to follow the Home Assistant profile. All 24 [language packs and selection rules](i18n.md) are documented separately. Unsupported languages fall back to English.
- `virtual_batteries`: 1–32 series-group configurations, each containing physical `batteries`.
- `batteries`: the backward-compatible flat list of 1–32 physical pack configurations.
- `thresholds`: optional defaults for every pack/group. In virtual mode, values inherit **top level → group → physical pack**; a more specific value overrides the same key.

Use exactly one of `virtual_batteries` or top-level `batteries`. They are alternative layouts. The flat layout does not infer a series connection from names such as “Chain 1”.

## Each virtual battery

- `name`, `subtitle`: optional literal text.
- `batteries`: required ordered list of 1–32 physical pack configurations described below.
- `topology`: optional; only `series` is accepted. Parallel aggregation is not implemented.
- `voltage`: optional explicit upstream bank-voltage entity. Without it, the card sums **all** valid available member voltages, normalizing V/mV. An invalid explicitly configured voltage stays missing; no fallback to the sum.
- `current`: optional explicit group-current entity. A, mA and kA normalize to A; an absent unit assumes A. No current sum, average or automatic choice of a physical member.
- `power`: optional explicit group-power entity. Without it, valid group voltage and explicit group current can produce a labelled V × I estimate. W, mW, kW and MW normalize to W; an absent unit assumes W. An invalid explicitly configured power stays missing.
- `soc`: optional explicit group-SOC entity, 0–100%. Without it there is no virtual SOC. Lowest-member SOC and member SOC range are separate diagnostics and require all member SOC values.
- `nominal_voltage`: optional positive number in V, shown as a reference label; never a substitute for a measurement.
- `voltage_range`: optional `{min: number, max: number}` in V, with finite bounds `0 ≤ min < max`; display range only, not a protection/charging setting.
- `accent`: optional `cyan`, `violet`, `teal`, `pink`, `blue`, or `amber`.
- `availability`: optional entity ID using the same gate states as physical packs. If denied, **all summary and member measurements** are hidden.
- `thresholds`: optional overrides of top-level thresholds; inherited by member packs unless they override a key.

Group and physical-pack `nominal_voltage` / `voltage_range` are independent. Group voltage ranges are not divided automatically among packs. Configuring a nominal voltage does not set a chemistry, a range, or thresholds.

## Each physical battery

- `name`, `subtitle`: optional text. Keep a physical BMS identity in the subtitle when useful.
- `soc`: required numeric entity, expected percent 0–100 inclusive.
- `voltage`: required positive pack-voltage entity. V, mV, or no unit (assumed V) normalize to V; other units are invalid.
- `current`, `power`, `temperature`: optional numeric entities. The sign is preserved as reported; the card does not choose a positive-current direction. Use consistent current units and signs when mapping a group source.
- `cells`: required ordered list of 1–64 distinct numeric entity IDs, or objects `{entity: sensor.cell_1, name: "C1"}`. Units must be V, mV, or absent (assumed V). mV converts to V; unknown units and zero/nonpositive voltages count as missing.
- `nominal_voltage`, `voltage_range`: optional display metadata, with the same format as the group fields.
- `accent`: optional palette name as above. Packs cycle through colors by default.
- `availability`: optional entity ID. Only states `on`, `online`, `true`, `connected` permit measurements. A missing entity or any other state hides **every measurement** for that battery even if numeric MQTT values remain retained. This gate does not independently validate BMS freshness.
- `thresholds`: optional overrides of inherited thresholds.

Use each physical pack's voltage source and each cell only once inside a virtual group. Reusing a pack or cell would double-count the same physical measurement. Map cells to their real BMS; the frontend cannot discover or validate the physical wiring.

SOC outside 0–100 and nonpositive pack voltage are missing, not clamped. Other supported finite signed numeric metrics, including zero current, zero power, zero SOC and negative temperature, are valid. Unknown, unavailable, empty, malformed or nonfinite values render as an em dash. Values from different HA entities need not represent a simultaneous snapshot.

When one cell is missing, **minimum, maximum and spread are all unavailable** for that pack and for complete-cell statistics of its group. Other observed cell readings and availability counts remain visible. The card never reports zero spread from an incomplete pack.

## Two-pack example

This is a 24 V-class string made from two illustrative 4S LiFePO₄ packs: nominally 25.6 V, with eight physical cells in total. The configured display ranges below are examples; choose values appropriate to your actual equipment.

```yaml
type: custom:ha-jbd-bms-card
title: Battery room
language: auto
thresholds:
  cell_min: 2.8
  cell_max: 3.65
  delta_warning: 30
  delta_critical: 80
  soc_low: 15
  soc_warning: 30
virtual_batteries:
  - name: Reserve bank
    subtitle: 2 physical packs in series · 8 cells total
    nominal_voltage: 25.6
    voltage_range: {min: 22.4, max: 29.2}
    current: sensor.reserve_string_current
    # Optional, only when a trusted upstream bank SOC exists:
    # soc: sensor.reserve_bank_soc
    # Optional upstream quality gate, not just ESP32 transport status:
    # availability: binary_sensor.reserve_samples_valid
    batteries:
      - name: Pack 1
        subtitle: Physical BMS 1 · 4S LiFePO₄
        nominal_voltage: 12.8
        voltage_range: {min: 11.2, max: 14.6}
        soc: sensor.reserve_bms_1_soc
        voltage: sensor.reserve_bms_1_voltage
        cells:
          - sensor.reserve_bms_1_cell_1
          - sensor.reserve_bms_1_cell_2
          - sensor.reserve_bms_1_cell_3
          - sensor.reserve_bms_1_cell_4
      - name: Pack 2
        subtitle: Physical BMS 2 · 4S LiFePO₄
        nominal_voltage: 12.8
        voltage_range: {min: 11.2, max: 14.6}
        soc: sensor.reserve_bms_2_soc
        voltage: sensor.reserve_bms_2_voltage
        cells:
          - sensor.reserve_bms_2_cell_1
          - sensor.reserve_bms_2_cell_2
          - sensor.reserve_bms_2_cell_3
          - sensor.reserve_bms_2_cell_4
```

A group `current` sensor is optional. Omit it if you do not have an appropriate source; string current and the power estimate then stay missing. Do not replace unavailable sources with zero in HA templates. More layouts: [example catalog](../examples/README.md).

## Display thresholds

- `cell_min: 2.8`, `cell_max: 3.65`: lower/upper cell-bar edges in V; out-of-range cells are highlighted.
- `delta_warning: 30`, `delta_critical: 80`: yellow/red spread thresholds in mV.
- `soc_low: 15`, `soc_warning: 30`: low/warning SOC thresholds in percent.

These defaults illustrate LiFePO₄; they are not universal battery limits. Changing a display threshold does not change a BMS, inverter or charger. Cell bars are not cell-SOC estimates. For a second chemistry, set group/pack cell thresholds explicitly. A mixed display does not authorize mixing those packs in one physical series string.

Cell names and a per-pack override work in either layout:

```yaml
# Inside one physical pack configuration:
thresholds:
  delta_warning: 20
  delta_critical: 50
cells:
  - entity: sensor.example_cell_1
    name: C1 · positive end
  - entity: sensor.example_cell_2
    name: C2
```

## Mapping and source quality

Both maintained ESPHome chain profiles call their local BMS 1–4. Chain 2 is distinguished by its device/discovery identity, not necessarily by sensors named BMS 5–8. Use Developer Tools and the entity registry; do not derive entity IDs blindly from MQTT topic prefixes. Duplicate discovery through MQTT and the native API may produce two sets of entities; choose one consistent set for each physical pack.

No available HA state is proof of a fresh BMS sample. A strict consumer must validate the upstream atomic telemetry's boot identity, sequence, per-field validity, per-battery readiness and timeout before exposing trusted HA entities. This repository does not implement that consumer or create virtual-bank entities for other integrations.

A valid explicit group sensor may coexist with missing physical-pack detail. Its displayed value is not proof that all members are available. A group availability gate can enforce that relationship if trustworthy upstream validation provides one. See [missing-data semantics](virtual-batteries.md#missing-data-stays-visible) and the [runbook](runbook.md).

## Frontend behavior

The card has no physical action buttons and makes no network requests. A click or Enter/Space on a source measurement dispatches Home Assistant's standard `hass-more-info` event. Derived values have no fabricated entity/history. Text is escaped before rendering. The card redraws when a referenced entity object or language changes and restores keyboard focus. It inherits Home Assistant theme colors.
