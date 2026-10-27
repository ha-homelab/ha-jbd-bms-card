# Can a converted Echo Dot replace the ESP32 battery collector?

**Not with the TECHO5 Dot Bluetooth proxy reviewed here.** It forwards BLE advertisements but does not provide the active GATT connections required to poll JBD battery measurements. A future Dot implementation with active GATT support could provide the transport, but Home Assistant would still need a JBD decoder. This card only displays Home Assistant entities.

Reviewed on **October 27, 2026**. This is a compatibility assessment, not a claim that battery polling through an Echo Dot has been deployed or tested.

## What the battery connection needs

The JBD protocol used by the existing ESPHome collector is a request/response protocol over a connected BLE link. Its default service is `FF00`; responses arrive through notifications on `FF01`, and commands are written to `FF02`. Reading measurements therefore requires connecting, discovering characteristics, subscribing to notifications, and writing measurement requests. “Read-only monitoring” still needs these protocol writes; it does not mean changing BMS configuration. See the pinned [JBD characteristic definitions](https://github.com/syssi/esphome-jbd-bms/blob/70831773385cfa803a543d87f4ca9e65a2f8415a/components/jbd_bms_ble/jbd_bms_ble.h) and [polling implementation](https://github.com/syssi/esphome-jbd-bms/blob/70831773385cfa803a543d87f4ca9e65a2f8415a/components/jbd_bms_ble/jbd_bms_ble.cpp).

Advertisements can establish that a device is nearby. They do not carry the complete JBD measurement exchange used here, including the individual cell readings. Also distinguish **active scanning** (requesting additional advertisement data) from **active connections** (GATT): enabling active scanning cannot add a missing GATT client.

## What was verified about TECHO5

A read-only Home Assistant inspection reported **TECHO5 Dot v1.0.36**, with the Bluetooth proxy enabled. Earlier acceptance demonstrated advertisement forwarding. Neither observation proves that a proxy can connect to a battery; no battery connection was attempted during this review.

The release can be traced to these public artifacts:

- [Dot v1.0.36 release](https://github.com/HuskerMinion/techo5-dot/releases/tag/dot-v1.0.36), with platform commit [`40592e8`](https://github.com/HuskerMinion/techo5-dot/commit/40592e80ad56bf1ff7453c6bcb6d0a2e20616009).
- [Release manifest](https://github.com/HuskerMinion/techo5-dot/releases/download/dot-v1.0.36/manifest.json). The downloaded `echod-arm-dot` artifact matched the manifest's SHA-256 and records daemon commit [`c066542`](https://github.com/HuskerMinion/techo5/commit/c0665429eed5cb563589ddbcaeeba3a474841f81), the `dot` build tag, and `vcs.modified=false` in its Go build metadata. This verifies the public release artifact, not the installed device's binary hash.
- At that exact release revision, [`central_dot.go`](https://github.com/HuskerMinion/techo5/blob/c0665429eed5cb563589ddbcaeeba3a474841f81/echod/internal/feature/bluetooth/central_dot.go) leaves `openCentral` unset. [`ConnectionsEnabled()`](https://github.com/HuskerMinion/techo5/blob/c0665429eed5cb563589ddbcaeeba3a474841f81/echod/internal/feature/bluetooth/bluetooth.go#L207-L230) requires a non-nil backend before advertising active connection support. The Dot build therefore cannot supply it.
- The later daemon revision [`f754a2a`](https://github.com/HuskerMinion/techo5/blob/f754a2a11f4644393838cfc22fb22c75e10b2b3f/echod/internal/feature/bluetooth/central_dot.go) explicitly leaves the Dot's GATT central backend unset. Its [BlueZ central backend](https://github.com/HuskerMinion/techo5/blob/f754a2a11f4644393838cfc22fb22c75e10b2b3f/echod/internal/feature/bluetooth/central_bluez.go) is compiled for non-Dot targets. General TECHO5 connection features must therefore not be assumed to apply to the Dot.

The missing piece is **a supported active GATT backend for the Dot proxy**, including connection management and notification forwarding. A proxy switch, an advertisement counter, or a different dashboard card cannot supply it. Future firmware should be checked by exact version and hardware target before changing this conclusion.

## Routes that can provide Home Assistant entities

The existing route remains:

```text
JBD BMS → ESP32 with JBD decoder → MQTT → Home Assistant → this card
```

It works without Victron or Cerbo GX. Use the upstream [standalone Home Assistant guide](https://github.com/victron-venus/esphome-jbd-bms-mqtt/blob/main/docs/standalone-home-assistant.md) and [ESP deployment instructions](https://github.com/victron-venus/esphome-jbd-bms-mqtt#readme).

An alternative architecture is:

```text
JBD BMS → active-capable HA Bluetooth adapter/proxy
        → BMS_BLE-HA decoder → Home Assistant entities → this card
```

[BMS_BLE-HA](https://github.com/patman15/BMS_BLE-HA/blob/1ca616ea9a3ea506c08f264b9189ca726d12248b/README.md) lists JBD/Jiabaida/Xiaoxiang support, individual cell voltages, and ESPHome Bluetooth proxies. Its troubleshooting instructions require an active-capable proxy with available connection slots. Exact BMS firmware and authentication compatibility still need a pilot. Its reviewed [integration manifest](https://github.com/patman15/BMS_BLE-HA/blob/1ca616ea9a3ea506c08f264b9189ca726d12248b/custom_components/bms_ble/manifest.json) is version 2.18.0 and pins `aiobmsble==0.30.0`; that does not imply the integration is already installed here. The pinned [JBD decoder](https://github.com/patman15/aiobmsble/blob/2a78c0e0ad9ce018236bd39622bf77c21b20d26f/aiobmsble/bms/jbd_bms.py) uses the same `FF00`/`FF01`/`FF02` service and characteristics and requests both pack and cell data.

A supported local HA Bluetooth adapter can avoid a separate ESP32 transport. An ESPHome proxy is another option, but normally still uses an ESP32. The current converted Dot cannot fill the active-proxy role. See [ESPHome's Bluetooth proxy documentation](https://esphome.io/components/bluetooth_proxy/) for the distinction between advertisements and active connections and for connection-slot constraints.

An Echo Dot runs a different Linux platform. Its ESPHome-compatible network API does not make it an ESP32: the existing ESPHome YAML and ESP32 JBD component cannot simply be flashed onto it. Running a separate Linux collector would require a compatible Bluetooth stack, JBD client, service lifecycle, and coexistence testing; that is a separate development effort, not an enabled TECHO5 feature.

## A controlled pilot for a supported transport

1. Prefer a spare BMS. Otherwise select one battery whose monitoring can be interrupted without relying on its telemetry for live control, and plan restoration of its existing collector first.
2. Record current entity mapping and sample values. Ensure the original ESP32 client and any phone BMS app have released that **one** BLE connection before enabling another client. Do not run competing collectors against it.
3. Use a transport that explicitly supports active connections. Validate connection, service discovery, measurement requests, notifications, and reconnect behavior with the chosen JBD integration.
4. Compare pack voltage, current direction, SOC, temperature, cell count, and every cell value against the original source in separate collection windows. Verify that connection loss produces unavailable or expired measurements instead of indefinitely retaining convincing values.
5. Map the actual resulting entity IDs in the card. Confirm units, freshness behavior, and connection capacity before expanding to additional batteries. Restore the original collector if the pilot fails.

This procedure is a future acceptance plan. No production BLE ownership, firmware, or service configuration was changed for this assessment.

## MQTT and Victron compatibility are separate work

Moving the decoder into Home Assistant does not automatically reproduce the ESP32 project's MQTT topics, atomic snapshots, sequence/boot identifiers, freshness semantics, or downstream battery aggregation. Any consumer of the existing [telemetry contract](https://github.com/victron-venus/esphome-jbd-bms-mqtt/blob/main/docs/battery-telemetry.md), including a Cerbo/Venus bridge, needs a compatible producer or an explicit migration. Displaying similar numbers in this card is not evidence that those contracts are preserved.

For this card alone, the requirement is numeric Home Assistant entities with correct units and trustworthy availability. See [configuration and data semantics](configuration.md).
