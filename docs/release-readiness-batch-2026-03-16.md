# Release-readiness completion batch (2026-03-16)

## Numbered execution plan

1. Create a repository-local delivery tracker that converts remaining planning bullets into implementation-ready tickets with IDs, owners, acceptance criteria, evidence requirements, and release targets.
2. Execute Sprint 1 highest-priority item #1 (`legacy/` descoping): codify policy in README + release runbook and enforce exclusion guardrails in CI checks.
3. Execute Sprint 1 item #2 baseline (`Path A` backend alignment): add ADR and environment contract artifact with explicit acceptance criteria and validation checks.
4. Synchronize source planning docs to reference the tracker and completed work, including task-level evidence and unresolved risks.

## Workstream completion log

### Workstream 1 — Repo-local implementation tickets

Status: completed

#### Delivered

- Added `docs/release-readiness-tracker.md` as the source of truth for release-readiness tickets.
- Captured all remaining planning items from:
  - `docs/BLACKSTAR_FEATURE_PARITY_PLAN.md`
  - `docs/CODE_DEBT_REVIEW.md`
  - `docs/unfinished-code-checklist.md`
- Added concrete tracker entries for previously unrepresented workstreams:
  - `TOWNHALL-04` through `TOWNHALL-09`
  - composer TODO cluster
  - widget-store consolidation
  - room-list algorithm debt
  - self-healing thin-slice implementation

Files changed:

- `docs/release-readiness-tracker.md` (new)

Tests/checks run:

- `rg -n "^## RR-|^## TOWNHALL-|^## COMP-|^## WIDGET-|^## ROOM-|^## SELFHEAL-" docs/release-readiness-tracker.md`

Unresolved risks:

- Owners are role-based aliases until named individuals are assigned in planning review.
- Some acceptance criteria depend on backend environments and load/security sign-offs not available in local CI.

### Workstream 2 — Sprint 1 priority #1 (`legacy/` descoping)

Status: completed

#### Delivered

- Documented the descoping policy in README and a dedicated release runbook.
- Added CI-oriented guardrail script to fail when release-relevant paths import/execute `legacy/` modules.
- Wired guardrail into package scripts for repeatable local/CI validation.

Files changed:

- `README.md`
- `docs/release-runbook.md` (new)
- `scripts/check-legacy-descoped.sh` (new)
- `package.json`

Tests/checks run:

- `bash scripts/check-legacy-descoped.sh`
- `yarn run check:legacy-descoped`

Unresolved risks:

- Guardrail focuses on import/require patterns and build scripts; runtime dynamic loading via indirect mechanisms would require deeper static analysis.

### Workstream 3 — Sprint 1 priority #2 (`Path A` backend alignment baseline)

Status: completed

#### Delivered

- Added ADR documenting Path A decision and migration scope.
- Added explicit environment contract for local/dev/staging/prod.
- Added environment-contract checker script and package command to validate required keys and value formats.

Files changed:

- `docs/adr/ADR-0001-path-a-blackstar-gateway.md` (new)
- `docs/environment-contract.md` (new)
- `scripts/check-env-contract.sh` (new)
- `package.json`

Tests/checks run:

- `bash scripts/check-env-contract.sh --sample`

Unresolved risks:

- End-to-end gateway validations for auth/orders/issues/fuel/chat require staging credentials and service availability not present in this local environment.
