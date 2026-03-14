# Code debt review and next steps

_Last reviewed: 2026-03-14_

This review summarizes currently visible engineering debt in the Blackstar Navigator repository and proposes practical next steps for the next two sprints.

## Current debt snapshot

### 1) Testing debt (high)

- The project defines `yarn test` and `yarn lint` scripts, but there are currently no test/spec files in `src/`.
- This means launch-critical flows (auth, order lifecycle, POD, issues, chat) are currently protected mostly by manual validation.

**Impact**

- Higher regression risk on navigation flow, order state transitions, and release hardening.
- Lower confidence for refactors of contexts/hooks and migration from legacy modules.

### 2) Legacy surface area remains large (high)

- The parity plan explicitly marks the `legacy/` decision as blocking, but no explicit final decision is documented in a release-oriented runbook yet.
- The codebase still contains a substantial `src/legacy` footprint (old navigation stacks, screens, hooks, and services).

**Impact**

- Split attention between modern and legacy code paths.
- Higher chance of accidentally shipping old branding/runtime assumptions if guardrails are bypassed.

### 3) Platform + branding cleanup is partially deferred (medium)

- Branding audit exists and currently passes (`audit:branding`), but this relies on multiple exclusions/allowlists.
- The parity plan still records pending native renames (e.g., `NavigatorApp`, old package IDs) as explicit workstreams.

**Impact**

- Build/release metadata can drift from final Blackstar naming.
- Non-source artifacts may still carry historical identifiers.

### 4) Dependency/runtime stability debt (medium)

- React Native and core RN toolchain are pinned to `0.77.0-rc.6` (release candidate).

**Impact**

- Increased risk of ecosystem incompatibilities and unexpected behavior versus stable RN releases.

### 5) Documentation quality drift (low)

- README has minor formatting artifacts and does not yet provide a concise “production release checklist” linked to parity gates.

**Impact**

- Onboarding friction and inconsistent release execution.

## New next steps (prioritized)

## Sprint 1 (stabilize)

1. **Make a formal legacy decision and codify it**
   - Choose Option A or B from parity plan and add the decision to README + release runbook.
   - If Option A, exclude `legacy/` from build/release verification and CI explicitly.

2. **Add minimum regression test harness for launch-critical flows**
   - Start with 6–10 tests around:
     - auth session bootstrap,
     - order status transitions,
     - proof-of-delivery validation,
     - issue creation/edit,
     - chat notification routing.
   - Wire into CI as required checks.

3. **Convert branding audit to “strict with documented allowlist”**
   - Keep current script, but move all exclusions into a small tracked allowlist file with ownership and expiry dates.

## Sprint 2 (reduce structural debt)

4. **TypeScript migration pass for high-churn modules**
   - Prioritize `src/utils/*.js`, context helpers, and frequently edited components.
   - Add lint rules that prevent new `.js` modules in modern app paths unless justified.

5. **Native identifier hardening**
   - Close remaining native naming cleanup tasks from parity plan.
   - Add a release check that scans packaged artifacts/metadata (not only source files).

6. **Dependency hardening plan**
   - Evaluate upgrade path from `0.77.0-rc.6` to stable RN target.
   - Run a compatibility spike and capture blockers in a tracked ADR.

## Execution model

- **Weekly debt burn-down review:** 30 minutes, track “opened vs closed debt items.”
- **Definition of done for debt item:**
  - automated guardrail added, or
  - documented decision + owner + target release.
- **Suggested KPIs (30 days):**
  - >= 10 automated regression tests for critical flows,
  - explicit legacy decision merged,
  - zero undocumented branding allowlist entries,
  - TS coverage increase in non-legacy app paths.
