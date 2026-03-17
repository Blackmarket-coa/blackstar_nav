#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ALLOWLIST_FILE="$ROOT_DIR/config/js-modern-path-allowlist.txt"

if [[ ! -f "$ALLOWLIST_FILE" ]]; then
  echo "Missing allowlist file: $ALLOWLIST_FILE" >&2
  exit 1
fi

mapfile -t MODERN_JS_FILES < <(
  cd "$ROOT_DIR"
  rg --files src | rg '\.js$' | rg -v '^src/legacy/' | sort
)

if [[ ${#MODERN_JS_FILES[@]} -eq 0 ]]; then
  echo "No modern JS files found under src/."
  exit 0
fi

mapfile -t ALLOWLIST_ENTRIES < <(
  sed -e 's/#.*$//' -e '/^[[:space:]]*$/d' "$ALLOWLIST_FILE" | sort
)

declare -A ALLOWLIST_SET
for entry in "${ALLOWLIST_ENTRIES[@]}"; do
  ALLOWLIST_SET["$entry"]=1
  if [[ ! -f "$ROOT_DIR/$entry" ]]; then
    echo "Allowlist entry does not exist: $entry" >&2
    exit 1
  fi

done

UNALLOWLISTED=()
for file in "${MODERN_JS_FILES[@]}"; do
  if [[ -z "${ALLOWLIST_SET[$file]:-}" ]]; then
    UNALLOWLISTED+=("$file")
  fi
done

if [[ ${#UNALLOWLISTED[@]} -gt 0 ]]; then
  echo "Unallowlisted modern JS files found (migrate to TS or add with rationale):" >&2
  for file in "${UNALLOWLISTED[@]}"; do
    echo "  - $file" >&2
  done
  exit 1
fi

echo "Modern JS guardrail passed (${#MODERN_JS_FILES[@]} file(s) tracked by allowlist)."
