#!/usr/bin/env bash
set -euo pipefail

# First-line ledger guard after shell safety flags: any non-empty value disables all ledger I/O.
if [ -n "${GSR_NO_LEDGER:-}" ]; then
  exit 0
fi

usage() {
  echo "usage: $0 <slug> <BUILD|PIVOT|KILL> [pending|shipped|killed|pivoted] [resolved_on|—] [lesson] [scored_on]" >&2
}

if [ "$#" -lt 2 ] || [ "$#" -gt 6 ]; then
  usage
  exit 64
fi

slug="$1"
verdict="$2"
status="${3:-pending}"
resolved_on="${4:-—}"
lesson="${5:-—}"
scored_on="${6:-$(date -u +%Y-%m-%d)}"
ledger_path="${GSR_LEDGER_PATH:-$HOME/.gsr/outcomes.md}"
ledger_dir="$(dirname "$ledger_path")"

case "$slug" in
  *$'\n'*|*$'\r'*) echo "error: slug must not contain newlines" >&2; exit 65 ;;
esac
if ! printf '%s' "$slug" | grep -Eq '^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9][a-z0-9-]{0,39}-[a-f0-9]{6}$'; then
  echo "error: invalid idea_slug: $slug" >&2
  exit 65
fi
case "$verdict" in BUILD|PIVOT|KILL) ;; *) echo "error: invalid verdict: $verdict" >&2; exit 65 ;; esac
case "$status" in pending|shipped|killed|pivoted) ;; *) echo "error: invalid status: $status" >&2; exit 65 ;; esac
if ! printf '%s' "$scored_on" | grep -Eq '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'; then
  echo "error: scored_on must be YYYY-MM-DD" >&2
  exit 65
fi
if [ "$resolved_on" != "—" ] && ! printf '%s' "$resolved_on" | grep -Eq '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'; then
  echo "error: resolved_on must be YYYY-MM-DD or —" >&2
  exit 65
fi

umask 077
mkdir -p "$ledger_dir"
if [ ! -d "$ledger_dir" ] || [ -L "$ledger_dir" ]; then
  echo "warning: refusing to write ledger because directory is missing or symlinked: $ledger_dir" >&2
  exit 66
fi
if [ -L "$ledger_path" ]; then
  echo "warning: refusing to write ledger because file is a symlink: $ledger_path" >&2
  exit 66
fi
if [ -e "$ledger_path" ]; then
  python3 - "$ledger_path" <<'PYMODE'
import os, stat, sys
mode = os.stat(sys.argv[1]).st_mode
if mode & stat.S_IWOTH:
    print(f"warning: refusing to write world-writable ledger: {sys.argv[1]}", file=sys.stderr)
    sys.exit(66)
PYMODE
fi

lesson_clean=$(printf '%s' "$lesson" | tr -d '\000-\010\013\014\016-\037\177' | cut -c 1-200)

tmp="$(mktemp "${ledger_dir}/outcomes.XXXXXX")"
{
  if [ -f "$ledger_path" ]; then
    cat "$ledger_path"
    tail_char=$(tail -c 1 "$ledger_path" 2>/dev/null || true)
    if [ -n "$tail_char" ]; then printf '\n'; fi
    printf '\n'
  fi
  cat <<ENTRY
## $slug

- **Verdict:** $verdict
- **Scored on:** $scored_on
- **Status:** $status
- **Resolved on:** $resolved_on
- **Lesson:** $lesson_clean
ENTRY
} > "$tmp"

mv "$tmp" "$ledger_path"
chmod 600 "$ledger_path"
