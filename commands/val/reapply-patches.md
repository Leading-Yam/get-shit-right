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
