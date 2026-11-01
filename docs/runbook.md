# Operations runbook

This runbook installs and maintains the **read-only card**. Firmware changes and virtual-battery control consumers have their own deployment/validation process. Changing dashboard YAML cannot rewire a bank, flash a BMS, or create an upstream virtual battery.

## 1. Inventory the physical topology

Record each independent string, its member order, BMS identity, physical cell count, chemistry, nominal pack voltage and intended display ranges. Distinguish “four cells inside a pack” from “four packs in a series string”. Confirm the actual equipment's permitted series configuration through its manufacturer documentation; the diagrams here are illustrative data models.

Identify existing bank sensors if present: string shunt/current, measured bank voltage, power and a trusted bank SOC. Do not create a bank SOC by averaging the physical-pack percentages. Keep trusted existing control consumers separate from this frontend rollout.

## 2. Verify source entities before installing

Deploy/validate the physical collection path using [ESPHome deployment](esphome-deployment.md). In HA **Developer Tools → States**, record exact IDs and units for every pack SOC, voltage and cell. Add optional current/power/temperature and upstream availability gates if present.

Check that each cell belongs to its intended BMS and that no pack source appears twice. Choose MQTT or native ESPHome consistently for each pack. Note any retained-state/expiry limitations. For strict data quality, validate the atomic telemetry upstream and expose its decision to HA; installing the card does not add that validator.

## 3. Install a known card version

Save the current dashboard YAML and resource URL before updating. For a manual install, keep the previous known-working JavaScript alongside your normal operational backup. Follow [HACS/manual installation](hacs.md), using a release whose notes include virtual-battery support. The older 0.2.0-beta.1 only supports flat packs.

Register one module resource. Use a version query for manual updates, reload the browser and verify the intended module is served. Avoid mixing HACS and manual resource registrations.

## 4. Configure one string first

Copy the matching [example](../examples/README.md), replace every placeholder ID, and keep only the real members/cells. Use top-level `virtual_batteries` and nested `batteries`. Set nominal/range metadata explicitly. Do not retain a top-level flat `batteries` list at the same time.

Map group current/SOC only when a real source exists. Omit optional group voltage to show the complete member-voltage sum; configure it when you deliberately want an upstream measurement. Remember that an invalid explicit source does not fall back to a derived value.

## 5. Acceptance checks

1. Match pack count and cell count against the physical inventory.
2. Compare every pack and several individual cells against their HA source values and units. Confirm mV conversion where used.
3. For derived group voltage, independently add the displayed member voltages and check the total within display rounding. Verify that this is a display sum, not asserted atomic telemetry.
4. Confirm group current is the selected source, not a sum, and group SOC is either its explicit source or missing. Lowest-member SOC/range labels must remain distinct.
5. Open a source value's HA more-info dialog. Derived values should not pretend to have their own history entity.
6. Test desktop/mobile width, light/dark theme, profile language and one fixed language override.
7. Use the **synthetic demo** for missing-cell, missing-member and gate-denied cases. For live verification, observe an authorized existing outage/test event; do not disconnect production protection equipment just to test a dashboard.

Expected failure behavior: missing cells suppress their complete-cell statistics; missing member voltage suppresses a derived string voltage; a denied group gate suppresses summary and members. Remaining unrelated groups stay visible.

## 6. Add further strings

Add a separate `virtual_batteries` entry for each independent series string. Preserve explicit BMS identity and member order. Do not sum two independent strings in the card or assume that sharing a dashboard makes them parallel. If an upstream bank-level consumer combines strings, document and validate that consumer separately.

The frontend's limits do not guarantee that one ESP32 can acquire that many BLE connections. Use the firmware project's supported profiles and actual hardware limits. Deploying this card alone never modifies the collectors.

## 7. Diagnose an outage

Determine whether the failure is resource loading, one HA entity, one physical BMS, an ESP32/broker/integration path, or an upstream group measurement. Follow [troubleshooting](troubleshooting.md). Record missing inputs and source units before changing configuration. Preserve gates that correctly signal invalid data. Do not introduce template defaults such as `float(0)` that convert failure into a plausible measurement.

## 8. Update or roll back

Review release notes and validate a new version with a saved synthetic/demo configuration before rollout. Update the HACS release or manual module, change the manual cache key if relevant, reload and repeat the affected acceptance checks.

For rollback, restore the previous module/version and the matching saved YAML, then reload. A pre-virtual-series release also needs the old flat `batteries` configuration. No BMS, ESP32, inverter or charger rollback is involved in a card-only change. Record the installed version and validation result in your existing operations record.

## 9. Evidence and privacy

Label screenshots as **live** or **synthetic**. Keep example IDs, private addresses, tokens, MAC addresses and credentials out of public captures. Preserve only the operational backup needed for rollback and meaningful acceptance evidence. Public demos contain invented measurements and never access a Home Assistant instance.
