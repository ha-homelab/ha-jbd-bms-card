# Configuration and data semantics

## Top level

- `type`: `custom:ha-jbd-bms-card`.
- `title`: optional heading; defaults to “Battery atlas” / “Атлас батарей”.
- `language`: optional `en` or `ru`; otherwise follows HA (Russian or English fallback).
- `batteries`: 1–32 pack configurations.
- `thresholds`: optional defaults for every pack, with per-pack overrides.

## Each battery

- `name`, `subtitle`: optional text.
- `soc`: required numeric entity, expected percent 0–100 inclusive.
- `voltage`: required pack voltage entity, a positive number. Its HA unit is displayed.
- `current`, `power`, `temperature`: optional numeric entities; HA unit is displayed, falling back to A, W and °C. The sign is preserved as reported, with no assumption about positive-current direction.
- `cells`: required ordered list of 1–64 distinct numeric entity IDs, or objects `{entity: sensor.cell_1, name: "C1"}`. Units must be V, mV, or absent (assumed V). mV converts to V; unknown units and zero/nonpositive voltages count as missing.
- `accent`: optional `cyan`, `violet`, `teal`, `pink`, `blue`, `amber`. Packs cycle through these by default.
- `availability`: optional entity ID. Only states `on`, `online`, `true`, `connected` allow values to be shown. A missing entity, any other state, or unavailable state hides **every measurement** for that battery, even when numeric MQTT values remain retained. This gate does not independently validate BMS freshness.
- `thresholds`: optional overrides of the top-level thresholds.

SOC outside 0–100 and nonpositive pack voltage are missing, not clamped. Other finite signed numeric metrics, including zero current, zero power, zero SOC and negative temperature, are valid. Unknown, unavailable, empty, malformed or nonfinite values render as an em dash. Values from different HA entities need not represent a simultaneous snapshot.

When one cell is missing, **minimum, maximum and spread are all unavailable**. The card still shows the other observed cell readings and the number available. It never reports zero spread from an incomplete pack.

## Threshold example

```yaml
type: custom:ha-jbd-bms-card
thresholds:
  cell_min: 2.8         # V: lower edge of cell bar; below is highlighted
  cell_max: 3.65        # V: upper edge of cell bar; above is highlighted
  delta_warning: 30    # mV: yellow spread badge
  delta_critical: 80   # mV: red spread badge
  soc_low: 15          # %: red charge ring
  soc_warning: 30      # %: yellow charge ring
batteries:
  - name: Example pack
    accent: violet
    availability: binary_sensor.example_pack_measurements_valid
    soc: sensor.example_soc
    voltage: sensor.example_voltage
    cells:
      - entity: sensor.example_cell_1
        name: C1
      - entity: sensor.example_cell_2
        name: C2
```

These example entity IDs must be replaced. For ESPHome's two-chain configurations, both devices call their local BMS 1–4. Chain 2 is distinguished by its device/discovery identity, not necessarily by sensors named BMS 5–8. Use Developer Tools and the entity registry; do not derive entity IDs blindly from the MQTT topic prefix. Duplicate discovery through MQTT and the native API may produce two sets of entities; choose one consistent set for each pack.

## Source availability and complete telemetry

No state is described as “fresh”, “healthy”, or “safe” by the card. An available sensor is only an available HA entity. “Partial data” means at least one configured metric/cell is missing. “Unavailable” means all measurements are absent or the configured availability gate denies them. Display alerts do not substitute for BMS or inverter protections.

Native API and MQTT sensor states can be used directly for observational dashboards. A strict consumer should validate the upstream atomic telemetry's boot identity, sequence, per-field validity, per-battery readiness, and timeout before creating HA entities consumed here. This repository does not implement that separate consumer and does not silently assume it exists.

## Frontend behavior

The card contains no physical action buttons and makes no network requests. A click or Enter/Space on a measurement dispatches Home Assistant's standard `hass-more-info` event for an existing entity. Text is escaped before rendering. The card redraws only when a referenced entity object or language changes and restores keyboard focus. It uses the standard custom-card lifecycle and sizing APIs and inherits theme colors from Home Assistant.
