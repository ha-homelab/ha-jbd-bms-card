# From JBD BMS to this Home Assistant card

The card consumes existing HA entities. It does not poll Bluetooth, run an MQTT
broker, or program an ESP32. The maintained firmware lives in
[`victron-venus/esphome-jbd-bms-mqtt`](https://github.com/victron-venus/esphome-jbd-bms-mqtt).
No Victron equipment is required for the following monitoring path:

```text
JBD BMS → Bluetooth LE → ESP32 → MQTT broker → HA MQTT integration → this card
                         └──── encrypted native API → HA ESPHome integration
```

## Deploy the producer

Start with the firmware repository's [configuration and installation guide](https://github.com/victron-venus/esphome-jbd-bms-mqtt#configuration).
Its two maintained profiles, `jbd-all-batteries1.yaml` and
`jbd-all-batteries2.yaml`, each expect **four BMS with four cells per BMS**.
One monitor covers four batteries/16 cells; two cover eight batteries/32 cells.
The card's configurable 1–64 cells per battery does not change that firmware
assumption. A different firmware topology requires adapting its collector,
polling and aggregates together.

Keep `components/battery_telemetry.h` and
`packages/mqtt-availability.yaml` beside the selected YAML in their original
relative directories. In a private device configuration, set the actual BMS
addresses, Wi-Fi credentials, broker endpoint and authentication. Follow the
upstream [firmware access and migration procedure](https://github.com/victron-venus/esphome-jbd-bms-mqtt/blob/main/docs/firmware-access.md)
for API/OTA keys and initial provisioning. Keep secrets and compiled firmware
out of this card repository. Do not replace an existing device's credentials
or identity with example values.

An ordinary MQTT broker can run on HA OS, a NAS, a Raspberry Pi, or another
reachable server. Point HA's MQTT integration at the same broker. Preserve the
monitor's discovery identity during an existing installation upgrade; new
monitors need unique identities. Chain 1 uses `battery`, Chain 2 `battery2`,
and both number their local BMS 1–4. Topic prefixes alone do not identify the
final HA entity IDs. API sensor access is an alternative path; the current
firmware still contains MQTT actions, so deleting `mqtt` is not a supported
API-only conversion.

The upstream [standalone Home Assistant guide](https://github.com/victron-venus/esphome-jbd-bms-mqtt/blob/main/docs/standalone-home-assistant.md)
explains operation without Victron, Cerbo GX or Venus OS. The card does not
install `dbus-mqtt-battery`; that bridge is only for optional Victron/Venus OS
consumers.

## Map the measurements

Find each device under **Settings → Devices & services**, then copy its actual
entity IDs from **Developer Tools → States**. For every battery, map:

- its SOC and battery voltage;
- optional current, power, and temperature;
- every individual cell voltage belonging to the same BMS;
- optional trustworthy per-battery availability.

Use the [card configuration example](../README.md#add-a-card). Do not mix local
BMS 1 from the first monitor with local BMS 1 from the second. Historical
registry renames and duplicate suffixes can make an entity ID misleading;
verify the device association and friendly name as well. Cell readings in mV
are normalized to V by the card. Battery and cell labels supplied in YAML stay
literal when the UI language changes.

## Verify the path

Confirm the expected number of batteries and cells, compare a known battery
against its source readings, and open an individual cell's more-info history.
Missing data must appear as missing; a missing cell prevents a reassuring
zero-spread summary. Confirm the producer's real availability behavior before
using an availability entity to hide retained values.

MQTT retained values and a monitor's online status are not proof of a fresh BMS
reply. For alerts or control decisions, use an upstream consumer implementing
the [atomic telemetry contract](https://github.com/victron-venus/esphome-jbd-bms-mqtt/blob/main/docs/battery-telemetry.md):
validate complete fields, account for their age, and expire samples when replies
stop. A frontend card cannot infer measurement freshness from unchanged HA
timestamps. The existing BMS protections remain responsible for the battery.

For an alternative receiver, see the separate
[Echo Dot Bluetooth feasibility assessment](echo-dot-bluetooth.md). A Bluetooth
proxy and a JBD decoder are different components; that assessment does not
claim an installed replacement for the ESP32 producer.
