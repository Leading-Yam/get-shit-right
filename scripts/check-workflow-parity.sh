#!/usr/bin/env bash
set -euo pipefail

canonical="skills/score/score-workflow.md"
copies=(
  "skills/quick/score-workflow.md"
  "skills/decide/score-workflow.md"
)

for copy in "${copies[@]}"; do
  diff -q "$canonical" "$copy" >/dev/null
  echo "OK: $copy matches $canonical"
done
