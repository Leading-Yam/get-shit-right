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
| `/gsr:idea` | Interview to capture & structure your idea |
| `/gsr:reverse` | Reverse engineer a competitor to find spin-off angles |
| `/gsr:skew` | Analyze value delivery to find 10x skew opportunities |
| `/gsr:research` | Parallel market research (pain, competitors, market size) |
| `/gsr:score` | Evidence-based viability scorecard (default-kill) |
| `/gsr:decide` | Final BUILD / PIVOT / KILL verdict |
| `/gsr:quick` | Full pipeline in one command |
| `/gsr:help` | This help screen |

## Recommended Flows

**"I have an idea"**
`/gsr:idea` → `/gsr:research` → `/gsr:score` → `/gsr:decide`

**"I have a competitor I want to beat"**
`/gsr:reverse` → `/gsr:research` → `/gsr:score` → `/gsr:decide`

**"Just do everything"**
`/gsr:quick`

**"I want to find leverage"** (Optional, use alongside any flow)
`/gsr:skew` or `/gsr:skew <competitor URL>`

## Better Research (Optional)

GetShitRight works out of the box with built-in web search. For deeper competitor
analysis and more reliable content extraction, install Firecrawl:

1. Get a free API key at https://firecrawl.dev (no credit card required)
2. Run: `claude mcp add firecrawl`

Works without it. Better with it.

## How It Works (v0.4.0)

GSR uses a three-layer architecture:

- **Agents** reason freely about your idea — they think, not follow scripts
- **Validators** check agent output for quality (evidence integrity, structure, coverage)
- **Memory** compounds learnings across runs — GSR gets better the more you use it

Hard validators (evidence integrity, output structure) retry automatically.
Soft validators (coverage, confidence calibration) surface flags for you to review.

## Current Progress

[If STATE.md exists: show step checklist with dates]
[If no STATE.md: "No validation in progress. Run `/gsr:idea` or `/gsr:reverse` to start."]

---

</process>
