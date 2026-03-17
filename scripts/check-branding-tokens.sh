#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ALLOWLIST_FILE="config/branding-token-allowlist.txt"
PATTERN='flbnavigator|io\.fleetbase\.navigator'

if [[ ! -f "$ALLOWLIST_FILE" ]]; then
  echo "Missing allowlist: $ALLOWLIST_FILE" >&2
  exit 1
fi

mapfile -t MATCHES < <(
  rg -n "$PATTERN" \
    src android ios App.tsx index.js README.md .env.example android/app/build.gradle ios/NavigatorApp.xcodeproj/project.pbxproj \
    --glob '!**/build/**' \
    --glob '!**/Pods/**' \
    --glob '!**/*.bundle' \
    --glob '!src/legacy/**' \
    --glob '!android/app/_BUCK' || true
)

if [[ ${#MATCHES[@]} -eq 0 ]]; then
  echo 'Branding token check passed.'
  exit 0
fi

mapfile -t ALLOWLIST < <(sed -e 's/#.*$//' -e '/^[[:space:]]*$/d' "$ALLOWLIST_FILE")

violations=()
for line in "${MATCHES[@]}"; do
  allowed=false
  for allow in "${ALLOWLIST[@]}"; do
    if [[ "$line" == *"$allow"* ]]; then
      allowed=true
      break
    fi
  done

  if [[ "$allowed" == false ]]; then
    violations+=("$line")
  fi
done

if [[ ${#violations[@]} -gt 0 ]]; then
  echo 'Disallowed branding tokens found:' >&2
  printf '  %s\n' "${violations[@]}" >&2
  exit 1
fi

echo 'Branding token check passed (allowlisted matches only).'
