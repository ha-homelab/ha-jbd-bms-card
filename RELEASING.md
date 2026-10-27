# Releasing

1. Keep `package.json`, root `package-lock.json` metadata and the `VERSION` constant in `ha-jbd-bms-card.js` aligned.
2. Run the documented checks and review the synthetic demo at desktop/mobile widths in light/dark themes.
3. Merge the reviewed revision, wait for `CI gate` to succeed on that exact commit, and tag it `v<version>`.
4. Attach the unchanged root `ha-jbd-bms-card.js` and a `SHA256SUMS` checksum file to a GitHub release. Include the relevant changelog entry. HACS uses the fixed asset filename.
5. Install those exact bytes into a test Home Assistant dashboard and verify entity mappings and more-info interaction. Publishing a release does not install it into any HA instance.

No automated release or tag push is configured. GitHub organization/repository settings are owned by the organization's Terraform configuration.
