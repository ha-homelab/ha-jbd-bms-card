# JBD Battery & Cell Card

A colorful, read-only Home Assistant card for battery packs and **every individual cell**. Charge rings, pack voltage, current, power, temperature, cell bars, and min/max/spread — in one responsive view.

Works with entities from [ESPHome JBD BMS MQTT](https://github.com/victron-venus/esphome-jbd-bms-mqtt), native ESPHome, or another integration exposing numeric battery sensors. **Victron, Cerbo GX, Venus OS, and `dbus-mqtt-battery` are not required.**

- Multiple batteries and chains, with explicit entity mapping; no guessed IDs.
- Individual cell voltages in V or mV, normalized to volts; 1–64 cells per battery.
- Home Assistant light/dark themes, mobile layout, English and Russian.
- Unknown or unavailable measurements stay missing; no invented zeroes or aggregate SOC.
- Tap or keyboard-activate a value to open HA's more-info dialog. No device commands.
- One dependency-free JavaScript module; no CDN, tracking, external requests, or build needed for installation.

[Русская инструкция](docs/README.ru.md) · [Configuration and data semantics](docs/configuration.md) · [Standalone ESPHome usage](https://github.com/victron-venus/esphome-jbd-bms-mqtt)

## Preview

![Synthetic demo of six battery packs in the dark theme](docs/images/synthetic-demo-dark.png)

The screenshot uses invented demo values, not live battery data. [Light theme preview](docs/images/synthetic-demo-light.png).

Run `python3 -m http.server 8124` from this repository and open [the synthetic demo](http://localhost:8124/demo/). The demo includes low-charge, high-spread, and missing-cell fixtures. It is clearly marked as invented data and does not connect to Home Assistant.

## Install

### HACS custom repository

In HACS, open **Custom repositories**, add `https://github.com/ha-homelab/ha-jbd-bms-card` with category **Dashboard**, and download the card. This is a custom repository, not a claim of inclusion in the default HACS store.

If HACS does not register the resource automatically, add a **JavaScript module** resource:

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

### Manual

Copy `ha-jbd-bms-card.js` into `/config/www/`. In **Settings → Dashboards → Resources**, add a JavaScript module:

```text
/local/ha-jbd-bms-card.js?v=0.1.0
```

The Resources page may require Advanced Mode in your HA user profile. Reload the browser after adding the resource. Adding or updating a dashboard resource does not require a Home Assistant restart when `/config/www` already exists. If you create `www` for the first time, restart Home Assistant once so `/local/` is served.

## Add a card

Edit a dashboard, choose **Manual**, and use the configuration below. Replace **every entity ID** with the actual ID from **Developer Tools → States**. These are illustrative names, not a promise about ESPHome discovery IDs.

```yaml
type: custom:ha-jbd-bms-card
title: Battery room
language: en
batteries:
  - name: Battery 1
    subtitle: Chain 1 · 4S LiFePO₄
    soc: sensor.my_battery_soc
    voltage: sensor.my_battery_voltage
    current: sensor.my_battery_current
    power: sensor.my_battery_power
    temperature: sensor.my_battery_temperature
    cells:
      - sensor.my_battery_cell_1
      - sensor.my_battery_cell_2
      - sensor.my_battery_cell_3
      - sensor.my_battery_cell_4
```

Add more entries under `batteries` for the second chain or further batteries. The card automatically arranges them into columns according to the available width. For eight packs, a full-width **Panel** view is useful; the card also supports Sections and Masonry views. Card configuration uses YAML; the card picker supplies a placeholder configuration that must be edited.

Only `soc`, `voltage`, and a nonempty `cells` list are required per battery. Current, power and temperature are optional. Cell names, availability gating and display thresholds are documented in [configuration](docs/configuration.md).

## What the colors mean

Default display ranges suit a **4S LiFePO₄ example**, not every installation: cells 2.8–3.65 V; spread warning at 30 mV and high spread at 80 mV; SOC low at 15% and warning at 30%. These are visualization thresholds, **not BMS protection settings or advice to change them**. Set them for your chemistry and operating range. The card never changes a battery, charger, inverter, or BMS setting.

Cell bars use the configured voltage range and are not estimates of cell SOC. Spread is calculated only when **all configured cells** have valid readings. Its color says nothing about simultaneity or balancing activity.

## Data and freshness

“Entities available” means the configured numeric HA states are present. It does **not** mean the BMS has just been sampled. MQTT retained state can survive a producer disconnect, and stable HA values may retain old `last_changed`/`last_updated` timestamps while the physical sensor continues reporting. The card does not use those timestamps to invent a freshness guarantee.

An optional `availability` entity can hide all values for a pack when a trustworthy upstream per-battery availability signal is not online. An ESP32 MQTT birth/LWT status alone only establishes transport connectivity. For strict freshness, validate the producer's atomic telemetry and expiration upstream, then expose unavailable HA entities or a per-battery availability sensor. See the upstream [telemetry contract](https://github.com/victron-venus/esphome-jbd-bms-mqtt/blob/main/docs/battery-telemetry.md).

## Development

Node.js 22 or newer:

```bash
npm ci --ignore-scripts
npm run check
npm test
npm run build
node scripts/check-package.mjs
```

`build` verifies the version and copies the root module to `dist/`; the root module is the distributable. Tests exercise numeric validity, availability, complete-cell spread, safe rendering, keyboard navigation and focus, entity update filtering, localization, and multiple batteries. The GitHub Actions required check is **CI gate**.

Validated in Home Assistant **2026.10.0** with eight batteries and 32 cells, desktop and a 320 px mobile viewport, including more-info interaction. The screenshot above remains synthetic.

Built against the [Home Assistant custom card API](https://contributors.home-assistant.io/frontend/custom-ui/card/). No custom HA integration or backend is needed. License: [MIT](LICENSE).
