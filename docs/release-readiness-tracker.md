# Release Readiness Tracker

_Last updated: 2026-03-16_

This tracker converts remaining planning work into implementation-ready repository-local tickets.

## Sprint 1

### RR-001 — Enforce `legacy/` descoping in release paths
- **Owner:** Mobile Platform Lead
- **Target release:** 2.1.0
- **Priority:** P0
- **Acceptance criteria:**
  1. README contains explicit policy that `legacy/` is out of release scope.
  2. Release runbook states release artifact boundaries that exclude `legacy/`.
  3. CI/local check fails if non-legacy release paths import `legacy/` or `src/legacy` modules.
- **Evidence required:**
  - Updated README + release runbook
  - Guardrail script output in CI logs

### RR-002 — Path A backend alignment ADR and environment contract
- **Owner:** Platform/Backend Lead
- **Target release:** 2.1.0
- **Priority:** P0
- **Acceptance criteria:**
  1. ADR documents decision to use Blackstar gateway (Path A), migration scope, and rollback conditions.
  2. Environment contract doc defines required variables for local/dev/staging/prod.
  3. Validation script checks required variables and basic format constraints.
- **Evidence required:**
  - ADR markdown merged
  - Environment contract markdown merged
  - Contract-check script command output

### RR-003 — Minimum automated regression suite for launch/privacy-critical behaviors
- **Owner:** QA Lead
- **Target release:** 2.1.1
- **Priority:** P1
- **Acceptance criteria:**
  1. 8–12 automated tests cover auth bootstrap, order lifecycle, POD completion, issue lifecycle, notification routing, and payload minimization.
  2. Tests run in CI with deterministic seed data or mocks.
  3. Failures include actionable assertion messages mapped to domain labels.
- **Evidence required:**
  - Added tests under `__tests__/` or equivalent suites
  - CI test job output with passing summary

### RR-004 — Publish and enforce cell visibility contract
- **Owner:** Product Security + Mobile Lead
- **Target release:** 2.1.1
- **Priority:** P1
- **Acceptance criteria:**
  1. Contract defines field-level visibility per actor and lifecycle stage.
  2. Contract tests or schema assertions validate payload visibility constraints.
  3. Any exception path has explicit owner-approved rationale.
- **Evidence required:**
  - Contract document in `docs/`
  - Contract test outputs and fixture references

### RR-005 — Signaling metadata minimization policy
- **Owner:** Platform Privacy Lead
- **Target release:** 2.1.1
- **Priority:** P1
- **Acceptance criteria:**
  1. Policy defines pre-acceptance opportunity signal behavior and allowed metadata.
  2. Optional batching/jitter behavior documented with defaults and override controls.
  3. Tests verify non-urgent notifications obey batching/jitter rules when enabled.
- **Evidence required:**
  - Policy document
  - Configuration references
  - Automated test or simulation output

## Sprint 2

### RR-006 — Connectivity mode spec (online/degraded/offline)
- **Owner:** Mobile Platform Lead
- **Target release:** 2.2.0
- **Priority:** P2
- **Acceptance criteria:**
  1. Spec defines queueing, replay, compression, and burst-sync behavior by mode.
  2. Idempotent replay behavior verified in tests.
  3. User-facing state transitions documented for degraded and offline handling.
- **Evidence required:**
  - Spec document
  - Test logs proving replay correctness

### RR-007 — Tamper-evident receipt strategy for POD/disputes
- **Owner:** Product + Platform Security
- **Target release:** 2.2.0
- **Priority:** P2
- **Acceptance criteria:**
  1. Canonical POD/dispute event payload schema documented.
  2. Hashing/signature strategy defined and versioned.
  3. Settlement/audit integration plan documented with immutable anchoring option.
- **Evidence required:**
  - Strategy document
  - Prototype verification output or integration checklist

### RR-008 — TS/lint guardrails for modern paths
- **Owner:** Frontend Lead
- **Target release:** 2.2.0
- **Priority:** P2
- **Acceptance criteria:**
  1. High-churn utility/context files migrated to TypeScript or covered by type checks.
  2. Lint rule prevents new `.js` files in non-legacy paths unless allowlisted.
  3. Migration guide includes approved exception workflow.
- **Evidence required:**
  - Config and migrated-file diffs
  - Lint/type-check outputs

### RR-009 — Dependency and native hardening pass
- **Owner:** Mobile Release Engineer
- **Target release:** 2.2.0
- **Priority:** P2
- **Acceptance criteria:**
  1. RN RC-to-stable upgrade plan includes compatibility matrix and rollback.
  2. Remaining brand identifier cleanup tracked and tested.
  3. Release pipeline signs and packages with finalized Blackstar identifiers.
- **Evidence required:**
  - Upgrade plan
  - Build outputs and release validation logs

## Feature parity plan conversion tickets

