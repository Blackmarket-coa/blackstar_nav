# ADR-0001: Backend alignment path for Blackstar mobile

- **Status:** Accepted
- **Date:** 2026-03-16
- **Owner:** Platform/Backend Lead

## Context

The release plan requires choosing backend alignment between:

- Path A: Blackstar gateway/backend alignment
- Path B: retain Fleetbase APIs with centralized defaults

Sprint 1 priority is policy clarity and removal of tenant-specific drift in runtime configuration.

## Decision

Adopt **Path A (Blackstar gateway/backend)** for release scope.

The mobile runtime contract will use Blackstar-specific gateway and realtime environment keys, with Fleetbase SDK usage only where required for compatibility and with explicit adapter boundaries.

## Consequences

### Positive

- A single environment contract for local/dev/staging/prod.
- Reduced tenant-default sprawl in code.
- Cleaner release validation and incident triage.

### Negative

- Migration effort is required for existing assumptions tied to Fleetbase defaults.
- E2E testing needs coordinated staging environments for gateway and realtime services.

## Implementation scope

1. Publish environment contract (`docs/environment-contract.md`).
2. Enforce required variables with `scripts/check-env-contract.sh`.
3. Track contract deltas and adapters in release tracker ticket RR-002.
4. Complete domain validations for auth/orders/issues/fuel/chat in staging.

## Rollback strategy

If gateway path causes a release blocker:

1. Freeze feature changes.
2. Re-enable compatibility adapters behind explicit flags.
3. Ship only after documented sign-off from product + platform owners.
