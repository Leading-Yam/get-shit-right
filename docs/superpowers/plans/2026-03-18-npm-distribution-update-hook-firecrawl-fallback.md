# npm Distribution, Update Hook & Firecrawl Fallback — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace GitHub plugin marketplace with npm distribution, add SessionStart/Statusline hooks for update notifications, and revert Firecrawl from hard mandate to optional with WebSearch/WebFetch fallback.

**Architecture:** npm package `get-shit-right-cc` with `bin/install.js` copies plugin files to `~/.claude/get-shit-right/` and registers JS hooks. Hooks run background version checks and display statusline indicators. Agent markdown files updated with try-and-fallback research tool strategy.

**Tech Stack:** Node.js (stdlib only, no deps), markdown command/workflow/agent definitions.

**Spec:** `docs/superpowers/specs/2026-03-18-npm-distribution-update-hook-design.md`

---

## Chunk 1: npm Package & Installer

### Task 1: Create package.json

**Files:**
- Create: `package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "get-shit-right-cc",
  "version": "0.3.1",
  "description": "GetShitRight — Evidence-backed BUILD/PIVOT/KILL decisions for SaaS ideas. Claude Code plugin.",
  "bin": {
    "get-shit-right-cc": "bin/install.js"
  },
  "files": [
    "bin/",
    "hooks/",
    "commands/",
    "agents/",
    "workflows/",
    "templates/",
    "CLAUDE.md",
    "VERSION",
    "CHANGELOG.md",
    "LICENSE"
  ],
  "engines": {
    "node": ">=16"
  },
  "keywords": ["claude-code", "saas", "validation", "plugin"],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/Leading-Yam/get-shit-right"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "feat: add package.json for npm distribution as get-shit-right-cc"
```

### Task 2: Create bin/install.js

**Files:**
- Create: `bin/install.js`

- [ ] **Step 1: Create the bin directory**

```bash
ls /Users/edentan/Desktop/GetShitRight/
mkdir -p /Users/edentan/Desktop/GetShitRight/bin
```

- [ ] **Step 2: Write bin/install.js**

```javascript
#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// --- Version gate ---
const major = parseInt(process.version.slice(1).split('.')[0], 10);
if (major < 16) {
  console.error(`Error: GetShitRight requires Node.js >= 16. You have ${process.version}.`);
  process.exit(1);
}

// --- Constants ---
const HOME = os.homedir();
const INSTALL_DIR = path.join(HOME, '.claude', 'get-shit-right');
const SETTINGS_PATH = path.join(HOME, '.claude', 'settings.json');
const MANIFEST_NAME = 'gsr-file-manifest.json';
const PATCHES_DIR = path.join(INSTALL_DIR, 'gsr-local-patches');

// Files/dirs to copy from the npm package into INSTALL_DIR
const COPY_ITEMS = [
  'commands',
  'agents',
  'workflows',
  'templates',
  'hooks',
  'CLAUDE.md',
  'VERSION',
  'CHANGELOG.md',
  'LICENSE',
];

// --- Helpers ---

function sha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function collectFiles(dir, base) {
  base = base || dir;
  let results = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(collectFiles(full, base));
    } else {
      results.push(path.relative(base, full));
    }
  }
  return results;
}

// --- Main ---

function main() {
  const packageRoot = path.resolve(__dirname, '..');
  console.log('GetShitRight installer');
  console.log('');

  // 1. Read current version
  const version = fs.readFileSync(path.join(packageRoot, 'VERSION'), 'utf8').trim();
  console.log(`Installing version ${version}...`);

  // 2. Load existing manifest (if any)
  const manifestPath = path.join(INSTALL_DIR, MANIFEST_NAME);
  let oldManifest = {};
  if (fs.existsSync(manifestPath)) {
    try {
      oldManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
      // Corrupted manifest — treat as fresh install
    }
  }

  // 3. Detect user modifications & backup
  const backedUp = [];
  if (Object.keys(oldManifest).length > 0) {
    for (const [relPath, expectedHash] of Object.entries(oldManifest)) {
      const installedPath = path.join(INSTALL_DIR, relPath);
      if (fs.existsSync(installedPath)) {
        const currentHash = sha256(installedPath);
        if (currentHash !== expectedHash) {
          // User modified this file — back it up
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const patchPath = path.join(PATCHES_DIR, `${timestamp}_${relPath.replace(/\//g, '_')}`);
          fs.mkdirSync(path.dirname(patchPath), { recursive: true });
          fs.copyFileSync(installedPath, patchPath);
          backedUp.push(relPath);
        }
      }
    }
  }

  // 4. Copy plugin files
  fs.mkdirSync(INSTALL_DIR, { recursive: true });
  for (const item of COPY_ITEMS) {
    const src = path.join(packageRoot, item);
    const dest = path.join(INSTALL_DIR, item);
    if (fs.existsSync(src)) {
      copyRecursive(src, dest);
    }
  }

  // 5. Generate new manifest
  const newManifest = {};
  for (const item of COPY_ITEMS) {
    const itemPath = path.join(INSTALL_DIR, item);
    if (!fs.existsSync(itemPath)) continue;
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      for (const relFile of collectFiles(itemPath, INSTALL_DIR)) {
        newManifest[relFile] = sha256(path.join(INSTALL_DIR, relFile));
      }
    } else {
      newManifest[item] = sha256(itemPath);
    }
  }
  fs.writeFileSync(manifestPath, JSON.stringify(newManifest, null, 2));

  // 6. Register hooks in settings.json
  registerHooks();

  // 7. Print summary
  console.log('');
  console.log(`GetShitRight v${version} installed to ${INSTALL_DIR}`);
  if (backedUp.length > 0) {
    console.log('');
    console.log(`Backed up ${backedUp.length} modified file(s) to ${PATCHES_DIR}:`);
    for (const f of backedUp) {
      console.log(`  - ${f}`);
    }
    console.log('Run /val:reapply-patches in Claude Code to restore your changes.');
  }
  console.log('');
  console.log('Restart Claude Code to apply changes.');
}

