#!/usr/bin/env bash
# Usage: smoke-test.sh <site-url>
# Checks that the page answers, has a <title>, and that every script and
# stylesheet it references also loads (catches a wrong base path, which
# leaves the page blank even though index.html itself returns 200).
set -euo pipefail

url="${1%/}/"
origin=$(echo "$url" | grep -oE '^https?://[^/]+')

for i in $(seq 1 10); do
  if curl -fsSL "$url" -o page.html && grep -qi "<title>" page.html; then break; fi
  if [ "$i" = 10 ]; then echo "::error::$url did not answer with the site"; exit 1; fi
  sleep 6
done

assets=$(grep -oE '(src|href)="[^"]+\.(js|css)"' page.html | sed -E 's/^(src|href)="//; s/"$//' || true)
for asset in $assets; do
  case "$asset" in
    http*) full="$asset" ;;
    /*) full="$origin$asset" ;;
    *) full="$url$asset" ;;
  esac
  if ! curl -fsS -o /dev/null "$full"; then
    echo "::error::$url loads, but its asset $full does not"
    exit 1
  fi
  echo "ok $full"
done

echo "Site is up at $url"
