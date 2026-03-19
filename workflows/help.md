<purpose>
Display GetShitRight usage guide, command reference, and current validation state.
</purpose>

<process>

## Step 1: Read Current State

Check if `.validation/STATE.md` exists in the current project root.
- If it exists, read and parse it for display
- If not, note "No validation in progress"

## Step 2: Display Help

Output the following to the user:

---

# GetShitRight — Validate Before You Build

**Version:** [read from VERSION file]

## Commands

| Command | What It Does |
|---------|-------------|
| `/val:idea` | Interview to capture & structure your idea |
| `/val:reverse` | Reverse engineer a competitor to find spin-off angles |
| `/val:skew` | Analyze value delivery to find 10x skew opportunities |
| `/val:research` | Parallel market research (pain, competitors, market size) |
| `/val:score` | Evidence-based viability scorecard (default-kill) |
| `/val:decide` | Final BUILD / PIVOT / KILL verdict |
| `/val:quick` | Full pipeline in one command |
| `/val:help` | This help screen |
| `/val:update` | Update to the latest version |
| `/val:reapply-patches` | Recover files backed up during updates |

## Recommended Flows

**"I have an idea"**
`/val:idea` → `/val:research` → `/val:score` → `/val:decide`

**"I have a competitor I want to beat"**
`/val:reverse` → `/val:research` → `/val:score` → `/val:decide`

**"Just do everything"**
`/val:quick`

**"I want to find leverage"** (Optional, use alongside any flow)
`/val:skew` or `/val:skew <competitor URL>`

## Better Research (Optional)

GetShitRight works out of the box with built-in web search. For deeper competitor
analysis and more reliable content extraction, install Firecrawl:

1. Get a free API key at https://firecrawl.dev (no credit card required)
2. Run: `claude mcp add firecrawl`

Works without it. Better with it.

## Current Progress

[If STATE.md exists: show step checklist with dates]
[If no STATE.md: "No validation in progress. Run `/val:idea` or `/val:reverse` to start."]

---

</process>
