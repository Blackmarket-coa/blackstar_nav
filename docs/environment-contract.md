# Blackstar environment contract

This contract defines required runtime variables for Blackstar mobile releases.

## Required variables

| Key | Required | Example | Notes |
|---|---|---|---|
| `APP_NAME` | yes | `Blackstar Navigator` | User-visible app display name |
| `APP_IDENTIFIER` | yes | `com.blackmarket.blackstar` | Mobile bundle/package identifier |
| `APP_LINK_PREFIX` | yes | `blackstar://` | Must end with `://` |
| `BLACKSTAR_GATEWAY_HOST` | yes | `https://api.blackmarket.coa` | Must be HTTPS |
| `BLACKSTAR_GATEWAY_KEY` | yes | `bs_live_...` | Secret; never commit actual value |
| `BLACKSTAR_SOCKET_HOST` | yes | `socket.blackmarket.coa` | Realtime host |
| `BLACKSTAR_SOCKET_PORT` | yes | `8000` | Numeric port |
| `BLACKSTAR_SOCKET_SECURE` | yes | `true` | Boolean `true`/`false` |

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