### RR-010 — Domain parity matrix closure
- **Owner:** Product Owner + QA Lead
- **Target release:** 2.1.1
- **Priority:** P1
- **Acceptance criteria:**
  1. All `required_for_launch=yes` rows in `docs/blackstar-feature-matrix.csv` are `present` or blocker-tagged with ETA.
  2. Each blocker has owning team and mitigation plan.
  3. Weekly status references matrix deltas.
- **Evidence required:**
  - Updated matrix in git
  - Status snapshot in docs or release note

### RR-011 — Branding/identifier final gate
- **Owner:** Mobile Lead
- **Target release:** 2.1.0
- **Priority:** P0
- **Acceptance criteria:**
  1. `yarn audit:branding` passes on CI default branch.
  2. Any allowlisted legacy token has documented justification.
  3. Android/iOS identifiers and link schemes match release policy.
- **Evidence required:**
  - CI logs for branding audit
  - Allowlist rationale references

## Requested but previously unrepresented workstreams (now tracked)

### TOWNHALL-04 — Townhall execution slice 04
- **Owner:** Program Manager
- **Target release:** 2.2.0
- **Acceptance criteria:**
  1. Scope document exists with impacted modules and migration sequencing.
  2. Delivery checklist includes test, security, and rollout gates.
  3. Stakeholder sign-off recorded in tracker update.
- **Evidence required:** test reports, security sign-off link, release note link

### TOWNHALL-05 — Townhall execution slice 05
- **Owner:** Program Manager
- **Target release:** 2.2.0
- **Acceptance criteria:**
  1. Module-level implementation tasks created with estimates.
  2. Risks and dependencies documented with owner and mitigation.
  3. Completion evidence attached per task.
- **Evidence required:** implementation PR refs, risk log update, validation report

### TOWNHALL-06 — Townhall execution slice 06
- **Owner:** Program Manager
- **Target release:** 2.2.1
- **Acceptance criteria:**
  1. Feature contract doc approved by product and engineering.
  2. Test plan includes failure-mode coverage.
  3. Rollout strategy includes backout trigger.
- **Evidence required:** contract doc, test run output, rollout checklist

### TOWNHALL-07 — Townhall execution slice 07
- **Owner:** Program Manager
- **Target release:** 2.2.1
- **Acceptance criteria:**
  1. Scope and ownership matrix published.
  2. Integration dependencies validated with owning teams.
  3. Done criteria verified in CI and release notes.
- **Evidence required:** ownership matrix, integration report, CI run URLs

### TOWNHALL-08 — Townhall execution slice 08
- **Owner:** Program Manager
- **Target release:** 2.3.0
- **Acceptance criteria:**
  1. Backlog items decomposed to code-level tickets.
  2. Exit criteria map to measurable KPIs.
  3. Post-release verification plan approved.
- **Evidence required:** ticket list, KPI baseline table, verification plan

### TOWNHALL-09 — Townhall execution slice 09
- **Owner:** Program Manager
- **Target release:** 2.3.0
- **Acceptance criteria:**
  1. Cross-team dependency map includes sequencing constraints.
  2. Release readiness review checklist complete.
  3. Closure report published with outcomes.
- **Evidence required:** dependency map, readiness checklist, closure report

### COMP-001 — Composer TODO cluster execution ticket
- **Owner:** Messaging Feature Lead
- **Target release:** 2.2.0
- **Acceptance criteria:**
  1. Composer backlog decomposed into testable tasks.
  2. Validation includes message draft persistence and send/error behavior.
  3. Regression checks cover attachment edge cases.
- **Evidence required:** task breakdown, test output, QA sign-off

### WIDGET-001 — Widget-store consolidation ticket
- **Owner:** Frontend Architecture Lead
- **Target release:** 2.2.0
- **Acceptance criteria:**
  1. Current widget-store variants inventoried.
  2. Consolidation design and migration steps approved.
  3. Runtime parity validated with contract checks.
- **Evidence required:** design doc, migration PR refs, contract test logs

### ROOM-001 — Room-list algorithm debt ticket
- **Owner:** Realtime Lead
- **Target release:** 2.2.1
- **Acceptance criteria:**
  1. Baseline complexity and failure modes documented.
  2. Replacement algorithm benchmarked on representative datasets.
  3. Rollout includes correctness and performance assertions.
- **Evidence required:** benchmark output, correctness tests, rollout guardrail doc

### SELFHEAL-001 — Self-healing thin-slice implementation ticket
- **Owner:** Reliability Lead
- **Target release:** 2.3.0
- **Acceptance criteria:**
  1. Thin-slice scope defines trigger, remediation, and observability metrics.
  2. Implementation includes safe retry/backoff and circuit-breaker behavior.
  3. Post-failure replay report demonstrates expected recovery.
- **Evidence required:** implementation PR refs, reliability test logs, replay report
