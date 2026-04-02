---
title: "Skill Autocomplete Not Discovering Skills — SKILL.md Name Prefix Missing"
category: integration-issues
date: 2026-04-02
tags:
  - plugin-registration
  - skill-discovery
  - autocomplete
  - SKILL.md-frontmatter
  - claude-code-plugin-system
severity: high
time_to_resolve: "5 minutes (one-line fix per skill file)"
components_affected:
  - skills/*/SKILL.md
  - Claude Code autocomplete matching
---

# Skill Autocomplete Not Discovering Skills — SKILL.md Name Prefix Missing

## Problem

Typing `/gsr:` in Claude Code showed no autocomplete suggestions. All 8 GSR skills were invisible to the autocomplete system despite being properly installed as a plugin.

**Error behavior**: Silent failure — no error messages, just empty autocomplete results.

## Investigation Steps

### What didn't work: Reverse-engineering cli.js

The initial approach was reading the minified Claude Code `cli.js` to understand how skill names were resolved. This consumed significant time because:
- Minification obscures variable names
- The bug was in *data* (SKILL.md metadata), not *logic* (CLI code)
- Indirect tracing through 50k+ lines of minified code is slow

### What worked: `claude --debug-file`

Running `claude --debug-file /tmp/debug.log` immediately revealed the mismatch:

```
Skill prompt: showing "gsr:idea" (userFacingName="idea")
```

The `userFacingName` was `"idea"` but autocomplete was searching for names starting with `"gsr:"`. One debug run surfaced the root cause in seconds.

## Root Cause

Claude Code's autocomplete system indexes skills by the `userFacingName` field, which comes directly from the SKILL.md frontmatter `name` field.

**The mismatch:**
- User types `/gsr:` — autocomplete searches for skills with `name` starting with `gsr:`
- SKILL.md files had bare names: `name: idea`, `name: research`, etc.
- No match found — autocomplete returns empty

The compound-engineering plugin established the convention: `name: ce:brainstorm`, `name: ce:plan`, etc. GSR's SKILL.md files weren't following it.

## Solution

Prefix every SKILL.md `name` field with `gsr:`.

**Before:**
```yaml
---
name: idea
description: Interview to capture & structure your SaaS idea
---
```

**After:**
```yaml
---
name: gsr:idea
description: Interview to capture & structure your SaaS idea
---
```

**All 8 skills updated:**

| Skill | Before | After |
|-------|--------|-------|
| idea | `name: idea` | `name: gsr:idea` |
| research | `name: research` | `name: gsr:research` |
| score | `name: score` | `name: gsr:score` |
| decide | `name: decide` | `name: gsr:decide` |
| quick | `name: quick` | `name: gsr:quick` |
| reverse | `name: reverse` | `name: gsr:reverse` |
| skew | `name: skew` | `name: gsr:skew` |
| help | `name: help` | `name: gsr:help` |

**Commit:** `bd116b8` — `fix(skills): prefix SKILL.md name fields with gsr: for autocomplete discovery`

## Verification

After the fix, debug output confirmed alignment:
```
Skill prompt: showing "gsr:idea" (userFacingName="gsr:idea")
```

Typing `/gsr:` now displays all 8 skills in autocomplete. Selecting a skill correctly invokes the workflow.

## Prevention

### 1. Debug-first discipline

For any plugin/skill registration issue, **always start with debug output**:

```bash
claude --debug-file /tmp/debug.log
# Then search for "skill", "register", "userFacingName"
```

**Decision tree:**
- Debug shows skill registered with wrong metadata → fix SKILL.md frontmatter
- Debug shows skill not registered at all → check plugin path, install.js, settings.json
- Debug shows skill registered correctly → issue is in CLI logic (then read source)

### 2. Naming convention enforcement

Every SKILL.md `name` field must follow `gsr:<skillname>` where `<skillname>` matches the directory name:

```
skills/idea/SKILL.md       → name: gsr:idea
skills/research/SKILL.md   → name: gsr:research
```

A pre-commit hook or CI check can validate this:

```bash
for skillfile in skills/*/SKILL.md; do
  dirname=$(basename "$(dirname "$skillfile")")
  name=$(grep "^name:" "$skillfile" | head -1 | awk '{print $2}')
  expected="gsr:$dirname"
  if [ "$name" != "$expected" ]; then
    echo "ERROR: $skillfile has name '$name', expected '$expected'"
    exit 1
  fi
done
```

### 3. New skill checklist

- [ ] `name: gsr:<skillname>` in SKILL.md frontmatter
- [ ] Directory name matches skillname portion
- [ ] `description` and `allowed-tools` present
- [ ] Verify with `claude --debug-file` that `userFacingName` shows correctly

## Cross-References

- **Commit history**: `bd116b8` (fix), `a32a45b` (plugin migration merge), `9403641` (`/val:` to `/gsr:` migration)
- **Convention precedent**: compound-engineering plugin uses `name: ce:*` pattern
- **Known doc skew**: CLAUDE.md line 14 says "Skill names omit prefix" — this is outdated; the prefix IS required in frontmatter for autocomplete
- **Memory**: `feedback_skill_autocomplete_naming.md` captures this as a persistent learning
