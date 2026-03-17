# Blackstar cell visibility contract

_Last updated: 2026-03-17_

This contract defines driver-facing order field visibility before and after acceptance.

## Actor matrix

| Actor | Lifecycle phase | Allowed fields | Explicitly forbidden fields |
|---|---|---|---|
| Driver (candidate, not accepted) | pre-acceptance (`created`, `dispatched`, `unassigned`) | `id`, `status`, `public_id`, `payload.pickup`, `payload.dropoff`, `payload.waypoints`, `payload.entities`, `payload.current_waypoint`, `payload.task_ref`, `payload.pickup_eta`, `payload.dropoff_eta` | `tracker_data`, `route`, `full_route`, `topology`, `graph_nodes`, `graph_edges`, `payload.route`, `payload.route_geometry`, `payload.route_polyline`, `payload.topology` |
| Driver (assigned/accepted) | post-acceptance (`assigned`, `enroute`, `arrived`, `completed`) | all pre-acceptance fields plus route/tracker fields required for navigation and completion | none beyond standard role authorization rules |
| Ops/Admin | any | full operational payload per backend authorization | n/a |

## Enforced rule path in app code

- `OrderManagerContext` sanitizes nearby/pre-acceptance orders using `sanitizeDriverOrderPayload(..., { accepted: false })`.
- `OrderManagerContext` enforces contract assertions via `assertNoPreAcceptanceLeak(...)` before storing nearby orders.
- Contract code lives in `src/contracts/cell-visibility.cjs`.

## Assertion behavior

If pre-acceptance payload contains forbidden fields, the app throws:

- `Cell visibility contract violation: unauthorized pre-acceptance fields exposed: ...`

This is intentional fail-fast behavior to prevent privacy metadata leakage.

## Verification

Run:

```bash
yarn test:launch-regression
```

The suite contains explicit allowed/disallowed visibility tests for this contract.
