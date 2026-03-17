#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ "${1:-}" == "--sample" ]]; then
  export APP_NAME="Blackstar Navigator"
  export APP_IDENTIFIER="com.blackmarket.blackstar"
  export APP_LINK_PREFIX="blackstar://"
  export BLACKSTAR_GATEWAY_HOST="https://api.blackmarket.coa"
  export BLACKSTAR_GATEWAY_KEY="sample_key"
  export BLACKSTAR_SOCKET_HOST="socket.blackmarket.coa"
  export BLACKSTAR_SOCKET_PORT="8000"
  export BLACKSTAR_SOCKET_SECURE="true"
fi

required=(
  APP_NAME
  APP_IDENTIFIER
  APP_LINK_PREFIX
  BLACKSTAR_GATEWAY_HOST
  BLACKSTAR_GATEWAY_KEY
  BLACKSTAR_SOCKET_HOST
  BLACKSTAR_SOCKET_PORT
  BLACKSTAR_SOCKET_SECURE
)

errors=0

for key in "${required[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    echo "Missing required variable: $key"
    errors=1
  fi
done

if [[ -n "${APP_LINK_PREFIX:-}" && ! "${APP_LINK_PREFIX}" =~ ://$ ]]; then
  echo "APP_LINK_PREFIX must end with ://"
  errors=1
fi

if [[ -n "${BLACKSTAR_GATEWAY_HOST:-}" && ! "${BLACKSTAR_GATEWAY_HOST}" =~ ^https:// ]]; then
  echo "BLACKSTAR_GATEWAY_HOST must start with https://"
  errors=1
fi

if [[ -n "${BLACKSTAR_SOCKET_PORT:-}" && ! "${BLACKSTAR_SOCKET_PORT}" =~ ^[0-9]+$ ]]; then
  echo "BLACKSTAR_SOCKET_PORT must be numeric"
  errors=1
fi

if [[ -n "${BLACKSTAR_SOCKET_SECURE:-}" && ! "${BLACKSTAR_SOCKET_SECURE}" =~ ^(true|false)$ ]]; then
  echo "BLACKSTAR_SOCKET_SECURE must be true or false"
  errors=1
fi

if [[ "$errors" -ne 0 ]]; then
  echo "Environment contract check failed."
  exit 1
fi

echo "Environment contract check passed."
