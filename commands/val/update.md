---
name: val:update
description: Update GetShitRight to the latest version
allowed-tools:
  - Read
  - Bash
---

<objective>
Update the GetShitRight plugin to the latest version from the marketplace.
</objective>

<process>

## Step 1: Show Current Version

Read the VERSION file and display it:

```
Current version: [version from VERSION]
```

## Step 2: Run Update

Run:

```bash
claude plugin update get-shit-right
```

## Step 3: Report Result

If the update succeeded, display:

```
Updated to latest version. Restart Claude Code to apply changes.
```

If it was already up to date, display:

```
Already on the latest version.
```

If it failed, show the error and suggest:

```
Manual update:
  claude plugin uninstall get-shit-right
  claude plugin install get-shit-right@get-shit-right
```

</process>
