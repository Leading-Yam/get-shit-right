#!/usr/bin/env bash
set -euo pipefail

# First-line ledger guard after shell safety flags: any non-empty value disables all ledger I/O.
if [ -n "${GSR_NO_LEDGER:-}" ]; then
  exit 0
fi

usage() {
  echo "usage: $0 <slug> <shipped|killed|pivoted> <lesson> [resolved_on]" >&2
}

if [ "$#" -lt 3 ] || [ "$#" -gt 4 ]; then
  usage
  exit 64
fi

slug="$1"
status="$2"
lesson="$3"
resolved_on="${4:-$(date -u +%Y-%m-%d)}"
ledger_path="${GSR_LEDGER_PATH:-$HOME/.gsr/outcomes.md}"
ledger_dir="$(dirname "$ledger_path")"

case "$slug" in
  *$'\n'*|*$'\r'*) echo "error: slug must not contain newlines" >&2; exit 65 ;;
esac
if ! printf '%s' "$slug" | grep -Eq '^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9][a-z0-9-]{0,39}-[a-f0-9]{6}$'; then
  echo "error: invalid idea_slug: $slug" >&2
  exit 65
fi
case "$status" in shipped|killed|pivoted) ;; *) echo "error: invalid status: $status" >&2; exit 65 ;; esac
if ! printf '%s' "$resolved_on" | grep -Eq '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'; then
  echo "error: resolved_on must be YYYY-MM-DD" >&2
  exit 65
fi
if [ ! -f "$ledger_path" ]; then
  echo "error: ledger not found: $ledger_path" >&2
  exit 66
fi
if [ -L "$ledger_path" ] || [ -L "$ledger_dir" ]; then
  echo "warning: refusing to write symlinked ledger path" >&2
  exit 66
fi
python3 - "$ledger_path" <<'PYMODE'
import os, stat, sys
mode = os.stat(sys.argv[1]).st_mode
if mode & stat.S_IWOTH:
    print(f"warning: refusing to write world-writable ledger: {sys.argv[1]}", file=sys.stderr)
    sys.exit(66)
PYMODE

tmp="$(mktemp "${ledger_dir}/outcomes.XXXXXX")"
python3 - "$ledger_path" "$tmp" "$slug" "$status" "$lesson" "$resolved_on" <<'PYRESOLVE'
from __future__ import annotations
import re
import sys
from pathlib import Path

src = Path(sys.argv[1])
dst = Path(sys.argv[2])
slug = sys.argv[3]
status = sys.argv[4]
lesson = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", sys.argv[5])[:200]
resolved_on = sys.argv[6]
lines = src.read_text(errors="replace").splitlines()
out = []
in_target = False
found = False
for line in lines:
    if re.match(r"^##\s+", line):
        in_target = line.strip() == f"## {slug}"
        if in_target:
            found = True
        out.append(line)
        continue
    if in_target and line.startswith("- **Status:**"):
        out.append(f"- **Status:** {status}")
    elif in_target and line.startswith("- **Resolved on:**"):
        out.append(f"- **Resolved on:** {resolved_on}")
    elif in_target and line.startswith("- **Lesson:**"):
        out.append(f"- **Lesson:** {lesson}")
    else:
        out.append(line)
if not found:
    print(f"error: idea_slug not found in ledger: {slug}", file=sys.stderr)
    sys.exit(65)
dst.write_text("\n".join(out) + "\n")
PYRESOLVE
mv "$tmp" "$ledger_path"
chmod 600 "$ledger_path"
