#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Checking that legacy codepaths are not referenced by release-scoped source..."

violations=0

SOURCE_SCOPE=(
  src
  android
  ios
  index.js
  index.native.tsx
  index.web.tsx
  package.json
  README.md
  .github/workflows
)

if rg -n --hidden --glob '!.git/**' --glob '!legacy/**' --glob '!src/legacy/**' --glob '!docs/**' --glob '!node_modules/**' \
  -e "from ['\"](\.\./)*legacy/" \
  -e "require\(['\"](\.\./)*legacy/" \
  -e "from ['\"](\.\./)*src/legacy/" \
  -e "require\(['\"](\.\./)*src/legacy/" \
  "${SOURCE_SCOPE[@]}"; then
  echo "Found source imports/requires into legacy paths."
  violations=1
fi

if rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' -e '(^|[[:space:]])(cd[[:space:]]+legacy/|\./legacy/|legacy/package\.json|legacy/index\.(js|ts|tsx))' .github/workflows package.json; then
  echo "Found workflow/package references to legacy release artifacts."
  violations=1
fi

if [ "$violations" -ne 0 ]; then
  echo "legacy descoping check failed."
  exit 1
fi

echo "legacy descoping check passed."
