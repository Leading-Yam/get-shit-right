# Design: npm Distribution, Update Hook & Firecrawl Optional Fallback

**Date:** 2026-03-18
**Status:** Approved
**Goal:** Replace GitHub plugin marketplace distribution with npm, add seamless update notifications via SessionStart hook and statusline (mirroring GSD), and make Firecrawl optional with graceful WebSearch/WebFetch fallback.

---

## Context

GetShitRight currently distributes via `claude plugin marketplace add`, which clones via SSH. Users without SSH keys configured for GitHub hit `Permission denied (publickey)`. GSD solves this by publishing to npm (HTTPS-based, zero SSH config needed) and uses JS hooks for non-intrusive update notifications.

Additionally, v0.2 mandated Firecrawl MCP as a hard requirement for all research workflows. Testing revealed this requires users to sign up for a Firecrawl API key — even the marketplace plugin version requires registration. This friction blocks new users from running research immediately. Reverting to optional Firecrawl with WebSearch/WebFetch fallback removes this barrier while preserving enhanced research quality for users who have Firecrawl installed.

## Decision

Replicate GSD's architecture exactly:
- npm package `get-shit-right-cc` with `bin/install.js`
- SessionStart hook for background version checks
- Statusline hook for persistent update indicator
- File manifest with SHA256 hashes for modification detection
- Local patch backup system with recovery command
- Firecrawl reverted to optional enhancement with WebSearch/WebFetch fallback

## Prerequisites

- Node.js >= 16 required (for `fs.promises`, `crypto.createHash`, detached child processes)
- `bin/install.js` checks `process.version` at startup and prints a clear error if below minimum

## New Files

```
get-shit-right/
├── package.json                      # npm package, bin entry
├── bin/
│   └── install.js                    # Installer script
├── hooks/
│   ├── gsr-check-update.js           # SessionStart — background version check
│   └── gsr-statusline.js             # Statusline — update indicator
├── commands/val/
│   └── reapply-patches.md            # NEW command
```

## Section 1: npm Package & Installer

### package.json

- Name: `get-shit-right-cc`
- Bin: `{ "get-shit-right-cc": "bin/install.js" }`
- Zero dependencies — pure Node.js stdlib
- Version synced from VERSION file at publish time

### bin/install.js

Responsibilities in order:

1. **Install to** `~/.claude/get-shit-right/` (global scope only — project-local installs deferred)
2. **Check existing install** — load existing file manifest if present
3. **Detect user modifications** — compare SHA256 hashes against manifest
4. **Backup modified files** — copy to `~/.claude/get-shit-right/gsr-local-patches/` with timestamps
5. **Copy plugin files** — commands, agents, workflows, templates, CLAUDE.md, VERSION
6. **Generate manifest** — `gsr-file-manifest.json` with SHA256 hash per installed file
7. **Register hooks** — merge into `~/.claude/settings.json` using the following algorithm:
   - Read existing `settings.json` (or `{}` if absent)
   - Initialize `hooks.SessionStart` and `hooks.Statusline` as empty arrays if absent
   - Append GSR entries **only if** no existing entry's `command` string contains `gsr-check-update.js` or `gsr-statusline.js` (deduplication)
   - Write back the full merged object — never overwrite other plugins' hook entries
   - Target entries:
   ```json
   { "command": "node ~/.claude/get-shit-right/hooks/gsr-check-update.js" }
   { "command": "node ~/.claude/get-shit-right/hooks/gsr-statusline.js" }
   ```
8. **Print summary** — version, backed-up files (if any), restart reminder

## Section 2: SessionStart Hook

### hooks/gsr-check-update.js

1. Reads `~/.claude/cache/gsr-update-check.json` — if `checkedAt` is less than 24 hours old, exits immediately (cooldown)
2. Spawns a **detached background child process** (fire-and-forget)
3. Child runs `npm view get-shit-right-cc version` with 10-second timeout
4. Reads local version from `~/.claude/get-shit-right/VERSION`
4. Writes to `~/.claude/cache/gsr-update-check.json`:
   ```json
   {
     "installed": "0.3.1",
     "latest": "0.4.0",
     "updateAvailable": true,
     "checkedAt": "2026-03-18T12:00:00Z"
   }
   ```
6. `stdio: 'ignore'`, `detached: true` — never blocks the session
7. Creates `~/.claude/cache/` if it doesn't exist

## Section 3: Statusline Hook

### hooks/gsr-statusline.js

1. Reads `~/.claude/cache/gsr-update-check.json`
2. If `updateAvailable === true`: outputs `\x1b[33m⬆ /val:update\x1b[0m │ `
3. If file missing, unreadable, or no update: outputs nothing
4. Silent fail on any error

## Section 4: Command Changes

### /val:update (modified)

1. Read local VERSION and display
2. Run `npx get-shit-right-cc@latest` (replaces `claude plugin update`)
3. Clear `~/.claude/cache/gsr-update-check.json` so statusline indicator disappears
4. Report result + restart reminder
5. Fallback on failure: show error and suggest user run `npm cache clean --force` manually, then retry. Do not automate destructive npm operations.

### /val:reapply-patches (new)

1. Check if `~/.claude/get-shit-right/gsr-local-patches/` exists
2. List backed-up files with numbered options and timestamps
3. Show diff between each patch and current installed version
4. User types numbers to select (e.g., "1 3" or "all")
5. Copy selected patches back, regenerate manifest hashes for those files
6. For conflicts (same file changed in both patch and new version), show diff and let user decide per-file

