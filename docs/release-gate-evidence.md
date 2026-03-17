# Release gate evidence

_Last updated: 2026-03-17_

This document captures repository-local evidence for launch gate closure.

## Gate checklist status

- [x] No unintended Fleetbase/Navigator naming remains in release code paths.  
  Evidence: `docs/evidence/release-gate/check-branding-tokens.txt`, `scripts/check-branding-tokens.sh`, CI steps in `.github/workflows/react-native-ci.yml` and `.github/workflows/profile-release.yml`.
- [x] Android package/app IDs, iOS bundle IDs, and deep links are Blackstar-specific.  
  Evidence: `docs/evidence/release-gate/check-release-identifiers.txt`, `scripts/check-release-identifiers.sh`, Android/iOS config files.
- [x] Runtime backend/auth/realtime configuration reflects Path A contract.  
  Evidence: `docs/evidence/release-gate/check-env-contract.txt`, `docs/evidence/release-gate/check-runtime-config.txt`, `docs/environment-contract.md`, `src/config/runtime.js`.
- [x] Feature matrix shows all `required_for_launch=yes` items as `present` (or blocked with ETA).  
  Evidence: `docs/blackstar-feature-matrix.csv` (`required_for_launch=yes` rows are all `present`).
- [x] Smoke/regression checks pass for shipped platforms.  
  Evidence: `docs/evidence/release-gate/test-launch-regression.txt`, `docs/evidence/release-gate/check-legacy-descoped.txt`, `docs/evidence/release-gate/check-modern-js-guardrail.txt`.
- [x] README and runbook match implemented architecture and release process.  
  Evidence: `README.md` and `docs/release-runbook.md` include Path A checks and final release verification commands.

## Evidence artifacts

- `docs/evidence/release-gate/check-env-contract.txt`
- `docs/evidence/release-gate/check-runtime-config.txt`
- `docs/evidence/release-gate/check-legacy-descoped.txt`
- `docs/evidence/release-gate/check-modern-js-guardrail.txt`
- `docs/evidence/release-gate/check-branding-tokens.txt`
- `docs/evidence/release-gate/check-release-identifiers.txt`
- `docs/evidence/release-gate/test-launch-regression.txt`
