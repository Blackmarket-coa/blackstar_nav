# Blackstar release runbook

## Scope boundary

Blackstar release artifacts include modern app paths only. The following trees are out of release scope:

- `legacy/`
- `src/legacy/`

## Pre-release checks

Reference policy: `docs/BLACKSTAR_CELL_VISIBILITY_CONTRACT.md`.
Signaling policy: `docs/BLACKSTAR_SIGNALING_POLICY.md`.
Connectivity policy: `docs/BLACKSTAR_CONNECTIVITY_MODE_SPEC.md`.
Receipt policy: `docs/BLACKSTAR_TAMPER_EVIDENT_RECEIPTS_SPEC.md`.


1. Verify descoping guardrail:

   ```bash
   yarn check:legacy-descoped
   ```

2. Verify branding guardrail:

   ```bash
   yarn audit:branding
   ```

3. Verify environment contract for gateway configuration:

   ```bash
   yarn check:env-contract
   yarn check:runtime-config
   yarn test:launch-regression
   ```

## Packaging constraints

- CI workflows and release jobs must not build from `legacy/` entrypoints.
- Any exception requires a documented release waiver with owner approval and expiration date.
- If `check:legacy-descoped` fails, release is blocked until violations are removed.

## Release evidence bundle

For each release candidate, attach:

- Output of `yarn check:legacy-descoped`
- Output of `yarn audit:branding`
- Output of `yarn check:env-contract`
- Output of `yarn check:runtime-config`
- Output of `yarn test:launch-regression`
- Commit hash and tag
- Owner approval for go/no-go decision

## How to verify

Run both commands before cutting a release candidate:

```bash
yarn check:legacy-descoped
yarn check:legacy-descoped:self-test
yarn check:runtime-config
yarn test:launch-regression
```

Expected behavior:

- `yarn check:legacy-descoped` returns `legacy descoping check passed.`
- `yarn check:legacy-descoped:self-test` returns `Self-test passed: intentional legacy inclusion was detected.`
- `yarn check:runtime-config` returns `Runtime config regression checks passed.`
- `yarn test:launch-regression` returns all launch/privacy regression tests as passing.


## Degraded mode operator notes

When operating in degraded mode:

- Verify `BLACKSTAR_CONNECTIVITY_MODE=auto` (or explicitly `degraded` for drills).
- Tune `BLACKSTAR_BURST_SYNC_SIZE` to avoid burst overload during reconnect windows.
- Tune `BLACKSTAR_SYNC_RETRY_DELAY_MS` to match backend rate limits and expected latency.
- Use telemetry logs (`[connectivity]`) to monitor enqueue/flush/retry behavior and backlog drain.
- Never disable idempotency-key generation for queued events; replay safety depends on it.


## Tamper-evident receipt operator notes

- Verify POD/dispute writes include `receipt_metadata` with payload, hash, signature, and signed timestamp.
- During incident review, recompute verification with stored payload and shared secret; reject records failing verification.
- Preserve local `tamper_evident_receipts` logs for forensic reconciliation until backend ledger export is complete.
