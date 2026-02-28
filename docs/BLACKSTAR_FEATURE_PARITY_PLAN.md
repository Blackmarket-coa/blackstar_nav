# Blackstar feature parity plan

This plan outlines the remaining work to fully tailor this repository for Blackstar and avoid a partial rebrand.

## 0) Establish source-of-truth feature inventory

Because this environment cannot access GitHub over HTTPS (403 from `raw.githubusercontent.com`), parity should be driven by an explicit feature inventory supplied by the Blackstar team (or by running this audit in an environment with GitHub access).

Required artifact:
- A checked-in `docs/blackstar-feature-matrix.csv` with columns:
  - `feature_name`
  - `in_blackstar` (yes/no)
  - `required_for_launch` (yes/no)
  - `status_in_this_repo` (present/partial/missing)
  - `owner`
  - `target_release`

## 1) Complete branding and identity refactor

The previous change only updated top-level metadata. There are still many Fleetbase/Navigator identifiers that must be changed.

### Android
- Rename Java/Kotlin package paths from `com.fleetbase.navigator` to Blackstar package IDs.
- Update app namespace and application ID in Gradle.
- Replace deep-link scheme `flbnavigator` in Android manifest.
- Revisit `network_security_config.xml` domain allowlist (`fleetbase.io`, `fleetbase.engineering`).

### iOS
- Rename Xcode target/project/product currently named `NavigatorApp`.
- Update iOS bundle ID and URL schemes still using Fleetbase/Navigator naming.
- Audit plist domains and associated domains entries tied to Fleetbase domains.

### Shared JS / React Native
- Replace hardcoded `@fleetbase/navigator-app` user-agent string.
- Audit labels and copy that are still Fleetbase-branded.

## 2) Backend and integration alignment

The app currently defaults to Fleetbase host/key environment variables and socket defaults.

- Decide whether Blackstar will continue using Fleetbase APIs directly or a Blackstar gateway.
- If using a Blackstar backend surface:
  - introduce Blackstar env keys (host, auth, realtime)
  - map/replace Fleetbase SDK usage where API contracts differ
  - define migration path for auth, order, issue, fuel-report, and chat resources.
- If still using Fleetbase APIs:
  - keep SDK integration but centralize tenant-specific defaults and labels to avoid future hardcoded fleetbase branding.

## 3) Feature parity validation across screens

Inventory each major domain and validate parity with Blackstar requirements:

- Authentication & account lifecycle
- Orders and task flow
- Navigation/routing behavior
- Proof of delivery and signatures
- Fuel reports
- Issue management
- Chat and notifications
- Fleet and vehicle views

For each domain:
- list required Blackstar behaviors
- map to existing screens/components
- identify missing API fields, business rules, and UX states
- add acceptance tests (or manual test scripts if E2E unavailable).

## 4) Legacy folder decision

This repo contains a large `legacy/` app with duplicated branding and config. Decide one path:

- **Option A (recommended):** deprecate `legacy/` from release path and document clearly.
- **Option B:** include `legacy/` in rebrand work and update all app IDs/package names/domains there too.

Without this decision, rebrand will remain inconsistent.

## 5) CI/CD and release assets

- Update app icon/splash assets to Blackstar-approved versions.
- Update store listing metadata and bundle IDs for iOS/Android pipelines.
- Verify signing configs, provisioning, and release workflows use Blackstar identifiers.

## 6) Definition of done

Use this exit checklist:

- [ ] No Fleetbase/Navigator naming remains in release codepaths (except intentionally retained SDK package names).
- [ ] Mobile identifiers (bundle ID, package name, deep links) are Blackstar-specific.
- [ ] Backend defaults and runtime linking flow match Blackstar infrastructure.
- [ ] Domain-level feature matrix shows all required features marked `present`.
- [ ] Smoke tests pass on iOS, Android, and web (if web is shipped).
- [ ] README + runbooks reflect final Blackstar architecture.
