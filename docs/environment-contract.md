# Blackstar environment contract

This contract defines required runtime variables for Blackstar mobile releases.

Related ADR: `docs/adr/ADR-0001-path-a-blackstar-gateway.md`.

## Required variables

| Key | Required | Default | Example | Validation behavior |
|---|---|---|---|---|
| `APP_NAME` | yes | none | `Blackstar Navigator` | Required for release metadata and display naming checks. |
| `APP_IDENTIFIER` | yes | none | `com.blackmarket.blackstar` | Required for bundle/package identity alignment. |
| `APP_LINK_PREFIX` | yes | none | `blackstar://` | Must end with `://`; startup validation fails otherwise. |
| `BLACKSTAR_GATEWAY_HOST` | yes | none | `https://api.blackmarket.coa` | Must start with `https://`; startup validation fails otherwise. |
| `BLACKSTAR_GATEWAY_KEY` | yes | none | `bs_live_...` | Must be non-empty; startup validation fails otherwise. |
| `BLACKSTAR_SOCKET_HOST` | yes | `socket.blackmarket.coa` | `socket.blackmarket.coa` | Must be non-empty after fallback resolution. |
| `BLACKSTAR_SOCKET_PORT` | yes | `8000` | `8000` | Must parse to integer range `1-65535`. |
| `BLACKSTAR_SOCKET_SECURE` | yes | `true` | `true` | Must resolve to boolean `true`/`false`. |
| `BLACKSTAR_SOCKET_PATH` | no | `/socketcluster/` | `/socketcluster/` | Optional; fallback applied when unset. |
| `BLACKSTAR_SIGNALING_BATCH_ENABLED` | no | `false` | `true` | Enables batching/jitter for non-urgent signaling. |
| `BLACKSTAR_SIGNALING_BATCH_WINDOW_MS` | no | `15000` | `2500` | Batch window in ms when signaling batching is enabled. |
| `BLACKSTAR_SIGNALING_JITTER_MS` | no | `3000` | `500` | Adds random jitter (ms) to reduce timing correlation. |
| `BLACKSTAR_CONNECTIVITY_MODE` | no | `auto` | `degraded` | Connectivity control mode: `auto`, `online`, `degraded`, `offline`. |
| `BLACKSTAR_DEGRADED_FAILURE_THRESHOLD` | no | `2` | `3` | Failure count before `auto` mode enters degraded behavior. |
| `BLACKSTAR_BURST_SYNC_SIZE` | no | `10` | `5` | Max queued updates processed per degraded-mode flush. |
| `BLACKSTAR_SYNC_RETRY_DELAY_MS` | no | `3000` | `5000` | Delay before retrying queued updates while backlog remains. |
| `FLEETBASE_HOST` | compatibility fallback | none | `https://api.blackmarket.coa` | Used only as fallback source for `BLACKSTAR_GATEWAY_HOST`. |
| `FLEETBASE_KEY` | compatibility fallback | none | `fb_...` | Used only as fallback source for `BLACKSTAR_GATEWAY_KEY`. |
| `SOCKETCLUSTER_HOST` | compatibility fallback | none | `socket.blackmarket.coa` | Used only as fallback source for `BLACKSTAR_SOCKET_HOST`. |
| `SOCKETCLUSTER_PORT` | compatibility fallback | none | `8000` | Used only as fallback source for `BLACKSTAR_SOCKET_PORT`. |
| `SOCKETCLUSTER_SECURE` | compatibility fallback | none | `true` | Used only as fallback source for `BLACKSTAR_SOCKET_SECURE`. |
| `SOCKETCLUSTER_PATH` | compatibility fallback | none | `/socketcluster/` | Used only as fallback source for `BLACKSTAR_SOCKET_PATH`. |

## Environment mapping

- **local:** developer values with sandbox credentials.
- **dev:** shared development gateway and socket endpoints.
- **staging:** pre-release parity validation environment.
- **prod:** production gateway and socket endpoints.

## Validation command

Run the contract checker before release and in CI:

```bash
yarn check:env-contract
```

Use sample mode to validate checker behavior without secrets:

```bash
bash scripts/check-env-contract.sh --sample
```


## Validation behavior

Startup configuration is validated in `ConfigProvider` using `assertValidRuntimeConfig()` from `src/config/runtime.js`.

- Invalid required values throw an error before the app proceeds to network initialization.
- Error messages include field-specific remediation text so operators can fix `.env` or instance-link configuration quickly.
- Runtime config resolution precedence is: instance-link overrides → Blackstar env keys → compatibility fallback keys → defaults (socket + signaling policy fields).
