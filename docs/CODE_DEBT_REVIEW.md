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

## Immediate decision required

**Decision to make now:** choose how `legacy/` participates in release.

- **Option A (recommended):** de-scope `legacy/` from release artifacts and CI.
- **Option B:** include `legacy/` in release scope and complete full parity + privacy/resilience hardening there.

**Why this is the gating decision:** every other debt item (test coverage scope, metadata policies, connectivity hardening, and release guardrails) depends on whether `legacy/` is in or out of the shipped path.

**Decision owner and deadline:** Product + Mobile leads should make this call in the next planning cycle and record it in README/release runbook with an explicit target release.

## Current debt snapshot

### 1) Verification debt for privacy/resilience behaviors (high)

- Existing scripts include `yarn test` and `yarn lint`, but there are currently no test/spec files in `src/`.
- Launch-critical flows are mostly manually validated, including order lifecycle and POD.
- No automated checks currently verify privacy-oriented behaviors (limited data exposure, anonymous signaling patterns, offline sync correctness).

**Impact**

- Regression risk in critical workflows and metadata/privacy assumptions.
- Low confidence when changing navigation, order assignment, or notification logic.

### 2) Legacy ambiguity and duplicate surface area (high)

- The parity plan marks the `legacy/` decision as blocking, but a final release decision is still not codified in a runbook.
- A sizable `src/legacy` footprint remains, increasing duplicate implementation and policy drift risk.

**Impact**

- Harder to enforce a single privacy/security model.
- Higher chance of accidental shipping of non-hardened legacy behavior.

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

1. **Finalize and codify the `legacy/` release decision**
   - Choose Option A or B from parity plan and publish in README + release runbook.
   - If Option A, enforce CI/build exclusion for `legacy/` artifacts.

2. **Add minimum automated regression suite for launch-critical + privacy-critical behaviors**
   - Initial 8–12 tests covering:
     - auth bootstrap and instance-link safety,
     - order lifecycle transitions,
     - POD completion validation,
     - issue lifecycle,
     - notification-to-screen routing,
     - no unintended full-route/topology leakage in driver-facing payloads.

3. **Publish a Blackstar “cell visibility contract”**
   - Document which actors can see which route/order fields before and after acceptance.
   - Add payload schema assertions (or contract tests) to prevent scope creep.

4. **Harden signaling model for metadata minimization**
   - Define bulletin-feed / anonymous pre-acceptance signal behavior for job opportunities.
   - Add optional batching/jitter strategy for non-urgent sync/notification events to reduce timing correlation.

## Sprint 2 (resilience + integrity)

5. **Introduce connectivity-mode spec (online/degraded/offline)**
   - Add queueing, compression, and burst-sync requirements for intermittent connectivity windows.
   - Validate idempotent replay behavior for delayed updates.

6. **Define tamper-evident receipt strategy for POD/disputes**
   - Standardize canonical event payload + hash policy.
   - Record integration plan for settlement/audit systems (on-chain anchoring or equivalent immutable ledger).

7. **TypeScript + lint guardrails for modern paths**
   - Prioritize migration of high-churn `src/utils/*.js` and context helpers.
   - Prevent new `.js` files in non-legacy paths unless justified.

8. **Dependency and native-hardening pass**
   - Plan RN RC-to-stable path with compatibility spike.
   - Close remaining naming/identifier cleanup from parity plan.

## Execution model

- **Weekly debt review (30 min):** opened vs closed debt items, plus risk trend.
- **Definition of done for a debt item:**
  - automated guardrail/test added, or
  - written policy + owner + release target merged.
- **Suggested KPIs (30 days):**
  - >= 10 automated tests for launch/privacy-critical flows,
  - explicit legacy decision merged,
  - published cell-visibility contract,
  - documented degraded/offline burst-sync mode,
  - zero undocumented branding allowlist entries.
