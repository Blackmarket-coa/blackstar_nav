# Blackstar connectivity mode spec (foundation)

_Last updated: 2026-03-17_

## Modes

### Online
- Conditions: network reachable and failure count below degraded threshold.
- Behavior: process queued sync updates immediately.

### Degraded
- Conditions: repeated transient failures or forced mode.
- Behavior: process queued updates in bounded bursts (`burstSize`) with retry delay.

### Offline
- Conditions: network unavailable or forced mode.
- Behavior: queue updates only; do not process until mode returns to online/degraded.

## Queue + burst-sync strategy

`createConnectivitySyncQueue()` implements delayed update handling:

- accepts events with required `idempotencyKey`,
- queues events while offline,
- flushes all in online mode,
- flushes up to `burstSize` in degraded mode,
- schedules retry flush after `retryDelayMs` when backlog remains.

## Replay safety and idempotency

- Duplicate keys already queued are ignored.
- Keys already processed are ignored (prevents duplicate side effects on replay).
- `resetProcessed()` allows controlled replay for operator/manual recovery workflows.

## Runtime config controls

- `BLACKSTAR_CONNECTIVITY_MODE` (`auto|online|degraded|offline`, default `auto`)
- `BLACKSTAR_DEGRADED_FAILURE_THRESHOLD` (default `2`)
- `BLACKSTAR_BURST_SYNC_SIZE` (default `10`)
- `BLACKSTAR_SYNC_RETRY_DELAY_MS` (default `3000`)

## Current implementation linkage

- Code: `src/connectivity/mode-manager.cjs`
- Driver thin-slice integration: `src/screens/DriverOrderManagementScreen.tsx`
  - queues notification/socket-triggered reload updates,
  - applies idempotency keys,
  - uses connectivity mode to control replay timing.

## Validation

Run:

```bash
yarn test:launch-regression
```

Coverage includes delayed delivery, burst behavior, and duplicate replay safety.