### /val:help (modified)

- Add `/val:reapply-patches` to command table
- Remove inline `curl` version check from Step 3 (now handled by statusline hook)

## Section 5: Firecrawl Optional Fallback

Reverts the v0.2 Firecrawl mandate. Firecrawl becomes an optional enhancement — GSR works out of the box with WebSearch/WebFetch, and produces better results when Firecrawl is available.

### 5.1 Remove Hard Gates

Delete the Firecrawl probe gate from these workflows:
- `workflows/research.md` — remove Step 2 (Firecrawl Probe Gate)
- `workflows/reverse.md` — remove Step 1b (Firecrawl Probe Gate)
- `workflows/skew.md` — remove Step 3 (Firecrawl Probe Gate for URL modes)

Replace each gate with a soft detection step:

```
## Step N: Detect Research Tools

Attempt a lightweight `mcp__firecrawl__scrape` call against `https://example.com`.

- If it succeeds: set `firecrawl_available = true`, display "Firecrawl detected — enhanced research mode."
- If it fails (tool not found): set `firecrawl_available = false`, display "Using built-in web search. Install Firecrawl for deeper research: https://firecrawl.dev"
- Continue either way — never abort.
```

### 5.2 Agent Fallback Logic

Update all 4 research agents to use try-and-fallback:

**Files:** `agents/gsr-researcher.md`, `agents/gsr-competitor-analyst.md`, `agents/gsr-market-sizer.md`, `agents/gsr-value-skewer.md`

**Tools line change:**
```
# Before
tools: Read, Write, mcp__firecrawl__*

# After
tools: Read, Write, WebSearch, WebFetch, mcp__firecrawl__*
```

**Agent search instructions change:**

Replace Firecrawl-only instructions with fallback logic:

```
## Research Tool Strategy

Try Firecrawl tools first for all web research:
- Use `mcp__firecrawl__search` for discovery (finding relevant URLs)
- Use `mcp__firecrawl__scrape` for deep content extraction

If a Firecrawl tool call fails with "tool not found":
- Fall back to `WebSearch` for discovery
- Fall back to `WebFetch` for content extraction
- Do NOT retry Firecrawl after the first "tool not found" — switch to fallback for the remainder of the session

If a Firecrawl call fails with a rate limit or server error:
- Wait 5 seconds and retry once
- If retry fails, fall back to WebSearch/WebFetch for that specific query
- Continue using Firecrawl for subsequent queries (transient errors don't disable Firecrawl)

Research quality note: Firecrawl produces cleaner, more reliable content extraction. WebSearch/WebFetch results may be less structured. Either way, all claims must cite sources — do not fabricate data regardless of which tool is used.
```

### 5.3 Command allowed-tools Updates

Add WebSearch and WebFetch back to commands that do research:

- `commands/val/research.md` — add `WebSearch`, `WebFetch` alongside `mcp__firecrawl__*`
- `commands/val/reverse.md` — add `WebSearch`, `WebFetch` alongside `mcp__firecrawl__*`
- `commands/val/skew.md` — add `WebSearch`, `WebFetch` alongside `mcp__firecrawl__*`
- `commands/val/quick.md` — add `WebSearch`, `WebFetch` alongside `mcp__firecrawl__*`

### 5.4 README & Help Updates

**README.md** — change the Firecrawl section from "Better Research (Optional)" to match the original v0.1 tone:

```markdown
## Better Research (Optional)

GetShitRight works out of the box with built-in web search. For deeper competitor
analysis and more reliable content extraction, install Firecrawl:

1. Get a free API key at https://firecrawl.dev (no credit card required)
2. Run: `claude mcp add firecrawl`

Works without it. Better with it.
```

**workflows/help.md** — update the Firecrawl section with same messaging.

## Section 6: Removals / Reverts

1. **CLAUDE.md** — remove "Update Check (Session Start)" section
2. **workflows/help.md** — remove Step 3 curl version check
3. **README.md** — replace marketplace install with `npx get-shit-right-cc`, remove SSH troubleshooting callout
4. **VERSION** — revert to `0.3.0` (0.3.1 was never published to marketplace; npm/hook work becomes the real 0.3.1)
5. **CHANGELOG** — replace the 0.3.1 entry with the npm distribution + hook + Firecrawl fallback changes
6. **Firecrawl probe gates** — removed from research, reverse, and skew workflows (replaced by soft detection in Section 5.1)
7. **Firecrawl-only agent instructions** — replaced with try-and-fallback (Section 5.2)

## Uninstall

Manual uninstall steps (documented in README):

1. Remove hook entries containing `gsr-` from `~/.claude/settings.json`
2. Delete `~/.claude/get-shit-right/`
3. Delete `~/.claude/cache/gsr-update-check.json`

Future: consider a `/val:uninstall` command that automates these steps.

## Release Process

1. Update VERSION file
2. Run a sync script that copies VERSION into `package.json` version field
3. `npm publish` with `--provenance` (links package to source commit)
4. npm 2FA enabled on the publishing account
5. Future: GitHub Actions workflow triggered on tag push (`v*`) to automate publish

## Install UX

**New user:**
```bash
npx get-shit-right-cc
```
Then in Claude Code: `/val:quick`

**Existing user updating:**
```
/val:update
```
Or manually: `npx get-shit-right-cc@latest`

## Update Notification UX

User starts a Claude Code session → statusline shows:
```
⬆ /val:update │ opus-4-6 ...
```
Yellow, non-intrusive, always visible. Disappears after running `/val:update`.
