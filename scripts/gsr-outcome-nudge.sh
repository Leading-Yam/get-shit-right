#!/usr/bin/env bash
set -euo pipefail

# First-line ledger guard after shell safety flags: any non-empty value disables all ledger I/O.
if [ -n "${GSR_NO_LEDGER:-}" ]; then
  exit 0
fi

# Headless mode must never prompt and must not scan the ledger.
if [ -n "${GSR_NONINTERACTIVE:-}" ]; then
  exit 0
fi

ledger_path="${GSR_LEDGER_PATH:-$HOME/.gsr/outcomes.md}"
ledger_dir="$(dirname "$ledger_path")"
dedupe_path="$ledger_dir/.nudge-shown"

if [ ! -f "$ledger_path" ]; then
  exit 0
fi
if [ -L "$ledger_path" ] || [ -L "$ledger_dir" ]; then
  echo "warning: refusing to scan symlinked outcome ledger path" >&2
  exit 66
fi

python3 - "$ledger_path" "$dedupe_path" <<'PYNUDGE'
from __future__ import annotations
import datetime as dt
import re
import sys
from pathlib import Path

ledger = Path(sys.argv[1])
dedupe = Path(sys.argv[2])
today = dt.date.today()
if dedupe.exists() and dedupe.read_text(errors="ignore").strip() == today.isoformat():
    sys.exit(0)

slug = None
scored_on = None
status = None
stale = []
for raw in ledger.read_text(errors="replace").splitlines() + ["## sentinel-000000"]:
    header = re.match(r"^##\s+(.+?)\s*$", raw)
    if header:
        if slug and status == "pending" and scored_on:
            try:
                scored_date = dt.date.fromisoformat(scored_on)
            except ValueError:
                scored_date = today
            if (today - scored_date).days > 60:
                stale.append(slug)
        slug = header.group(1)
        scored_on = None
        status = None
        continue
    field = re.match(r"^- \*\*(Scored on|Status):\*\*\s*(.*)$", raw)
    if field and slug:
        if field.group(1) == "Scored on":
            scored_on = field.group(2).strip()
        elif field.group(1) == "Status":
            status = field.group(2).strip()

if stale:
    dedupe.parent.mkdir(parents=True, exist_ok=True)
    if dedupe.parent.is_symlink():
        print("warning: refusing to write nudge dedupe file in symlinked directory", file=sys.stderr)
        sys.exit(66)
    dedupe.write_text(today.isoformat())
    dedupe.chmod(0o600)
    plural = "entry" if len(stale) == 1 else "entries"
    print(f"Reminder: {len(stale)} GSR outcome {plural} have been pending for more than 60 days. Run /gsr:outcome to resolve them.")
PYNUDGE
