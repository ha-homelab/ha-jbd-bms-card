# Ready-to-edit card configurations

Every entity ID in these files is **synthetic**. Replace it with the real HA entity ID and unit, then verify the physical pack/cell mapping. Do not paste example IDs into production unchanged. These examples need a version with `virtual_batteries` support; 0.2.0-beta.1 predates this feature.

- [One 4S pack](series-1-pack.yaml): 12 V class, **12.8 V nominal**, four cells.
- [Two 4S packs](series-2-pack.yaml): 24 V class, **25.6 V nominal**, eight cells.
- [Three 4S packs](series-3-pack.yaml): 36 V class, **38.4 V nominal**, twelve cells.
- [Four 4S packs](series-4-pack.yaml): 48 V class, **51.2 V nominal**, sixteen cells.
- [Five 4S packs](series-5-pack.yaml): 60 V class, **64.0 V nominal**, twenty cells; frontend configuration example only, not an assertion of five-BMS firmware support.
- [Two independent four-pack strings](two-independent-strings.yaml): two separately displayed 51.2 V nominal virtual batteries, eight physical packs, thirty-two cells. No electrical parallel relationship is inferred.
- [Explicit upstream bank sensors](upstream-bank-sensors.yaml): bank voltage/current/power/SOC and a validated availability entity are supplied upstream; physical detail remains nested below.
- [Other cell counts and chemistries](other-cell-counts.yaml): separate single-pack groups with 8S LiFePO₄, a 7S / 3.6 V nominal-cell example, and 16S LiFePO₄. Custom per-group display thresholds are shown. These packs are **not** placed in one mixed-chemistry string.

The 4S LiFePO₄ examples assume 3.2 V nominal per cell. Display ranges use 2.8–3.65 V per cell for illustration; **they are neither charge targets nor approved operating/protection limits**. Use the actual equipment's specifications. Other chemistries may state different nominal cell voltages.

The examples map a group `current` entity so a labelled V × I estimate can appear. If there is no appropriate string-current source, remove that field. Do not add current readings in series. No example derives bank SOC by averaging physical SOC. Current and Ah do not add in series.

`nominal_voltage` and `voltage_range` do not generate measurements or select chemistry. Thresholds inherit top level → virtual group → physical pack. Each group can contain 1–32 packs, and each pack 1–64 cells; those are frontend limits, not hardware ratings or firmware connection limits.

See [configuration](../docs/configuration.md), [virtual-battery semantics](../docs/virtual-batteries.md), [ESPHome deployment](../docs/esphome-deployment.md), [runbook](../docs/runbook.md) and [troubleshooting](../docs/troubleshooting.md).
