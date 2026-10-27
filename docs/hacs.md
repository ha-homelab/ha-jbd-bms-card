# HACS installation and publication

This repository is available as a **HACS custom repository**. It has not been
accepted into the default catalog. The existing `v0.1.0` release contains the
original English/Russian card; the 24-language interface requires the `0.2.0`
code or a later release containing it. Check the [release notes](https://github.com/ha-homelab/ha-jbd-bms-card/releases)
before choosing a download. A branch or pull request is not a stable release.

## Install a release

1. In HACS, open **Custom repositories** and add
   `https://github.com/ha-homelab/ha-jbd-bms-card` with type **Dashboard**.
2. Open **JBD Battery & Cell Card** and download the intended published version.
3. Check **Settings → Dashboards → Resources**. Enable Advanced mode in your HA
   profile if the resource editor is hidden. There should be one JavaScript
   module for this card:

   ```text
   /hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
   ```

4. Reload the browser and add a Manual card using the
   [configuration example](../README.md#add-a-card). Select real sensor IDs from
   your own HA instance. HACS installs the display code; it does not discover
   batteries, configure MQTT, or flash an ESP32.

HACS calls this type **Dashboard** in its interface and **plugin** in validation
and catalog files. The distributed file is the single root
`ha-jbd-bms-card.js`; all translations are embedded. See the official
[dashboard requirements](https://www.hacs.xyz/docs/publish/plugin/).

## Move from a manual installation to HACS

Export the dashboard configuration and record its current resource URL/version.
Keep the old JavaScript file privately for rollback. Download the intended HACS
release, then replace the manual `/local/ha-jbd-bms-card.js?...` resource entry
with the HACS module URL above. If HACS already created its entry, remove only
the redundant manual resource entry. **Do not load both URLs in the same HA
frontend.** The dashboard's `type`, entity IDs, names, and thresholds stay valid.

Reload every open HA browser/Companion view. Verify the version, one battery,
all its cells, and more-info navigation. A mixed browser cache can display old
code; do not infer the loaded version from a new resource filename alone.
To roll back, restore the saved resource entry and matching JavaScript, remove
the duplicate registration, and reload again. No battery firmware or entity
registry change is part of this migration.

## Prepare a release for catalog review

The repository already supplies a recognized MIT license, public source,
description, topics, issues, an illustrated README, `hacs.json`, and a matching
JavaScript filename. These metadata and asset requirements are described in
[HACS general requirements](https://www.hacs.xyz/docs/publish/start/).

Before publishing, run local checks and the official HACS Action with
`category: plugin`. Do not suppress validation with an `ignore` list. The HACS
job must succeed on the revision to be released, in addition to `CI gate`.
The action validates repositories using HACS's own checks; a local manifest
check alone is not equivalent. See the [HACS Action documentation](https://www.hacs.xyz/docs/publish/action/)
and [our release procedure](../RELEASING.md).

After checks pass, publish a full GitHub release with the exact tested
`ha-jbd-bms-card.js` and `SHA256SUMS`. A tag alone is insufficient for default
catalog submission. Test installing that release through a HACS custom
repository before claiming it works. This frontend card has no custom backend
integration: integration-only `hassfest`, integration manifests, and brands
checks do not apply.

## Submit to the default catalog

An owner or major contributor can create a branch in a personal fork of
[`hacs/default`](https://github.com/hacs/default), based on its current `master`.
Add the exact case-sensitive entry `ha-homelab/ha-jbd-bms-card` alphabetically
to the `plugin` list and leave maintainer edits enabled. Complete the current
submission template honestly and link the published release and successful
HACS validation run. For a dashboard card, leave the **integrations-only
hassfest checkbox unchecked**. Follow the current
[catalog submission requirements](https://www.hacs.xyz/docs/publish/include/).

The related [DESLOC card submission #11473](https://github.com/hacs/default/pull/11473)
was accepted on October 24, 2026. Its earlier attempts had incorrectly checked
that integration-only box. It is a useful example of the process, not proof
that this separate JBD card is approved. Inclusion only follows acceptance and
the catalog's subsequent scan; there is no promised review time.

This document prepares the publication path. No default-catalog submission is
claimed by this repository's custom-repository installation instructions.

## Troubleshooting

- **Card not found:** check the repository URL, Dashboard category, and release
  asset name; use the custom repository while default inclusion is pending.
- **Custom element not found:** check the JavaScript module resource and reload
  the browser. Ensure it returns JavaScript rather than an authentication page.
- **Old language choices:** verify the installed release includes the desired
  language and that only one card resource is registered.
- **Missing battery values:** confirm entity IDs and source availability using
  the [ESPHome deployment guide](esphome-deployment.md). Reinstalling a frontend
  card does not repair an offline BMS or MQTT broker.