function registerHooks() {
  let settings = {};
  if (fs.existsSync(SETTINGS_PATH)) {
    try {
      settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    } catch {
      // Corrupted settings — start with empty object but warn
      console.warn('Warning: Could not parse ~/.claude/settings.json. Creating hooks section.');
    }
  }

  if (!settings.hooks) settings.hooks = {};

  const hookEntries = [
    {
      event: 'SessionStart',
      command: `node ${path.join(INSTALL_DIR, 'hooks', 'gsr-check-update.js')}`,
      match: 'gsr-check-update.js',
    },
    {
      event: 'Statusline',
      command: `node ${path.join(INSTALL_DIR, 'hooks', 'gsr-statusline.js')}`,
      match: 'gsr-statusline.js',
    },
  ];

  for (const hook of hookEntries) {
    if (!Array.isArray(settings.hooks[hook.event])) {
      settings.hooks[hook.event] = [];
    }
    // Deduplicate: only add if no existing entry contains the match string
    const exists = settings.hooks[hook.event].some(
      (entry) => entry.command && entry.command.includes(hook.match)
    );
    if (!exists) {
      settings.hooks[hook.event].push({ command: hook.command });
    }
  }

  fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

main();
```

- [ ] **Step 3: Make install.js executable**

```bash
chmod +x bin/install.js
```

- [ ] **Step 4: Test the installer locally**

```bash
node bin/install.js
```

Expected: Files copied to `~/.claude/get-shit-right/`, manifest generated, hooks registered in `~/.claude/settings.json`. Verify by checking:

```bash
ls ~/.claude/get-shit-right/
cat ~/.claude/get-shit-right/gsr-file-manifest.json | head -5
cat ~/.claude/settings.json | grep gsr
```

- [ ] **Step 5: Commit**

```bash
git add bin/install.js
git commit -m "feat: add npm installer with manifest, backup, and hook registration"
```

### Task 3: Create hooks/gsr-check-update.js

**Files:**
- Create: `hooks/gsr-check-update.js`

- [ ] **Step 1: Create the hooks directory**

```bash
mkdir -p /Users/edentan/Desktop/GetShitRight/hooks
```

- [ ] **Step 2: Write gsr-check-update.js**

```javascript
#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const HOME = os.homedir();
const CACHE_DIR = path.join(HOME, '.claude', 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'gsr-update-check.json');
const VERSION_FILE = path.join(HOME, '.claude', 'get-shit-right', 'VERSION');
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// Check cooldown — skip if checked recently
try {
  if (fs.existsSync(CACHE_FILE)) {
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    const elapsed = Date.now() - new Date(cache.checkedAt).getTime();
    if (elapsed < COOLDOWN_MS) {
      process.exit(0); // Already checked recently
    }
  }
} catch {
  // Cache unreadable — proceed with check
}

// Spawn detached background process to do the actual check
const child = spawn(process.execPath, ['-e', `
  const fs = require('fs');
  const { execSync } = require('child_process');
  const CACHE_DIR = ${JSON.stringify(CACHE_DIR)};
  const CACHE_FILE = ${JSON.stringify(CACHE_FILE)};
  const VERSION_FILE = ${JSON.stringify(VERSION_FILE)};

  try {
    // Get latest version from npm
    const latest = execSync('npm view get-shit-right-cc version', {
      timeout: 10000,
      encoding: 'utf8',
    }).trim();

    // Get installed version
    const installed = fs.readFileSync(VERSION_FILE, 'utf8').trim();

    // Compare versions (simple string comparison works for semver)
    const updateAvailable = latest !== installed &&
      latest.localeCompare(installed, undefined, { numeric: true }) > 0;

    // Write cache
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify({
      installed,
      latest,
      updateAvailable,
      checkedAt: new Date().toISOString(),
    }, null, 2));
  } catch {
    // Silent fail — don't block user session
  }
`], {
  detached: true,
  stdio: 'ignore',
});

child.unref();
```

- [ ] **Step 3: Make it executable**

```bash
chmod +x hooks/gsr-check-update.js
```

- [ ] **Step 4: Commit**

```bash
git add hooks/gsr-check-update.js
git commit -m "feat: add SessionStart hook for background update checking"
```

### Task 4: Create hooks/gsr-statusline.js

**Files:**
- Create: `hooks/gsr-statusline.js`

- [ ] **Step 1: Write gsr-statusline.js**

```javascript
#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const CACHE_FILE = path.join(os.homedir(), '.claude', 'cache', 'gsr-update-check.json');

try {
  const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  if (cache.updateAvailable) {
    process.stdout.write('\x1b[33m⬆ /val:update\x1b[0m │ ');
  }
} catch {
  // Silent fail — no output
}
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x hooks/gsr-statusline.js
```

- [ ] **Step 3: Commit**

```bash
git add hooks/gsr-statusline.js
git commit -m "feat: add Statusline hook for update notification indicator"
```

## Chunk 2: Command & Documentation Updates

### Task 5: Update /val:update command for npm

**Files:**
- Modify: `commands/val/update.md`

- [ ] **Step 1: Rewrite update.md**

Replace the entire content of `commands/val/update.md` with:

```markdown
---
name: val:update
description: Update GetShitRight to the latest version
allowed-tools:
  - Read
  - Bash
---

<objective>
Update the GetShitRight plugin to the latest version via npm.
</objective>

<process>

## Step 1: Show Current Version

Read `~/.claude/get-shit-right/VERSION` and display it:

```
Current version: [version from VERSION]
```

## Step 2: Run Update

Run:

```bash
npx get-shit-right-cc@latest
```

## Step 3: Clear Update Cache

Delete `~/.claude/cache/gsr-update-check.json` so the statusline indicator disappears.

## Step 4: Report Result

If the update succeeded, display:

```
Updated to latest version. Restart Claude Code to apply changes.
```

If it failed, show the error and suggest:

```
Update failed. You can try:
  1. npm cache clean --force
  2. npx get-shit-right-cc@latest
```

</process>
```

- [ ] **Step 2: Commit**

```bash
git add commands/val/update.md
git commit -m "feat(cmd): update /val:update to use npm instead of marketplace"
```

### Task 6: Create /val:reapply-patches command

**Files:**
- Create: `commands/val/reapply-patches.md`

- [ ] **Step 1: Write reapply-patches.md**

```markdown
---
name: val:reapply-patches
description: Recover files backed up during a GetShitRight update
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

<objective>
List and selectively restore files that were backed up during a GetShitRight update
because they had been modified by the user.
</objective>

<process>

## Step 1: Check for Patches

Check if `~/.claude/get-shit-right/gsr-local-patches/` exists and has files.

If empty or missing:
"No backed-up patches found. Your files haven't been modified during updates."

## Step 2: List Patches

List all files in the patches directory with numbered options:

```
Backed-up files from previous updates:

1. [timestamp] commands/val/research.md
2. [timestamp] agents/gsr-researcher.md
...

Enter numbers to restore (e.g., "1 3" or "all"), or "none" to cancel:
```

## Step 3: Show Diff

For each selected file, show the diff between the backed-up version and the current installed version.

## Step 4: Restore

For each confirmed file:
1. Copy the patch file back to its original location in `~/.claude/get-shit-right/`
2. Update the hash in `gsr-file-manifest.json` to match the restored file

## Step 5: Cleanup

Ask if the user wants to delete the restored patch files from the patches directory.

</process>
```

- [ ] **Step 2: Commit**

```bash
git add commands/val/reapply-patches.md
git commit -m "feat(cmd): add /val:reapply-patches for recovering backed-up modifications"
```

### Task 7: Update /val:help workflow

**Files:**
- Modify: `workflows/help.md`

- [ ] **Step 1: Add reapply-patches to command table and update Firecrawl section**

In `workflows/help.md`, add `/val:reapply-patches` to the command table after `/val:update`:

```
| `/val:reapply-patches` | Recover files backed up during updates |
```

- [ ] **Step 2: Remove Step 3 (curl version check)**

Delete the entire `## Step 3: Version Check` section (lines 66-83). The statusline hook now handles this.

- [ ] **Step 3: Update Firecrawl section**

Replace the "Better Research (Optional)" section with:

```markdown
## Better Research (Optional)

GetShitRight works out of the box with built-in web search. For deeper competitor
analysis and more reliable content extraction, install Firecrawl:

1. Get a free API key at https://firecrawl.dev (no credit card required)
2. Run: `claude mcp add firecrawl`

Works without it. Better with it.
```

- [ ] **Step 4: Commit**

```bash
git add workflows/help.md
git commit -m "feat(workflow): update help with reapply-patches, remove curl check, update Firecrawl text"
```

### Task 8: Update README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace install section**

Replace lines 39-54 (the entire Install section including the SSH troubleshooting callout and trailing "One command..." line) with:

```markdown
## Install

```bash
npx get-shit-right-cc
```

Then:

```
/val:quick
```

One command. Full validation pipeline. No excuses.
```

- [ ] **Step 2: Add /val:skew and /val:reapply-patches to command table**

Add `/val:skew` after `/val:reverse` (it was missing from the README table — added in v0.3.0 but only to help.md):

```
| `/val:skew` | Analyze value delivery to find 10x skew opportunities |
```

Add `/val:reapply-patches` after `/val:update`:

```
| `/val:reapply-patches` | Recover files backed up during updates |
```

- [ ] **Step 3: Update Firecrawl section**

Replace lines 115-123 (Better Research section) with:

```markdown
## Better Research (Optional)

GetShitRight works out of the box with built-in web search. For deeper competitor
analysis and more reliable content extraction, install Firecrawl:

1. Get a free API key at https://firecrawl.dev (no credit card required)
2. Run: `claude mcp add firecrawl`

Works without it. Better with it.
```

- [ ] **Step 4: Add Uninstall section**

Add before the License section:

```markdown
## Uninstall

1. Remove hook entries containing `gsr-` from `~/.claude/settings.json`
2. Delete `~/.claude/get-shit-right/`
3. Delete `~/.claude/cache/gsr-update-check.json`
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: update README for npm install, Firecrawl optional, add uninstall"
```

### Task 9: Update CLAUDE.md and version files

**Files:**
- Modify: `CLAUDE.md`
- Modify: `VERSION`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Remove "Update Check (Session Start)" from CLAUDE.md**

Delete lines 31-42 (the entire "Update Check (Session Start)" section including the closing line) from `CLAUDE.md`.

- [ ] **Step 2: Revert VERSION and sync package.json**

Write `0.3.0` to `VERSION`. Also update `package.json` version field to `"0.3.0"` to keep them in sync.

Note: Do NOT bump to 0.3.1 yet — that happens at release time when we're ready to publish.

- [ ] **Step 3: Replace CHANGELOG 0.3.1 entry**

Replace the existing `## [0.3.1]` entry in `CHANGELOG.md` with:

```markdown
## [Unreleased]

### Added
- npm distribution as `get-shit-right-cc` — install via `npx get-shit-right-cc`
- SessionStart hook for background update checking (24-hour cooldown)
- Statusline hook showing yellow `⬆ /val:update` when update available
- File manifest with SHA256 hashes for detecting user modifications during updates
- Local patch backup system (`gsr-local-patches/`) with `/val:reapply-patches` recovery command
- Uninstall instructions in README
- WebSearch/WebFetch fallback for all research agents when Firecrawl is unavailable

### Changed
- `/val:update` now uses `npx get-shit-right-cc@latest` instead of `claude plugin update`
- Firecrawl reverted from hard requirement to optional enhancement — all workflows work without it
- Research agents try Firecrawl first, fall back to WebSearch/WebFetch if unavailable
- Install instructions updated from marketplace to npm
- `/val:help` version check removed (replaced by statusline hook)

### Removed
- Firecrawl probe gates from research, reverse, and skew workflows
- `curl` version check from `/val:help` Step 3
- SSH-based marketplace installation requirement
- "Update Check (Session Start)" section from CLAUDE.md
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md VERSION CHANGELOG.md
git commit -m "chore: revert VERSION, update CHANGELOG, remove CLAUDE.md update check"
```

## Chunk 3: Firecrawl Optional Fallback

### Task 10: Update research workflow — remove hard gate

**Files:**
- Modify: `workflows/research.md`

- [ ] **Step 1: Replace Step 2 (Firecrawl Probe Gate) with soft detection**

Replace lines 19-36 of `workflows/research.md` (the entire Step 2 section) with:

```markdown
## Step 2: Detect Research Tools

Attempt a lightweight `mcp__firecrawl__scrape` call against `https://example.com`.

- If it succeeds: display "Firecrawl detected — enhanced research mode."
- If it fails (tool not found): display "Using built-in web search. Install Firecrawl for deeper research: https://firecrawl.dev"
- Continue either way — never abort.

Display: "Spawning 3 research agents..."
```

- [ ] **Step 2: Update the purpose line**

Replace line 4:
```
Handles Firecrawl nudge and merges results into RESEARCH.md and COMPETITORS.md.
```
With:
```
Detects research tools and merges results into RESEARCH.md and COMPETITORS.md.
```

- [ ] **Step 3: Commit**

```bash
git add workflows/research.md
git commit -m "feat(workflow): replace Firecrawl hard gate with soft detection in research"
```

### Task 11: Update reverse workflow — remove hard gate

**Files:**
- Modify: `workflows/reverse.md`

- [ ] **Step 1: Replace Step 1b (Firecrawl Probe Gate) with soft detection**

Replace lines 14-29 of `workflows/reverse.md` (the entire Step 1b section) with:

```markdown
## Step 1b: Detect Research Tools

Attempt a lightweight `mcp__firecrawl__scrape` call against `https://example.com`.

- If it succeeds: display "Firecrawl detected — enhanced research mode."
- If it fails (tool not found): display "Using built-in web search. Install Firecrawl for deeper research: https://firecrawl.dev"
- Continue either way — never abort.
```

- [ ] **Step 2: Commit**

```bash
git add workflows/reverse.md
git commit -m "feat(workflow): replace Firecrawl hard gate with soft detection in reverse"
```

### Task 12: Update skew workflow — remove hard gate

**Files:**
- Modify: `workflows/skew.md`

- [ ] **Step 1: Replace Step 3 (Firecrawl Probe Gate) with soft detection**

Replace lines 30-49 of `workflows/skew.md` (the entire Step 3 section) with:

```markdown
## Step 3: Detect Research Tools (URL modes only)

If mode is `url_only` or `both`:

Attempt a lightweight `mcp__firecrawl__scrape` call against `https://example.com`.

- If it succeeds: display "Firecrawl detected — enhanced research mode."
- If it fails (tool not found): display "Using built-in web search. Install Firecrawl for deeper research: https://firecrawl.dev"
- Continue either way — never abort.

For `idea_only` mode: skip this step entirely.
```

- [ ] **Step 2: Commit**

```bash
git add workflows/skew.md
git commit -m "feat(workflow): replace Firecrawl hard gate with soft detection in skew"
```

### Task 13: Update gsr-researcher agent — add fallback logic

**Files:**
- Modify: `agents/gsr-researcher.md`

- [ ] **Step 1: Update tools line**

Change line 4 from:
```
tools: Read, Write, mcp__firecrawl__*
```
To:
```
tools: Read, Write, WebSearch, WebFetch, mcp__firecrawl__*
```

- [ ] **Step 2: Replace Research Tool Strategy section**

Replace lines 37-44 (the "Research Tool Strategy" section and error handling) with:

```markdown
## Research Tool Strategy

Try Firecrawl tools first for all web research:
- Use `mcp__firecrawl__search` for discovery (finding relevant URLs)
- Use `mcp__firecrawl__scrape` for deep content extraction

If a Firecrawl tool call fails (tool not recognized, MCP connection error, or tool not in available tools list):
- Fall back to `WebSearch` for discovery
- Fall back to `WebFetch` for content extraction
- Do NOT retry Firecrawl after the first failure of this type — switch to fallback for the remainder of this agent's execution

If a Firecrawl call fails with a rate limit or server error:
- Wait 5 seconds and retry once
- If retry fails, fall back to WebSearch/WebFetch for that specific query
- Continue using Firecrawl for subsequent queries (transient errors don't disable Firecrawl)

If a search returns zero results, retry once with broader terms. If still zero, log as "0 results" with the query attempted.

Research quality note: Firecrawl produces cleaner, more reliable content extraction. WebFetch results for URL scraping may be less complete — note in output when feature extraction relied on WebFetch. Either way, all claims must cite sources — do not fabricate data regardless of which tool is used.

Search budget note: A failed Firecrawl attempt followed by a WebSearch/WebFetch fallback counts as ONE logical search against the agent's budget, not two.
```

- [ ] **Step 3: Update the Firecrawl-specific note at line 100**

Replace line 100:
```
**Note:** Some platforms (Indie Hackers, Twitter/X) may have limited Firecrawl indexing. These are best-effort — attempt them but do not penalize yourself for zero results as long as the attempt and query are documented.
```
With:
```
**Note:** Some platforms (Indie Hackers, Twitter/X) may have limited search indexing. These are best-effort — attempt them but do not penalize yourself for zero results as long as the attempt and query are documented.
```

- [ ] **Step 4: Commit**

```bash
git add agents/gsr-researcher.md
git commit -m "feat(agent): add WebSearch/WebFetch fallback to gsr-researcher"
```

### Task 14: Update gsr-competitor-analyst agent — add fallback logic

**Files:**
- Modify: `agents/gsr-competitor-analyst.md`

- [ ] **Step 1: Update tools line**

Change line 4 from:
```
tools: Read, Write, mcp__firecrawl__*
```
To:
```
tools: Read, Write, WebSearch, WebFetch, mcp__firecrawl__*
```

- [ ] **Step 2: Replace Standard Mode research approach (lines 32-37)**

Replace lines 32-37 with:

```markdown
**Research approach:**
Try Firecrawl tools first: use `mcp__firecrawl__search` for discovery, `mcp__firecrawl__scrape` for page content. If Firecrawl is unavailable (tool not recognized or connection error), fall back to `WebSearch` for discovery and `WebFetch` for content. Do NOT retry Firecrawl after a "tool not found" failure — switch for the remainder of this execution.
- Search G2, Capterra, Reddit, Twitter/X for review themes
- Look for "I wish [competitor] had..." and "[competitor] doesn't work for..." patterns
- Tag each finding with confidence: High / Medium / Low
- If a search fails or returns zero results, retry once with broader terms. Log failures in Research Coverage.
- WebFetch results for page scraping may be less complete — note in output when content extraction relied on WebFetch.
- A failed Firecrawl attempt + WebSearch fallback = ONE logical search against budget.
```

- [ ] **Step 3: Replace Deep Mode research approach (lines 80-84)**

Replace lines 80-84 with:

```markdown
**Research approach:**
Try Firecrawl tools first: use `mcp__firecrawl__search` for discovery, `mcp__firecrawl__scrape` for deep page content. If Firecrawl is unavailable, fall back to `WebSearch`/`WebFetch`. Do NOT retry Firecrawl after a "tool not found" failure. WebFetch results for URL scraping may be less complete — note in output when content extraction relied on WebFetch.
- Go deeper on reviews — look for patterns, not individual complaints
- Check subreddits, Twitter/X threads, blog posts comparing alternatives
- If a search fails or returns zero results, retry once. Log failures.
- A failed Firecrawl attempt + WebSearch fallback = ONE logical search against budget.
```

- [ ] **Step 4: Update scraping checklist tool references (lines 51-57)**

Replace the tool-specific references in the mandatory scraping checklist:

```markdown
1. Research the product using this mandatory scraping checklist:
   - Product website — homepage + pricing page (scrape with Firecrawl or WebFetch)
   - G2 reviews — "[competitor] reviews site:g2.com" (search)
   - Capterra reviews — "[competitor] reviews site:capterra.com" (search)
   - Reddit discussions — "[competitor] site:reddit.com" (search)
   - Crunchbase — "[competitor] crunchbase" for funding/employee data (search)
   - LinkedIn — "[competitor] LinkedIn" for employee count signal (search)
   - Twitter/X — "[competitor] complaints OR alternative OR switching" (search)
   Must attempt all 7 targets. Report which succeeded and which returned no results.
```

- [ ] **Step 5: Commit**

```bash
git add agents/gsr-competitor-analyst.md
git commit -m "feat(agent): add WebSearch/WebFetch fallback to gsr-competitor-analyst"
```

### Task 15: Update gsr-market-sizer agent — add fallback logic

**Files:**
- Modify: `agents/gsr-market-sizer.md`

- [ ] **Step 1: Update tools line**

Change line 4 from:
```
tools: Read, Write, mcp__firecrawl__*
```
To:
```
tools: Read, Write, WebSearch, WebFetch, mcp__firecrawl__*
```

- [ ] **Step 2: Replace Research Tool Strategy section (lines 34-41)**

Replace lines 34-41 with:

```markdown
## Research Tool Strategy

Try Firecrawl tools first for all web research:
- Use `mcp__firecrawl__search` for discovery (industry reports, job data, demographic data)
- Use `mcp__firecrawl__scrape` for extracting detailed data from specific pages

If a Firecrawl tool call fails (tool not recognized, MCP connection error, or tool not in available tools list):
- Fall back to `WebSearch` for discovery
- Fall back to `WebFetch` for content extraction
- Do NOT retry Firecrawl after the first failure of this type — switch to fallback for the remainder of this agent's execution

If a Firecrawl call fails with a rate limit or server error:
- Wait 5 seconds and retry once
- If retry fails, fall back to WebSearch/WebFetch for that specific query
- Continue using Firecrawl for subsequent queries (transient errors don't disable Firecrawl)

If a search returns zero results, retry once with broader terms. If still zero, log as "0 results" with the query attempted.

Research quality note: WebFetch results for page extraction may be less complete — note in output when data relied on WebFetch. Either way, all data points must cite sources — do not fabricate data regardless of which tool is used.

Search budget note: A failed Firecrawl attempt followed by a WebSearch/WebFetch fallback counts as ONE logical search against the agent's budget, not two.
```

- [ ] **Step 3: Commit**

```bash
git add agents/gsr-market-sizer.md
git commit -m "feat(agent): add WebSearch/WebFetch fallback to gsr-market-sizer"
```

### Task 16: Update gsr-value-skewer agent — add fallback logic

**Files:**
- Modify: `agents/gsr-value-skewer.md`

- [ ] **Step 1: Update tools line**

Change line 4 from:
```
tools: Read, Write, mcp__firecrawl__*
```
To:
```
tools: Read, Write, WebSearch, WebFetch, mcp__firecrawl__*
```

- [ ] **Step 2: Replace Firecrawl instructions and remove conflicting fallback (lines 65-68)**

Replace lines 65-68:

```
Use `mcp__firecrawl__search` to research market context, competitor approaches, and user complaints relevant to each axis. This grounds your analysis in evidence rather than speculation.

**If Firecrawl tools are unavailable** (possible in `idea_only` mode where there is no gate check):
Analyze the idea based solely on IDEA.md contents and your domain knowledge. Mark all claims as `[UNVERIFIED]`. Include the degraded research warning at the top of the output. The search budget minimum of 3 attempts is waived — proceed with 0 searches if tools are unavailable.
```

With:

```markdown
## Research Tool Strategy

Try Firecrawl tools first to research market context, competitor approaches, and user complaints relevant to each axis:
- Use `mcp__firecrawl__search` for discovery
- Use `mcp__firecrawl__scrape` for deep content extraction

If a Firecrawl tool call fails (tool not recognized, MCP connection error, or tool not in available tools list):
- Fall back to `WebSearch` for discovery
- Fall back to `WebFetch` for content extraction
- Do NOT retry Firecrawl after the first failure of this type — switch to fallback for the remainder of this agent's execution

If a Firecrawl call fails with a rate limit or server error:
- Wait 5 seconds and retry once
- If retry fails, fall back to WebSearch/WebFetch for that specific query
- Continue using Firecrawl for subsequent queries (transient errors don't disable Firecrawl)

Research quality note: Firecrawl produces cleaner content extraction. WebFetch results for URL scraping may be less complete — note in output when feature extraction relied on WebFetch. Either way, all claims must cite sources — do not fabricate data regardless of which tool is used.

Search budget note: A failed Firecrawl attempt followed by a WebSearch/WebFetch fallback counts as ONE logical search against the agent's budget, not two.

This grounds your analysis in evidence rather than speculation.
```

- [ ] **Step 3: Update Step 1 scrape reference (line 29)**

Replace:
```
1. Scrape the competitor URL with `mcp__firecrawl__scrape`
```
With:
```
1. Scrape the competitor URL (use `mcp__firecrawl__scrape` if available, otherwise `WebFetch`)
```

- [ ] **Step 4: Commit**

```bash
git add agents/gsr-value-skewer.md
git commit -m "feat(agent): add WebSearch/WebFetch fallback to gsr-value-skewer"
```

### Task 17: Update command allowed-tools

**Files:**
- Modify: `commands/val/research.md`
- Modify: `commands/val/reverse.md`
- Modify: `commands/val/skew.md`

- [ ] **Step 1: Add WebSearch and WebFetch to research.md**

Add `WebSearch` and `WebFetch` to the `allowed-tools` list in `commands/val/research.md` (after `Agent`, before `mcp__firecrawl__*`):

```yaml
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Agent
  - WebSearch
  - WebFetch
  - mcp__firecrawl__*
```

- [ ] **Step 2: Add WebSearch and WebFetch to reverse.md**

Same change to `commands/val/reverse.md`:

```yaml
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - AskUserQuestion
  - Agent
  - WebSearch
  - WebFetch
  - mcp__firecrawl__*
```

- [ ] **Step 3: Add WebSearch and WebFetch to skew.md**

Same change to `commands/val/skew.md`:

```yaml
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - AskUserQuestion
  - Agent
  - WebSearch
  - WebFetch
  - mcp__firecrawl__*
```

- [ ] **Step 4: Commit**

```bash
git add commands/val/research.md commands/val/reverse.md commands/val/skew.md
git commit -m "feat(cmd): add WebSearch/WebFetch to research, reverse, skew allowed-tools"
```

### Task 18: Final verification

- [ ] **Step 1: Verify no remaining Firecrawl-only references in active files**

Search for any remaining Firecrawl-only references in active files:

```bash
grep -rn "No other web tools\|Firecrawl is the only\|Firecrawl plugin required\|only research tool" agents/ workflows/ commands/
```

Also check for orphaned Firecrawl tool references that lack fallback context:

```bash
grep -rn "mcp__firecrawl" agents/ | grep -v "WebSearch\|WebFetch\|fall.back\|if.*unavailable\|Research Tool Strategy\|tools:"
```

Expected: No matches from either search. If any found, update them to reflect the fallback pattern.

- [ ] **Step 2: Verify all agents have WebSearch/WebFetch in tools**

```bash
grep "^tools:" agents/gsr-researcher.md agents/gsr-competitor-analyst.md agents/gsr-market-sizer.md agents/gsr-value-skewer.md
```

Expected: All 4 lines include `WebSearch, WebFetch, mcp__firecrawl__*`

- [ ] **Step 3: Verify all research commands have WebSearch/WebFetch in allowed-tools**

```bash
grep -A 20 "allowed-tools:" commands/val/research.md commands/val/reverse.md commands/val/skew.md commands/val/quick.md | grep -E "WebSearch|WebFetch"
```

Expected: Both `WebSearch` and `WebFetch` appear in all 4 command files. Note: `quick.md` already has them.

- [ ] **Step 4: Commit any remaining fixes**

If Step 1 found matches, fix them and commit with explicit file paths:

```bash
git add [specific files that were fixed]
git commit -m "fix: remove remaining Firecrawl-only references"
```
