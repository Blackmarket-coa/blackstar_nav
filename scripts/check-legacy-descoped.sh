#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

run_check() {
  echo "Checking that legacy codepaths are not referenced by release-scoped source..."

  local violations=0
  local -a source_scope=(
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
    -e "from ['\"](\.\./)*src/legacy/" \
    -e "^import ['\"](\.\./)*legacy/" \
    -e "^import ['\"](\.\./)*src/legacy/" \
    -e "require\(['\"](\.\./)*legacy/" \
    -e "require\(['\"](\.\./)*src/legacy/" \
    "${source_scope[@]}"; then
    echo "Found source imports/requires into legacy paths."
    violations=1
  fi

  if rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' \
    -e '(^|[[:space:]])(cd[[:space:]]+legacy/|\./legacy/|legacy/package\.json|legacy/index\.(js|ts|tsx))' \
    .github/workflows package.json; then
    echo "Found workflow/package references to legacy release artifacts."
    violations=1
  fi

  if [ "$violations" -ne 0 ]; then
    echo "legacy descoping check failed."
    return 1
  fi

  echo "legacy descoping check passed."
}

if [[ "${1:-}" == "--self-test" ]]; then
  probe_file="src/__legacy_descoping_probe__.ts"

  cat > "$probe_file" <<'PROBE'
import '../legacy/config/defaults';
PROBE

  set +e
  run_check
  status=$?
  set -e

  rm -f "$probe_file"

  if [[ "$status" -eq 0 ]]; then
    echo "Self-test failed: intentional legacy inclusion was not detected."
    exit 1
  fi

  echo "Self-test passed: intentional legacy inclusion was detected."
  exit 0
fi

run_check
