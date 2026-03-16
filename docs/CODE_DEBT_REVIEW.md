# Code debt review and next steps

_Last reviewed: 2026-03-14_

This review summarizes engineering debt in the Blackstar Navigator repository and updates next steps using the BMC decision guide (privacy, resilience, censorship resistance) as prioritization criteria.

## Decision guide used for prioritization

For Blackstar, we prioritize debt items that improve:

1. **Cell-based exposure control** (a node/driver should only know what it must know).
2. **Metadata minimization** (reduce identifiable routing and notification trails).
3. **Intermittent-connectivity resilience** (batch + burst sync behavior).
4. **Tamper-evident logistics records** (POD/dispute/audit integrity).
5. **Cross-system interoperability** with Blackout and FreeBlackMarket patterns when practical.

## Legacy scope decision (resolved)

**Decision:** `legacy/` is **descoped** from release artifacts and CI for Blackstar launch scope.

**Implementation requirement:** document this in README/release runbook and enforce via CI/build rules so `legacy/` code paths cannot ship unintentionally.

**Why this matters:** it unblocks the rest of the debt plan by fixing test scope, policy scope, and release-guardrail scope to the modern app path only.

## Backend architecture decision (resolved)

**Decision:** adopt **Path A (Blackstar backend/gateway)** as the target architecture.

**Implementation requirement:** publish an ADR and environment contract for local/dev/staging/prod, then validate auth/orders/issues/fuel/chat end-to-end against the Blackstar gateway contract.

**Why this matters:** it defines the integration boundary early, reduces long-term platform coupling, and keeps Blackstar launch behavior aligned to Blackstar-native runtime configuration.

## Current debt snapshot

### 1) Verification debt for privacy/resilience behaviors (high)

- Existing scripts include `yarn test` and `yarn lint`, but there are currently no test/spec files in `src/`.
- Launch-critical flows are mostly manually validated, including order lifecycle and POD.
- No automated checks currently verify privacy-oriented behaviors (limited data exposure, anonymous signaling patterns, offline sync correctness).

**Impact**

- Regression risk in critical workflows and metadata/privacy assumptions.
- Low confidence when changing navigation, order assignment, or notification logic.

### 2) Legacy isolation and enforcement debt (high)

- `legacy/` has been descoped, but enforcement/documentation still needs to be completed in README/release runbook and CI/build rules.
- A sizable `src/legacy` footprint remains in-repo, so accidental inclusion risk remains until guardrails are fully wired.

**Impact**

- Without hard guardrails, descoping can drift from policy to intent-only.
- Release confidence is reduced if legacy isolation is not testable in CI.

### 3) Metadata exposure model is under-specified (high)

- The app roadmap references feature parity, but there is no explicit implementation checklist for:
  - cell-based route visibility,
  - anonymous/pre-acceptance signal handling,
  - bounded knowledge per logistics node,
  - delayed/batched signaling to reduce timing leakage.

**Impact**

- Design goals exist conceptually, but engineering work can drift into over-sharing topology or actor identity.

### 4) Connectivity hardening debt (medium)

- Current documentation does not define transport-level behavior for intermittent links (e.g., batch + burst order updates in mesh/low-connectivity contexts).

**Impact**

- Operational fragility in rural/unstable network scenarios.

### 5) Auditability debt for dispute/settlement workflows (medium)

- There is no explicit product-level checklist in this repo for tamper-evident POD/dispute events (e.g., hash anchoring or immutable receipt strategy).

**Impact**

- Harder to prove integrity of delivery events across federated participants.

### 6) Platform/tooling debt still present (medium)

- React Native is pinned to `0.77.0-rc.6`.
- Branding guardrails exist, but rely on scoped exclusions.

**Impact**

- Elevated integration risk and potential release drift.

## New next steps (prioritized)

## Sprint 1 (stabilize + policy clarity)

1. **Codify and enforce the `legacy/` descoping decision**
   - Publish the decision in README + release runbook.
   - Enforce CI/build exclusion for `legacy/` artifacts and fail builds on accidental inclusion.

2. **Execute Path A backend alignment plan**
   - Introduce Blackstar env keys for API/auth/realtime and remove scattered tenant defaults.
   - Publish ADR + env contract and track contract deltas against current SDK usage.
   - Complete end-to-end validation for auth/orders/issues/fuel/chat against gateway.

3. **Add minimum automated regression suite for launch-critical + privacy-critical behaviors**
   - Initial 8–12 tests covering:
     - auth bootstrap and instance-link safety,
     - order lifecycle transitions,
     - POD completion validation,
     - issue lifecycle,
     - notification-to-screen routing,
     - no unintended full-route/topology leakage in driver-facing payloads.

4. **Publish a Blackstar “cell visibility contract”**
   - Document which actors can see which route/order fields before and after acceptance.
   - Add payload schema assertions (or contract tests) to prevent scope creep.

5. **Harden signaling model for metadata minimization**
   - Define bulletin-feed / anonymous pre-acceptance signal behavior for job opportunities.
   - Add optional batching/jitter strategy for non-urgent sync/notification events to reduce timing correlation.

## Sprint 2 (resilience + integrity)

6. **Introduce connectivity-mode spec (online/degraded/offline)**
   - Add queueing, compression, and burst-sync requirements for intermittent connectivity windows.
   - Validate idempotent replay behavior for delayed updates.

7. **Define tamper-evident receipt strategy for POD/disputes**
   - Standardize canonical event payload + hash policy.
   - Record integration plan for settlement/audit systems (on-chain anchoring or equivalent immutable ledger).

8. **TypeScript + lint guardrails for modern paths**
   - Prioritize migration of high-churn `src/utils/*.js` and context helpers.
   - Prevent new `.js` files in non-legacy paths unless justified.

9. **Dependency and native-hardening pass**
   - Plan RN RC-to-stable path with compatibility spike.
   - Close remaining naming/identifier cleanup from parity plan.

## Execution model

- **Weekly debt review (30 min):** opened vs closed debt items, plus risk trend.
- **Definition of done for a debt item:**
  - automated guardrail/test added, or
  - written policy + owner + release target merged.
- **Suggested KPIs (30 days):**
  - >= 10 automated tests for launch/privacy-critical flows,
  - legacy descoping policy documented and CI-enforced,
  - backend ADR + environment contract merged for Path A,
  - published cell-visibility contract,
  - documented degraded/offline burst-sync mode,
  - zero undocumented branding allowlist entries.


## Backlog sync update (2026-03-16)

A re-baseline marker sweep was completed and inline `TODO`/`FIXME` markers in non-dependency code paths are now at zero.

Requested follow-on workstreams (Townhall TOWNHALL-04/05/06/07/08/09, composer TODO cluster, widget-store consolidation, room-list algorithm debt, and self-healing thin-slice implementation) are not currently represented as concrete code/docs tickets in this repository. To execute and verify them here, add a repository-local tracker (issue index or plan doc) with:

- ticket IDs and acceptance criteria,
- target files/modules,
- evidence requirements (tests/load reports/security sign-off), and
- owner + release target.


## Release-readiness batch execution (2026-03-16)

- Tracker of implementation-ready tickets is now maintained in `docs/release-readiness-tracker.md`.
- Sprint 1 item #1 (`legacy/` descoping guardrail) was completed with README policy, release runbook, and `check:legacy-descoped` script.
- Sprint 1 item #2 baseline (Path A ADR + env contract validation script) was completed; staging E2E domain validations remain open under RR-002.
