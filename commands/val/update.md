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

Read `~/.claude/plugins/marketplaces/get-shit-right/VERSION` and display it:

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
