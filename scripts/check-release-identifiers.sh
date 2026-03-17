#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

fail=0

expect() {
  local pattern="$1"
  local file="$2"
  local msg="$3"
  if ! rg -n --fixed-strings "$pattern" "$file" >/dev/null; then
    echo "Missing: $msg ($file :: $pattern)" >&2
    fail=1
  fi
}

expect 'namespace "com.blackmarket.blackstar"' 'android/app/build.gradle' 'Android namespace'
expect 'applicationId project.env.get("APP_IDENTIFIER")' 'android/app/build.gradle' 'Android applicationId from env'
expect 'appLinkScheme: project.env.get("APP_LINK_SCHEME") ?: "blackstar"' 'android/app/build.gradle' 'Android deep-link scheme placeholder'
expect 'PRODUCT_BUNDLE_IDENTIFIER = com.blackmarket.blackstar;' 'ios/NavigatorApp.xcodeproj/project.pbxproj' 'iOS bundle identifier'
expect '<string>$(APP_LINK_SCHEME)</string>' 'ios/NavigatorApp/Info.plist' 'iOS URL scheme'
expect 'APP_IDENTIFIER=com.blackmarket.blackstar' '.env.example' 'env example app identifier'
expect 'APP_LINK_PREFIX=blackstar://' '.env.example' 'env example runtime deep-link prefix'
expect 'APP_LINK_SCHEME=blackstar' '.env.example' 'env example native deep-link scheme'

if [[ "$fail" -ne 0 ]]; then
  echo 'Release identifier checks failed.' >&2
  exit 1
fi

echo 'Release identifier checks passed.'
