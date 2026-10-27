# JBD Battery & Cell Card — English

[Languages](README.md) · [Full English documentation](../../README.md)

A read-only Home Assistant card for charge, pack voltage, current, power,
temperature, and individual cell voltages. It works with existing numeric
entities; Victron and Cerbo GX are not required. Support for all 24 interface
languages requires version 0.2.0 or newer. Check the published release notes;
development documentation can describe code newer than the latest release.

## Install and configure

In HACS, add `https://github.com/ha-homelab/ha-jbd-bms-card` as a **custom
repository**, type **Dashboard**, and download the intended release. The card
is not yet in the default catalog. Register this JavaScript module if HACS has
not done so:

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

For manual installation, copy the release's `ha-jbd-bms-card.js` into
`/config/www/` and register `/local/ha-jbd-bms-card.js` as a JavaScript module.
Use only one resource URL, then reload the browser. See
[HACS, updates and migration](../hacs.md) for replacing an existing manual copy.

Add a Manual card. Replace every example entity ID with the actual ID from
Home Assistant **Developer Tools → States**:

```yaml
type: custom:ha-jbd-bms-card
language: auto
batteries:
  - name: Battery 1
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

Add another list entry for each battery. SOC, pack voltage and the cells list
are required; the other measurements are optional. Select cells belonging to
the same BMS and monitor. Tapping a reading opens its HA history/details and
does not send a battery command.

## Language

Omit `language` or use `language: auto` to follow the Home Assistant profile.
Use `language: en` to force English for this card. Regional tags are resolved
and unsupported languages fall back to English. Your own names and entity IDs
are never translated. All dictionaries are bundled; no translation service is
contacted. See [language selection](../i18n.md).

## ESPHome and measurement quality

Follow [ESPHome deployment](../esphome-deployment.md) and the
[firmware project](https://github.com/victron-venus/esphome-jbd-bms-mqtt).
Its maintained profiles each expect **four BMS with four cells per BMS**.
Configure Bluetooth addresses, Wi-Fi and the MQTT broker privately, then add
HA's MQTT or ESPHome integration. Installing this card does not flash an ESP32
or create battery entities.

Missing readings remain missing. The card computes cell spread only when all
configured cells have valid values. Colors are display thresholds, not BMS
protection settings. Retained MQTT values and an online connection do not prove
fresh measurements; enforce expiry upstream where required. See
[configuration and freshness](../configuration.md) and the separate
[Echo Dot feasibility assessment](../echo-dot-bluetooth.md).
