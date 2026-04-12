#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "usage: $0 <one-liner> [timestamp]" >&2
  exit 64
fi

one_liner="$1"
timestamp="${2:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}"

case "$one_liner" in
  *$'\n'*|*$'\r'*)
    echo "error: one-liner must not contain newlines" >&2
    exit 65
    ;;
esac

kebab=$(printf '%s' "$one_liner" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/^[#-]+//; s/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g' \
  | cut -c 1-40 \
  | sed -E 's/-+$//')

if [ -z "$kebab" ]; then
  kebab="idea"
fi

hash=$(printf '%s%s' "$one_liner" "$timestamp" | shasum -a 256 | awk '{print substr($1,1,6)}')
printf '%s-%s-%s\n' "${timestamp:0:10}" "$kebab" "$hash"
