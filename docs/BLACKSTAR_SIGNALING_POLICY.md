# Blackstar metadata-minimizing signaling policy (thin slice)

_Last updated: 2026-03-17_

## Objective

Reduce metadata leakage for opportunity signaling before order acceptance, while preserving timely delivery of actionable events.

## Thin-slice design

### 1) Anonymous pre-acceptance opportunity signaling

For nearby/pre-acceptance opportunities, emit and store a minimized signal payload instead of full route/topology internals.

`buildAnonymousOpportunitySignal(order)` includes only:

- `opportunity_ref`
- `status`
- `pickup_eta`
- `dropoff_eta`
- `waypoint_count`
- `entity_count`
- `has_pickup`
- `has_dropoff`

It intentionally excludes:

- route geometry/polyline,
- topology/graph details,
- tracker/breadcrumb metadata.

### 2) Batching + jitter for non-urgent events (feature-flagged)

`createSignalingBatcher()` applies batching to non-urgent signaling events when enabled.

- non-urgent events queue for `batchWindowMs + jitter`
- urgent events bypass batching immediately
- telemetry callbacks are emitted on schedule/enqueue/flush/bypass

## Rollout controls (feature flags)

Configured via runtime config:

- `BLACKSTAR_SIGNALING_BATCH_ENABLED` (default `false`)
- `BLACKSTAR_SIGNALING_BATCH_WINDOW_MS` (default `15000`)
- `BLACKSTAR_SIGNALING_JITTER_MS` (default `3000`)

Recommended rollout:

1. Start with batching disabled.
2. Enable for internal/staging tenants.
3. Observe telemetry and latency impact.
4. Expand progressively if stable.

## Current implementation path

- `src/signaling/opportunity-signaling.cjs`
- `src/contexts/OrderManagerContext.tsx` exposes `nearbyOpportunitySignals`
- `src/screens/DriverOrderManagementScreen.tsx` uses feature-flagged batcher for `order.ping` non-urgent reload signaling

## Observability hooks

Batcher emits telemetry events:

- `batch.enqueue`
- `batch.schedule`
- `batch.flush`
- `batch.bypass`

Current thin slice logs to console via `[signaling]` prefix and can be redirected to analytics transport in follow-up slices.

## Verification

Run:

```bash
yarn test:launch-regression
```

Regression coverage includes policy parsing, anonymous signal shaping, and batching/jitter decision behavior.
