# GetShitRight Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude Code plugin that validates SaaS ideas with evidence-backed BUILD/PIVOT/KILL decisions using a default-kill philosophy.

**Architecture:** Claude Code plugin following GSD's patterns — commands in `~/.claude/commands/val/`, agents in `~/.claude/agents/`, runtime support in `~/.claude/get-shit-right/`. Commands delegate to workflow files which orchestrate specialized agents. State is tracked in `.validation/` directory within the user's project.

**Tech Stack:** Markdown-based Claude Code plugin (commands, agents, workflows). No runtime dependencies beyond Claude Code.

**Spec:** `docs/superpowers/specs/2026-03-15-getshitright-design.md`

---

## Chunk 1: Foundation — Project Structure, State Management & Help

### File Structure

| File | Responsibility |
|------|---------------|
| `commands/val/help.md` | `/val:help` command — shows usage guide and current state |
| `workflows/help.md` | Help workflow — reads STATE.md, formats output |
| `workflows/state.md` | State management workflow — init, read, update STATE.md |
| `templates/STATE.md` | STATE.md template for `.validation/` directory |
| `CLAUDE.md` | Project rules for Claude Code |
| `README.md` | Installation and usage docs |
| `LICENSE` | MIT license |
| `VERSION` | Version number (0.1.0) |

---

### Task 1: Project Skeleton

**Files:**
- Create: `VERSION`
- Create: `LICENSE`
- Create: `CLAUDE.md`

- [ ] **Step 1: Create VERSION file**

```
0.1.0
```

Write to: `VERSION`

- [ ] **Step 2: Create LICENSE file**

Write MIT license to `LICENSE` with:
- Year: 2026
- Copyright holder: GetShitRight Contributors

- [ ] **Step 3: Create CLAUDE.md**

```markdown
# GetShitRight — Project Rules

## What This Is
GetShitRight (GSR) is a Claude Code plugin that validates SaaS ideas before code is written.
It produces evidence-backed BUILD/PIVOT/KILL decisions with a default-kill philosophy.

## Architecture
- `commands/val/` — Slash command definitions (`/val:*`)
- `agents/` — Specialized agent definitions (`gsr-*`)
- `workflows/` — Implementation logic delegated from commands
- `templates/` — Canonical output format references for contributors

## Conventions
- Commands use YAML frontmatter with `name`, `description`, `allowed-tools`
- Commands delegate to workflow files via `<execution_context>` references
- Agents use XML-like sections: `<role>`, `<behavior>`, `<output_format>`
- All agent output must cite sources or explicitly mark assumptions
- Confidence levels: High / Medium / Low on every finding
- No enterprise language — direct, concise, founder-friendly tone

## State
- User state lives in `.validation/` in the user's project root
- `STATE.md` tracks workflow progress
- One idea per `.validation/` directory

## Scoring
- Default-kill: BUILD requires 25+/35
- 1/5 on Pain Intensity or Willingness to Pay = automatic KILL
- Every score must cite specific evidence
```

- [ ] **Step 4: Commit**

```bash
git add VERSION LICENSE CLAUDE.md
git commit -m "feat: project skeleton with VERSION, LICENSE, CLAUDE.md"
```

- [ ] **Step 5: Verify**

Run:
```bash
cat VERSION && echo "---" && head -1 CLAUDE.md && echo "---" && head -1 LICENSE
```
Expected: Version number, CLAUDE.md header, LICENSE header all present.

---

### Task 2: STATE.md Template & State Management Workflow

**Files:**
- Create: `templates/STATE.md`
- Create: `workflows/state.md`

- [ ] **Step 1: Create STATE.md template**

Write to `templates/STATE.md`:

```markdown
# Validation State

## Current Status: NOT_STARTED

## Steps
<!-- Format when completed: - [x] idea — YYYY-MM-DD -->
- [ ] idea
- [ ] reverse
- [ ] research
- [ ] score
- [ ] decide

## Entry Point: pending

## Config
- firecrawl_nudge_shown: false
```

- [ ] **Step 2: Create state management workflow**

Write to `workflows/state.md`:

```markdown
<purpose>
Manage `.validation/STATE.md` — initialize, read current state, and update step completion.
Called by all commands to track workflow progress.
</purpose>

<process>

## Initializing State

When any `/val:*` command runs and `.validation/STATE.md` does not exist:

1. Create `.validation/` directory if it doesn't exist
2. Copy the STATE.md template to `.validation/STATE.md`
3. Return the initialized state

## Reading State

Read `.validation/STATE.md` and parse:
- `Current Status` — NOT_STARTED / IN_PROGRESS / COMPLETE
- `Steps` — which steps are checked (completed) with dates
- `Entry Point` — idea / reverse / pending
- `Config` — key-value pairs (firecrawl_nudge_shown, etc.)

## Updating State

When a command completes successfully:

1. Read current `.validation/STATE.md`
2. Check the completed step's checkbox and add today's date: `- [x] idea — YYYY-MM-DD`
3. Update `Current Status`:
   - If any step is checked but not all → `IN_PROGRESS`
   - If all required steps are checked → `COMPLETE`
4. Update `Entry Point` on first step completion (idea or reverse)
5. Write updated STATE.md back to disk

## Checking Prerequisites

When a command needs a prerequisite artifact:

1. Read STATE.md to check if prerequisite step is completed
2. If prerequisite is not completed:
   - For hard requirements (e.g., research needs IDEA.md): fail with message
   - For soft requirements (e.g., score without research): warn but proceed
3. Also check if the artifact file actually exists in `.validation/` (founder might have created it manually)

## Overwrite Protection

When a command would overwrite an existing `.validation/` artifact:

1. Check if the artifact file exists
2. If it exists, warn: "This will overwrite your existing [artifact]. Continue? (y/n)"
3. Wait for confirmation before proceeding

## Multi-Idea Guard

When any `/val:*` command starts and `.validation/STATE.md` shows `Current Status: COMPLETE`:

1. Warn: "A completed validation exists. Delete `.validation/` to start fresh, or use git to branch."
2. Wait for confirmation before proceeding

</process>
```

- [ ] **Step 3: Commit**

```bash
git add templates/STATE.md workflows/state.md
git commit -m "feat: STATE.md template and state management workflow"
```

- [ ] **Step 4: Verify**

Run:
```bash
ls templates/STATE.md workflows/state.md
```
Expected: Both files exist.

---

### Task 3: `/val:help` Command

**Files:**
- Create: `commands/val/help.md`
- Create: `workflows/help.md`

- [ ] **Step 1: Create help workflow**

Write to `workflows/help.md`:

```markdown
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
| `/val:research` | Parallel market research (pain, competitors, market size) |
| `/val:score` | Evidence-based viability scorecard (default-kill) |
| `/val:decide` | Final BUILD / PIVOT / KILL verdict |
| `/val:quick` | Full pipeline in one command |
| `/val:help` | This help screen |

## Recommended Flows

**"I have an idea"**
`/val:idea` → `/val:research` → `/val:score` → `/val:decide`

**"I have a competitor I want to beat"**
`/val:reverse` → `/val:research` → `/val:score` → `/val:decide`

**"Just do everything"**
`/val:quick`

## Better Research (Optional)

Install Firecrawl MCP for deeper competitor and Reddit research:
```
claude mcp add firecrawl
```
GetShitRight works without it, but research quality improves with it.

## Current Progress

[If STATE.md exists: show step checklist with dates]
[If no STATE.md: "No validation in progress. Run `/val:idea` or `/val:reverse` to start."]

---

</process>
```

- [ ] **Step 2: Create help command**

Write to `commands/val/help.md`:

```markdown
---
name: val:help
description: Show available commands, recommended flows, and current validation state
allowed-tools:
  - Read
  - Glob
---

<objective>
Display the GetShitRight usage guide with command reference, recommended flows,
and current `.validation/` progress.
</objective>

<execution_context>
@workflows/help.md
@workflows/state.md
</execution_context>

<process>
Follow the help workflow from @workflows/help.md.
Read VERSION file for version number.
Read .validation/STATE.md if it exists for current progress.
</process>
```

- [ ] **Step 3: Commit**

```bash
git add commands/val/help.md workflows/help.md
git commit -m "feat: /val:help command with usage guide and state display"
```

- [ ] **Step 4: Verify**

Run:
```bash
grep "^name:" commands/val/help.md
```
Expected: `name: val:help`

---

### Task 4: README.md

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README**

Write to `README.md`:

```markdown
# GetShitRight

**Validate before you build.** Evidence-backed BUILD/PIVOT/KILL decisions for SaaS ideas.

GetShitRight is a free, open-source Claude Code plugin that protects non-technical solo founders from building the wrong thing. It researches your market, scores your idea, and tells you honestly whether to build, pivot, or kill it.

## Install

```bash
claude install get-shit-right
```

Or manually:

```bash
git clone https://github.com/TODO-owner/get-shit-right.git
claude plugin add /path/to/get-shit-right
```

## Quick Start

```
/val:quick
```

That's it. One command, full validation pipeline. It will interview you about your idea, research the market, score viability, and deliver a BUILD/PIVOT/KILL verdict.

## Commands

| Command | What It Does |
|---------|-------------|
| `/val:idea` | Interview to capture & structure your idea |
| `/val:reverse` | Reverse engineer a competitor to find spin-off angles |
| `/val:research` | Parallel market research (pain, competitors, market size) |
| `/val:score` | Evidence-based viability scorecard |
| `/val:decide` | Final BUILD / PIVOT / KILL verdict |
| `/val:quick` | Full pipeline in one command |
| `/val:help` | Usage guide & current progress |

## How It Works

### Start with an idea...

```
/val:idea
```

GetShitRight interviews you (6 questions max) to capture your idea, target customer, and riskiest assumptions. Don't know the answer? Say "Surprise me" and it'll make a smart assumption.

### ...or start with a competitor

```
/val:reverse "Calendly"
```

Deep-dive a competitor's weaknesses and find underserved angles. Pick a spin-off direction and validate it.

### Research the market

```
/val:research
```

Three parallel agents research your idea:
- **Pain validation** — Reddit, HN, Indie Hackers, Twitter/X
- **Competitive landscape** — pricing, features, negative reviews
- **Market sizing** — TAM/SAM/SOM with methodology

### Get scored (honestly)

```
/val:score
```

7 dimensions, each 1-5. Default-kill philosophy: you need 25+/35 to get a BUILD verdict. A single 1/5 on Pain Intensity or Willingness to Pay is an automatic KILL.

### Get the verdict

```
/val:decide
```

BUILD, PIVOT, or KILL — with specific next steps for each. KILL verdicts always include alternative angles worth exploring.

## Better Research (Optional)

Install Firecrawl MCP for deeper competitor and Reddit research:

```bash
claude mcp add firecrawl
```

Works without it. Better with it.

## GSD Integration

If you use [GetShitDone (GSD)](https://github.com/TODO-gsd-repo), a BUILD verdict generates `CONSTRAINTS.md` that GSD can read directly:

```
/val:decide  →  .validation/CONSTRAINTS.md  →  /gsd:new-project
```

No manual copy-paste. GSD reads your validated constraints and skips redundant questions.

## Philosophy

- **Default-kill** — BUILD is hard to earn. Most ideas should get KILL or PIVOT.
- **Evidence over opinion** — every score cites sources. No hand-wavy "this looks promising."
- **Surprise me** — lazy founders get smart defaults, not blockers.
- **Always an alternative** — KILL verdicts include spin-off angles. You're redirected, not stopped.

## License

MIT
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README with installation, usage, and philosophy"
```

---

## Chunk 2: Interview Pipeline — `/val:idea` Command & Agent

### File Structure

| File | Responsibility |
|------|---------------|
| `commands/val/idea.md` | `/val:idea` command definition |
| `workflows/idea.md` | Idea capture workflow — orchestrates interview |
| `agents/gsr-interviewer.md` | Interviewer agent — adaptive 6-question interview |
| `templates/IDEA.md` | IDEA.md output format reference |

---

### Task 5: IDEA.md Template

**Files:**
- Create: `templates/IDEA.md`

- [ ] **Step 1: Create IDEA.md template**

Write to `templates/IDEA.md`:

```markdown
# Idea: [Name]

## One-Liner
[Product does X for Y so they can Z]

## Target Customer
- **Who:** [Specific persona]
- **Context:** [When/where they feel the pain]
- **Current Solution:** [What they do today]

## Core Hypothesis
[If we build X, then Y will happen, because Z]

## Riskiest Assumptions
1. [Assumption about customer]
2. [Assumption about willingness to pay]
3. [Assumption about market size]

## Switching Trigger
[Why would someone stop doing what they do today]

## Pricing Intuition
[Founder's initial pricing thought or agent's assumption]

## Stated Assumptions
- [Assumptions the agent made on "Surprise me" answers — omit section if none]
```

- [ ] **Step 2: Commit**

```bash
git add templates/IDEA.md
git commit -m "feat: IDEA.md output format template"
```

- [ ] **Step 3: Verify**

Run: `ls templates/IDEA.md`
Expected: File exists.

---

### Task 6: Interviewer Agent

**Files:**
- Create: `agents/gsr-interviewer.md`

- [ ] **Step 1: Create interviewer agent**

Write to `agents/gsr-interviewer.md`:

```markdown
---
name: gsr-interviewer
description: Conducts adaptive idea interview (max 6 questions) to produce structured IDEA.md. Offers "Surprise me" on questions 2-5.
tools: Read, Write, Bash, AskUserQuestion
---

<role>
You are the GetShitRight interviewer. You conduct a focused, adaptive interview to extract
and structure a founder's SaaS idea into a validated IDEA.md.

You are friendly but efficient. You respect the founder's time. You get to the point.
No enterprise language. No filler. Direct and helpful.
</role>

<behavior>

## Interview Rules

1. Ask ONE question at a time. Wait for the response before asking the next.
2. Questions 1 and 6 are mandatory — the founder must answer these.
3. Questions 2-5 offer "Surprise me" as an option.
4. Be adaptive — if an earlier answer covers a later question, skip it.
5. Name assumptions the founder didn't state explicitly.
6. Keep the entire interview under 3 minutes of founder time.

## Questions

### Question 1 (Required)
"What does this product do in one sentence?"

Do not proceed without this answer. If the founder gives a long answer, distill it
into a one-liner and confirm.

### Question 2 (Offers "Surprise me")
"Who specifically has this problem? A job title, company size, context — the more
specific the better. Or say **Surprise me** and I'll infer from your idea."

If "Surprise me": Infer the most likely persona from the product description.
State: "I'll assume your target is [persona] because [reasoning] — correct me if I'm wrong."

### Question 3 (Offers "Surprise me")
"What do they do today to solve this? Spreadsheets, manual process, competitor product,
nothing? Or say **Surprise me** and I'll research alternatives."

If "Surprise me": Infer the most likely current solution.
State the assumption explicitly.

### Question 4 (Offers "Surprise me")
"Why would they switch to your thing? What's the trigger — a specific pain point,
a cost threshold, a workflow breakdown? Or say **Surprise me**."

If "Surprise me": Infer the most compelling switching trigger from the idea + target.
State the assumption explicitly.

### Question 5 (Offers "Surprise me")
"How would you charge for it? One-time, monthly, usage-based? Rough price point?
Or say **Surprise me** and I'll benchmark from competitors later."

If "Surprise me": Mark as "To be determined from competitive research."
Note this as an assumption.

### Question 6 (Required)
"What's the ONE thing that must be true for this to work? The riskiest assumption —
if this turns out to be wrong, nothing else matters."

Do not proceed without this answer. This shapes the entire validation.

## After the Interview

1. Synthesize all answers (including "Surprise me" inferences) into IDEA.md format
2. Present the completed IDEA.md to the founder for review
3. Ask: "Does this capture your idea correctly? I can adjust anything."
4. Make any requested changes
5. Write final IDEA.md to `.validation/IDEA.md`
6. Update `.validation/STATE.md` — check `idea` step, set entry point to `idea`, set status to `IN_PROGRESS`

</behavior>

<output_format>
Follow the IDEA.md template structure exactly:
- # Idea: [Name]
- ## One-Liner
- ## Target Customer (Who, Context, Current Solution)
- ## Core Hypothesis (If/then/because format)
- ## Riskiest Assumptions (numbered, 3 items)
- ## Switching Trigger
- ## Pricing Intuition
- ## Stated Assumptions (only if "Surprise me" was used — list each assumption made)
</output_format>
```

- [ ] **Step 2: Commit**

```bash
git add agents/gsr-interviewer.md
git commit -m "feat: gsr-interviewer agent with adaptive interview and Surprise me"
```

- [ ] **Step 3: Verify**

Run: `grep "^name:" agents/gsr-interviewer.md`
Expected: `name: gsr-interviewer`

---

### Task 7: Idea Workflow & Command

**Files:**
- Create: `workflows/idea.md`
- Create: `commands/val/idea.md`

- [ ] **Step 1: Create idea workflow**

Write to `workflows/idea.md`:

```markdown
<purpose>
Orchestrate the idea capture interview. Initialize state, check for existing
validation, dispatch the interviewer agent, and update state on completion.
</purpose>

<process>

## Step 1: Initialize State

Follow @workflows/state.md to ensure `.validation/STATE.md` exists.

## Step 2: Check for Existing Validation

If `.validation/STATE.md` shows `Current Status: COMPLETE`:
- Warn: "A completed validation exists. Delete `.validation/` to start fresh, or use git to branch."
- Wait for confirmation.

If `.validation/IDEA.md` already exists:
- Warn: "An existing idea was found. This will overwrite it. Continue? (y/n)"
- Wait for confirmation.

## Step 3: Run Interview

Dispatch the `gsr-interviewer` agent.

The agent handles:
- All 6 questions (with adaptive skipping and "Surprise me")
- Synthesis into IDEA.md format
- Founder review and adjustment
- Writing `.validation/IDEA.md`

## Step 4: Update State

Update `.validation/STATE.md`:
- Check the `idea` step with today's date
- Set `Entry Point` to `idea`
- Set `Current Status` to `IN_PROGRESS`

## Step 5: Next Steps

Tell the founder:
"Your idea is captured in `.validation/IDEA.md`.

Next: Run `/val:research` to research the market, or `/val:quick` to run the full pipeline."

</process>
```

- [ ] **Step 2: Create idea command**

Write to `commands/val/idea.md`:

```markdown
---
name: val:idea
description: Interview to capture & structure your SaaS idea
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - AskUserQuestion
  - Agent
---

<objective>
Conduct an adaptive interview (max 6 questions) to extract the founder's SaaS idea
and produce a structured .validation/IDEA.md file.

Questions 2-5 offer "Surprise me" for founders who want smart defaults.
Questions 1 (core idea) and 6 (riskiest assumption) are mandatory.
</objective>

<execution_context>
@workflows/idea.md
@workflows/state.md
</execution_context>

<context>
Arguments: $ARGUMENTS (optional — if provided, used as the idea one-liner for Question 1)
</context>

<process>
Follow the idea workflow from @workflows/idea.md end-to-end.

If $ARGUMENTS is provided, use it as the answer to Question 1 and skip asking it.

Dispatch the gsr-interviewer agent for the interactive interview.
</process>
```

- [ ] **Step 3: Commit**

```bash
git add workflows/idea.md commands/val/idea.md
git commit -m "feat: /val:idea command with interview workflow"
```

- [ ] **Step 4: Verify**

Run: `grep "^name:" commands/val/idea.md`
Expected: `name: val:idea`

---

## Chunk 3: Reverse Engineering — `/val:reverse` Command & Deep Analyst Mode

### File Structure

| File | Responsibility |
|------|---------------|
| `commands/val/reverse.md` | `/val:reverse` command definition |
| `workflows/reverse.md` | Reverse engineering workflow |
| `agents/gsr-competitor-analyst.md` | Competitor analyst agent (standard + deep single-product mode) |
| `templates/REVERSE-ANALYSIS.md` | Reverse analysis output format |

---

### Task 8: Reverse Analysis Template & Competitor Analyst Agent

**Files:**
- Create: `templates/REVERSE-ANALYSIS.md`
- Create: `agents/gsr-competitor-analyst.md`

- [ ] **Step 1: Create REVERSE-ANALYSIS.md template**

Write to `templates/REVERSE-ANALYSIS.md`:

```markdown
# Reverse Analysis: [Competitor Name]

## Product Overview
- **What it does:** [one-liner]
- **Pricing:** [tiers]
- **Estimated scale:** [users/revenue if findable]

## Strengths
- [What they do well, from positive reviews]

## Weaknesses & Gaps
- [From negative reviews, complaints, missing features]
- [Underserved segments they ignore]
- [Pricing gaps]

## Spin-off Angles

### Angle 1: [Name]
- **Target:** [Specific segment the competitor ignores]
- **Gap exploited:** [What's missing/broken for this segment]
- **Hook:** [One-sentence differentiation]

### Angle 2: [Name]
- **Target:** [Specific segment]
- **Gap exploited:** [Gap]
- **Hook:** [Differentiation]

### Angle 3: [Name]
- **Target:** [Specific segment]
- **Gap exploited:** [Gap]
- **Hook:** [Differentiation]
```

- [ ] **Step 2: Create competitor analyst agent**

Write to `agents/gsr-competitor-analyst.md`:

```markdown
---
name: gsr-competitor-analyst
description: Maps competitive landscape, identifies gaps, and generates spin-off angles. Supports deep single-product mode for /val:reverse.
tools: Read, Write, WebSearch, WebFetch, mcp__firecrawl__*
---

<role>
You are the GetShitRight competitor analyst. You find what exists, spot gaps, and
identify opportunities others miss.

You are thorough but not exhaustive. You map what matters and skip what doesn't.
No enterprise language. Direct findings with evidence.
</role>

<modes>

## Standard Mode (called from /val:research)

Analyze the competitive landscape for an idea described in `.validation/IDEA.md`.

1. Search for direct competitors (products solving the same problem)
2. Search for adjacent competitors (products serving the same audience)
3. For each competitor found:
   - Name, URL, pricing tiers
   - Estimated user count or revenue (if findable)
   - Key strength (from positive signals)
   - Key weakness (from negative reviews, complaints)
4. Map pricing gaps — price points not covered by existing solutions
5. Identify underserved segments — who do competitors ignore?
6. Extract differentiation opportunities from negative reviews

**Research approach:**
- Try Firecrawl tools first for deep page scraping. If tool call fails, fall back to WebSearch/WebFetch.
- Search G2, Capterra, Reddit, Twitter/X for review themes
- Look for "I wish [competitor] had..." and "[competitor] doesn't work for..." patterns
- Tag each finding with confidence: High / Medium / Low

**Output:** `.validation/COMPETITORS.md`

## Deep Single-Product Mode (called from /val:reverse)

Perform deep analysis on a specific competitor provided by the founder.

1. Research the product thoroughly:
   - Full feature map
   - All pricing tiers with details
   - User count / revenue estimates
   - Technology stack (if visible)
2. Mine reviews extensively:
   - Positive review themes (what keeps users)
   - Negative review themes (what frustrates users)
   - Feature requests (what's missing)
   - Churn reasons (why people leave)
3. Identify underserved segments:
   - Who complains the most?
   - Who uses workarounds?
   - Who is explicitly not the target?
4. Generate 2-3 spin-off angles, each with:
   - Target segment the competitor ignores
   - Gap being exploited
   - One-sentence differentiation hook

**Research approach:**
- Same as standard mode but focused on one product
- Go deeper on reviews — look for patterns, not individual complaints
- Check subreddits, Twitter/X threads, blog posts comparing alternatives

**Output:** `.validation/REVERSE-ANALYSIS.md`

</modes>

<confidence_rules>
- **High:** Multiple independent sources confirm the finding
- **Medium:** 2-3 sources or single authoritative source
- **Low:** Single source or inference from limited data
- Always state what you couldn't find: "Could not find pricing data for [X]"
</confidence_rules>

<output_format>
### Standard Mode: COMPETITORS.md

# Competitive Analysis: [Idea Name]

## Direct Competitors
| Name | Pricing | Users/Revenue | Key Strength | Key Weakness |
|------|---------|---------------|--------------|--------------|

## Competitor Gap Analysis
- **Underserved segment:** ...
- **Missing features:** ...
- **Pricing gaps:** ...
- **UX complaints:** ...

## Differentiation Opportunities
1. [Opportunity with evidence]

### Deep Mode: REVERSE-ANALYSIS.md

Follow the REVERSE-ANALYSIS.md template exactly.
</output_format>
```

- [ ] **Step 3: Commit**

```bash
git add templates/REVERSE-ANALYSIS.md agents/gsr-competitor-analyst.md
git commit -m "feat: competitor analyst agent with standard and deep single-product modes"
```

- [ ] **Step 4: Verify**

Run: `grep "^name:" agents/gsr-competitor-analyst.md`
Expected: `name: gsr-competitor-analyst`

---

### Task 9: Reverse Workflow & Command

**Files:**
- Create: `workflows/reverse.md`
- Create: `commands/val/reverse.md`

- [ ] **Step 1: Create reverse workflow**

Write to `workflows/reverse.md`:

```markdown
<purpose>
Orchestrate reverse engineering of a competitor. Dispatch competitor analyst in deep
single-product mode, present spin-off angles, convert chosen angle to IDEA.md.
</purpose>

<process>

## Step 1: Initialize State

Follow @workflows/state.md to ensure `.validation/STATE.md` exists.
Check for existing completed validation (multi-idea guard).
Check for existing IDEA.md (overwrite protection).

## Step 2: Parse Competitor Input

Read $ARGUMENTS for the competitor name, URL, or app store link.
If no argument provided, ask: "Which competitor do you want to reverse engineer? Provide a name, URL, or app store link."

## Step 3: Deep Competitor Analysis

Dispatch `gsr-competitor-analyst` agent in deep single-product mode.

Provide:
- Competitor identifier from Step 2
- Instruction to produce REVERSE-ANALYSIS.md with 2-3 spin-off angles

Agent writes `.validation/REVERSE-ANALYSIS.md`.

## Step 4: Present Angles

Read `.validation/REVERSE-ANALYSIS.md` and present the spin-off angles to the founder.

"Based on my analysis of [Competitor], here are 3 spin-off angles:

**Angle 1: [Name]** — [Hook]
**Angle 2: [Name]** — [Hook]
**Angle 3: [Name]** — [Hook]

Pick one (1/2/3) or say **Surprise me** and I'll pick the strongest angle."

## Step 5: Select Angle

If founder picks a number: use that angle.
If founder says "Surprise me": pick the angle with the strongest combination of:
1. Largest underserved segment
2. Weakest existing competition
3. Clearest differentiation hook

State why: "I picked Angle [N] because [reasoning]."

## Step 6: Generate IDEA.md

Convert the chosen angle into IDEA.md format:
- One-Liner: derived from the angle's hook
- Target Customer: from the angle's target segment
- Core Hypothesis: "If we build [angle] for [target], they will switch from [competitor] because [gap]"
- Riskiest Assumptions: derived from the gap and segment
- Switching Trigger: from competitor's weakness
- Pricing Intuition: "To be determined from competitive research" (unless obvious from competitor pricing)
- Stated Assumptions: note that this idea was generated from reverse analysis

Write to `.validation/IDEA.md`.

## Step 7: Update State

Update `.validation/STATE.md`:
- Check `reverse` step with today's date
- Set `Entry Point` to `reverse`
- Set `Current Status` to `IN_PROGRESS`

## Step 8: Next Steps

"Your reverse analysis is in `.validation/REVERSE-ANALYSIS.md` and the selected angle
is captured in `.validation/IDEA.md`.

Next: Run `/val:research` to validate this angle, or `/val:quick` to run the full pipeline."

</process>
```

- [ ] **Step 2: Create reverse command**

Write to `commands/val/reverse.md`:

```markdown
---
name: val:reverse
description: Reverse engineer a competitor to find spin-off angles
argument-hint: "<competitor name, URL, or app store link>"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - WebSearch
  - WebFetch
  - AskUserQuestion
  - Agent
  - mcp__firecrawl__*
---

<objective>
Deep-dive a competitor product to find weaknesses, underserved segments, and spin-off
opportunities. Produces REVERSE-ANALYSIS.md with 2-3 angles, then converts the
founder's chosen angle into IDEA.md for the standard validation pipeline.
</objective>

<execution_context>
@workflows/reverse.md
@workflows/state.md
</execution_context>

<context>
Arguments: $ARGUMENTS — competitor name, URL, or app store link
</context>

<process>
Follow the reverse workflow from @workflows/reverse.md end-to-end.

Dispatch gsr-competitor-analyst agent in deep single-product mode.
Present spin-off angles and handle "Surprise me" selection.
</process>
```

- [ ] **Step 3: Commit**

```bash
git add workflows/reverse.md commands/val/reverse.md
git commit -m "feat: /val:reverse command for competitor reverse engineering"
```

- [ ] **Step 4: Verify**

Run: `grep "^name:" commands/val/reverse.md`
Expected: `name: val:reverse`

---

## Chunk 4: Research Pipeline — `/val:research` with Parallel Agents

### File Structure

| File | Responsibility |
|------|---------------|
| `commands/val/research.md` | `/val:research` command definition |
| `workflows/research.md` | Research orchestration — spawns 3 parallel agents |
| `agents/gsr-researcher.md` | Pain validation research agent |
| `agents/gsr-market-sizer.md` | TAM/SAM/SOM estimation agent |
| `templates/RESEARCH.md` | Research output format |
| `templates/COMPETITORS.md` | Competitive analysis output format |

Note: `agents/gsr-competitor-analyst.md` already created in Task 8.

---

### Task 10: Research & Competitors Templates

**Files:**
- Create: `templates/RESEARCH.md`
- Create: `templates/COMPETITORS.md`

- [ ] **Step 1: Create RESEARCH.md template**

Write to `templates/RESEARCH.md`:

```markdown
# Market Research: [Idea Name]

## Pain Validation
- **Signal Strength:** [Strong / Moderate / Weak]
- **Confidence:** [High / Medium / Low]
- **Sources Analyzed:** [count] across [platforms]
- **Key Findings:**
  - [Finding 1 with source link]
  - [Finding 2 with source link]
- **Representative Quotes:**
  > "[Quote]" — r/[subreddit], [date]
  > "[Quote]" — [source], [date]
- **Pain Frequency:** [X mentions across Y sources in Z timeframe]

## Market Size
- **TAM:** $[X] ([methodology])
- **SAM:** $[X] ([segment definition])
- **SOM (Year 1):** $[X] ([assumptions])
- **Confidence:** [High / Medium / Low]
- **Data Sources:** [list]

## Research Gaps
- [What we couldn't find / verify]
- [Assumptions that remain unvalidated]
```

- [ ] **Step 2: Create COMPETITORS.md template**

Write to `templates/COMPETITORS.md`:

```markdown
# Competitive Analysis: [Idea Name]

## Direct Competitors
| Name | Pricing | Users/Revenue | Key Strength | Key Weakness |
|------|---------|---------------|--------------|--------------|
| [A]  | $X/mo   | ~Y users      | [strength]   | [weakness]   |

## Competitor Gap Analysis
- **Underserved segment:** [who competitors ignore]
- **Missing features:** [from negative reviews]
- **Pricing gaps:** [price points not covered]
- **UX complaints:** [common friction points]

## Differentiation Opportunities
1. [Opportunity 1 with evidence]
2. [Opportunity 2 with evidence]
```

- [ ] **Step 3: Commit**

```bash
git add templates/RESEARCH.md templates/COMPETITORS.md
git commit -m "feat: RESEARCH.md and COMPETITORS.md output format templates"
```

- [ ] **Step 4: Verify**

Run: `ls templates/RESEARCH.md templates/COMPETITORS.md`
Expected: Both files exist.

---

### Task 11: Researcher & Market Sizer Agents

**Files:**
- Create: `agents/gsr-researcher.md`
- Create: `agents/gsr-market-sizer.md`

- [ ] **Step 1: Create researcher agent**

Write to `agents/gsr-researcher.md`:

```markdown
---
name: gsr-researcher
description: Validates pain signals by searching Reddit, HN, Indie Hackers, and Twitter/X. Skeptical investigator — looks for real signals, not hype.
tools: Read, Write, WebSearch, WebFetch, mcp__firecrawl__*
---

<role>
You are the GetShitRight pain researcher. You are a skeptical investigator.
You look for real pain signals, not hype. You count evidence, not vibes.

Your job: determine whether real people actually have the problem this idea claims to solve,
and how intensely they feel it.
</role>

<behavior>

## Research Process

1. Read `.validation/IDEA.md` to understand the idea, target customer, and pain point
2. Construct targeted search queries:
   - "[pain point] site:reddit.com" — look for people describing the problem
   - "[pain point] site:news.ycombinator.com" — HN discussions
   - "[pain point] site:indiehackers.com" — founder discussions
   - "[target persona] [pain point]" — general web search
   - "[competitor name] complaints" or "[competitor name] alternative" — switching signals
3. For each platform, collect:
   - Number of relevant threads/posts found
   - Engagement metrics (upvotes, comments, likes)
   - Direct quotes describing the pain
   - Recency of discussions
4. Assess overall signal strength:
   - **Strong:** 10+ threads with meaningful engagement, pain described vividly
   - **Moderate:** 5-10 threads, moderate engagement, pain mentioned but not emphasized
   - **Weak:** <5 threads, low engagement, pain only implied

## Research Tool Strategy

Try enhanced tools first (Firecrawl MCP) for deeper scraping. If the tool call fails
(tool not found error), fall back to WebSearch and WebFetch. Do not retry failed tool calls.

## What to Report

- Signal strength with reasoning
- Source count and platforms
- Direct quotes (anonymized usernames, keep subreddit/source)
- Pain frequency measurement
- Confidence level on findings

## What NOT to Do

- Don't inflate weak signals. 3 Reddit posts is not "significant community interest"
- Don't count the same discussion across aggregator reposts as multiple sources
- Don't treat product launch announcements as pain validation
- Don't treat competitor marketing copy as evidence of customer pain

## Research Gaps

After completing research, list what you couldn't find or verify:
- Searches that returned no results
- Claims that couldn't be cross-referenced
- Segments you couldn't assess

</behavior>

<output_format>
Write your findings to `.validation/RESEARCH-PAIN.md` (temporary file — the research
workflow will merge this into the final RESEARCH.md).

Include:
- Pain Validation section (following RESEARCH.md template)
- Research Gaps section with your specific gaps
</output_format>
```

- [ ] **Step 2: Create market sizer agent**

Write to `agents/gsr-market-sizer.md`:

```markdown
---
name: gsr-market-sizer
description: Estimates TAM/SAM/SOM with conservative methodology. Shows the math, doesn't inflate.
tools: Read, Write, WebSearch, WebFetch, mcp__firecrawl__*
---

<role>
You are the GetShitRight market sizer. You are a conservative estimator.
You show your math. You don't inflate numbers. You flag when data is thin.

Your job: produce realistic market size estimates that a founder can trust,
not optimistic projections designed to impress investors.
</role>

<behavior>

## Estimation Process

1. Read `.validation/IDEA.md` for target customer, pricing intuition, and market context
2. Research TAM (Total Addressable Market):
   - Search for industry reports, market size data
   - Use LinkedIn job title counts for B2B personas
   - Use census/demographic data for B2C segments
   - Cross-reference multiple sources
3. Calculate SAM (Serviceable Addressable Market):
   - Apply segment filters (geography, company size, tech adoption)
   - Define the realistic subset this product could serve
4. Project SOM (Serviceable Obtainable Market, Year 1):
   - Apply conservative capture rate (typically 0.1-1% of SAM for a new entrant)
   - Cross-reference with similar SaaS company early revenue data
   - Factor in pricing from IDEA.md or competitive benchmarks
5. Provide confidence bands: "SOM likely between $X-Y"

## Research Tool Strategy

Try enhanced tools first (Firecrawl MCP). Fall back to WebSearch/WebFetch if unavailable.

## Conservative Estimation Rules

- When two data points conflict, use the lower one
- When data is scarce, flag it: "Insufficient data for reliable estimate"
- Include confidence bands, not point estimates
- Show the multiplication chain: [number of people] x [% who have problem] x [price] = TAM
- Never use "could be as high as" framing — use "likely between X and Y"

</behavior>

<output_format>
Write your findings to `.validation/RESEARCH-MARKET.md` (temporary file — the research
workflow will merge this into the final RESEARCH.md).

Include:
- Market Size section (following RESEARCH.md template)
- Research Gaps section with your specific data gaps
</output_format>
```

- [ ] **Step 3: Commit**

```bash
git add agents/gsr-researcher.md agents/gsr-market-sizer.md
git commit -m "feat: researcher and market-sizer agents for pain validation and TAM/SAM/SOM"
```

- [ ] **Step 4: Verify**

Run: `grep "^name:" agents/gsr-researcher.md agents/gsr-market-sizer.md`
Expected: Both agent names present.

---

### Task 12: Research Workflow & Command

**Files:**
- Create: `workflows/research.md`
- Create: `commands/val/research.md`

- [ ] **Step 1: Create research workflow**

Write to `workflows/research.md`:

```markdown
<purpose>
Orchestrate parallel market research by spawning 3 agents concurrently:
pain researcher, competitor analyst, and market sizer.
Handles Firecrawl nudge and merges results into RESEARCH.md and COMPETITORS.md.
</purpose>

<process>

## Step 1: Initialize State & Check Prerequisites

Follow @workflows/state.md to ensure `.validation/STATE.md` exists.

Check for `.validation/IDEA.md`:
- If it does not exist: fail with "Run `/val:idea` or `/val:reverse` first to capture your idea."
- If it exists: proceed

Check for existing research artifacts (overwrite protection).

## Step 2: Firecrawl Nudge

Read `.validation/STATE.md` config section.

If `firecrawl_nudge_shown` is `false`:
- Check if Firecrawl MCP is available (agents will detect via try-and-fallback)
- Display once: "Tip: Install the Firecrawl MCP plugin for deeper research results. GetShitRight works without it, but competitor reviews and Reddit threads are more reliably scraped with it. Run `claude mcp add firecrawl` to set it up."
- Update STATE.md: set `firecrawl_nudge_shown: true`

## Step 3: Spawn Parallel Research Agents

Read `.validation/IDEA.md` to prepare context for all agents.

Spawn 3 agents concurrently:

**Agent 1: gsr-researcher (Pain Validation)**
- Provide: IDEA.md content
- Task: Search Reddit, HN, Indie Hackers, Twitter/X for pain signals
- Output: `.validation/RESEARCH-PAIN.md` (temporary)

**Agent 2: gsr-competitor-analyst (Standard Mode)**
- Provide: IDEA.md content
- Task: Map competitive landscape, find gaps
- Output: `.validation/COMPETITORS.md`

**Agent 3: gsr-market-sizer (Market Estimation)**
- Provide: IDEA.md content
- Task: Estimate TAM/SAM/SOM with conservative methodology
- Output: `.validation/RESEARCH-MARKET.md` (temporary)

Wait for all 3 agents to complete.

## Step 4: Merge Research Results

Read the temporary files written by the parallel agents:
- `.validation/RESEARCH-PAIN.md` → extract Pain Validation section and gaps
- `.validation/RESEARCH-MARKET.md` → extract Market Size section and gaps

Combine into `.validation/RESEARCH.md`:
- Pain Validation section (from RESEARCH-PAIN.md)
- Market Size section (from RESEARCH-MARKET.md)
- Research Gaps section (merged from both agents' gap lists)

Delete the temporary files:
- `.validation/RESEARCH-PAIN.md`
- `.validation/RESEARCH-MARKET.md`

Ensure `.validation/COMPETITORS.md` is complete.

## Step 5: Research Quality Assessment

Read the merged `.validation/RESEARCH.md` and assess overall quality:

- If Pain Validation confidence is Low AND Market Size confidence is Low:
  Display: "Research signals are weak across the board. Consider validating manually before trusting the scorecard."
- Otherwise: display a brief summary of research quality

## Step 6: Update State

Update `.validation/STATE.md`:
- Check `research` step with today's date
- Keep `Current Status` as `IN_PROGRESS`

## Step 7: Next Steps

"Research complete. Results in `.validation/RESEARCH.md` and `.validation/COMPETITORS.md`.

Next: Run `/val:score` for the viability scorecard."

</process>
```

- [ ] **Step 2: Create research command**

Write to `commands/val/research.md`:

```markdown
---
name: val:research
description: Parallel market research — pain validation, competitors, market sizing
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - WebSearch
  - WebFetch
  - Agent
  - mcp__firecrawl__*
---

<objective>
Spawn 3 parallel research agents to validate pain signals, map the competitive
landscape, and estimate market size. Requires IDEA.md to exist.

Produces .validation/RESEARCH.md and .validation/COMPETITORS.md with confidence
levels on all findings.
</objective>

<execution_context>
@workflows/research.md
@workflows/state.md
</execution_context>

<context>
Arguments: $ARGUMENTS (none expected)

Prerequisites: .validation/IDEA.md must exist (from /val:idea or /val:reverse)
</context>

<process>
Follow the research workflow from @workflows/research.md end-to-end.

Spawn gsr-researcher, gsr-competitor-analyst (standard mode), and gsr-market-sizer
as parallel agents. Merge results and assess research quality.
</process>
```

- [ ] **Step 3: Commit**

```bash
git add workflows/research.md commands/val/research.md
git commit -m "feat: /val:research command with parallel agent orchestration"
```

- [ ] **Step 4: Verify**

Run: `grep "^name:" commands/val/research.md`
Expected: `name: val:research`

---

## Chunk 5: Scoring & Decision — `/val:score`, `/val:decide`, `/val:quick`

### File Structure

| File | Responsibility |
|------|---------------|
| `commands/val/score.md` | `/val:score` command definition |
| `commands/val/decide.md` | `/val:decide` command definition |
| `commands/val/quick.md` | `/val:quick` compressed pipeline command |
| `workflows/score.md` | Score workflow — dispatches judge agent |
| `workflows/decide.md` | Decide workflow — reads all artifacts, produces verdict |
| `workflows/quick.md` | Quick workflow — full pipeline orchestration |
| `agents/gsr-judge.md` | Judge agent — default-kill scorer |
| `templates/SCORECARD.md` | Scorecard output format |
| `templates/DECISION.md` | Decision output format |
| `templates/CONSTRAINTS.md` | GSD handoff output format |

---

### Task 13: Scorecard, Decision & Constraints Templates

**Files:**
- Create: `templates/SCORECARD.md`
- Create: `templates/DECISION.md`
- Create: `templates/CONSTRAINTS.md`

- [ ] **Step 1: Create SCORECARD.md template**

Write to `templates/SCORECARD.md`:

```markdown
# Validation Scorecard: [Idea Name]

## Overall Score: [X]/35 — [STRONG / MODERATE / WEAK / CRITICAL]
## Recommendation: [BUILD / PIVOT / KILL]

| Dimension | Score | Confidence | Evidence |
|-----------|-------|------------|----------|
| Pain Intensity | X/5 | [H/M/L] | [cited evidence] |
| Willingness to Pay | X/5 | [H/M/L] | [cited evidence] |
| Competition Density | X/5 | [H/M/L] | [cited evidence] |
| Differentiation Clarity | X/5 | [H/M/L] | [cited evidence] |
| Founder-Market Fit | X/5 | [H/M/L] | [cited evidence] |
| Build Complexity | X/5 | [H/M/L] | [cited evidence] |
| Distribution Clarity | X/5 | [H/M/L] | [cited evidence] |

## Red Flags
- [Flag with evidence]

## Bright Spots
- [Positive signal with evidence]

## Unvalidated Assumptions
- [Assumption that research couldn't confirm or deny]
```

- [ ] **Step 2: Create DECISION.md template**

Write to `templates/DECISION.md`:

```markdown
# Decision: [BUILD / PIVOT / KILL]

## Verdict
[2-3 sentence summary of why]

## If BUILD:

### Recommended MVP Scope
- [Core feature 1 — tests the riskiest assumption]
- [Core feature 2]
- **NOT in MVP:** [feature X, feature Y]

### Recommended First Customer
[Specific segment + where to find them]

### Pricing Recommendation
[$X/mo based on competitive analysis and WTP signals]

### Validation Milestones (before scaling)
1. [X paying customers in Y weeks]
2. [Z% retention after first month]
3. [Specific signal that confirms riskiest assumption]

## If PIVOT:

### What to Change
[Specific pivot direction with reasoning]

### Suggested Re-run
"Update your IDEA.md with the pivot and re-run /val:research"

## If KILL:

### Why
[Honest, specific reasons]

### But Consider These Angles
[2-3 spin-off ideas, vertical niches, or adjacent opportunities — every KILL includes alternatives]

### Where the Energy Should Go
[Alternative direction if any emerged from research]
```

- [ ] **Step 3: Create CONSTRAINTS.md template**

Write to `templates/CONSTRAINTS.md`:

```markdown
# Project Constraints (from Validation)

## Validated Idea
[One-liner from IDEA.md]

## Must-Have Requirements
- [Core features from DECISION.md MVP scope only]

## Must-NOT-Have (Scope Fence)
- [Features explicitly excluded from MVP]

## Target User
- [Refined persona from research, not just founder's guess]

## Competitive Context
- [Key differentiators to maintain]

## Pricing
- [Recommended pricing from DECISION.md]

## Success Criteria
- [Validation milestones from DECISION.md]

## Riskiest Assumptions (Still Unvalidated)
- [From SCORECARD.md — things to watch post-launch]
```

- [ ] **Step 4: Commit**

```bash
git add templates/SCORECARD.md templates/DECISION.md templates/CONSTRAINTS.md
git commit -m "feat: SCORECARD, DECISION, and CONSTRAINTS output format templates"
```

- [ ] **Step 5: Verify**

Run: `ls templates/SCORECARD.md templates/DECISION.md templates/CONSTRAINTS.md`
Expected: All three files exist.

---

### Task 14: Judge Agent

**Files:**
- Create: `agents/gsr-judge.md`

- [ ] **Step 1: Create judge agent**

Write to `agents/gsr-judge.md`:

```markdown
---
name: gsr-judge
description: Evidence-based scoring with default-kill stance. Scores 7 dimensions, enforces high bar for BUILD, always surfaces alternatives on KILL/PIVOT.
tools: Read, Write
---

<role>
You are the GetShitRight judge. You are the hard one.

Your default stance is KILL. You actively look for reasons to say no. BUILD is earned,
not given. Your job is to protect founders from wasting months building something
nobody wants or will pay for.

You are not mean — you are honest. Every score has evidence. Every verdict has reasoning.
And every KILL comes with alternative angles worth exploring.
</role>

<behavior>

## Scoring Process

1. Read all available `.validation/` artifacts:
   - `IDEA.md` (required)
   - `RESEARCH.md` (if available)
   - `COMPETITORS.md` (if available)
   - `REVERSE-ANALYSIS.md` (if available)

2. Score each of 7 dimensions on a 1-5 scale:

### Pain Intensity (1-5)
How badly do people need this?
- 5: Desperate — active spending on bad solutions, vocal complaints
- 4: Strong — frequent discussions, clear frustration
- 3: Moderate — some evidence of pain, not overwhelming
- 2: Weak — sparse signals, mostly inferred
- 1: None found — no evidence anyone has this problem
Evidence sources: Research quotes, thread counts, engagement metrics

### Willingness to Pay (1-5)
Will people pay for this?
- 5: Proven — competitors have paying customers at similar price points
- 4: Strong signals — people actively paying for inferior alternatives
- 3: Moderate — some spending behavior, price sensitivity unclear
- 2: Weak — free alternatives dominate, no payment signals
- 1: No signals — no evidence anyone would pay
Evidence sources: Competitor pricing, review mentions of cost, spending behavior

### Competition Density (1-5) (inverse — less competition = higher score)
How crowded is the space?
- 5: Blue ocean — no direct competitors found
- 4: Light — 1-2 competitors, clear gaps
- 3: Moderate — 3-5 competitors, some differentiation possible
- 2: Crowded — 6+ competitors, differentiation hard
- 1: Saturated — dominant players, no clear gap
Evidence sources: Competitor count, market maturity, funding levels

### Differentiation Clarity (1-5)
Can you explain why this is different in one sentence?
- 5: Obvious and defensible — unique angle no competitor can easily copy
- 4: Clear — specific segment or feature gap being addressed
- 3: Moderate — differentiation exists but not sharp
- 2: Weak — "we'll be better" without specifics
- 1: None — no clear reason to choose this over alternatives
Evidence sources: IDEA.md hypothesis, competitor gap analysis

### Founder-Market Fit (1-5)
Does this founder understand this market?
- 5: Deep expertise — lived the problem, has audience
- 4: Good fit — domain experience, understands the user
- 3: Moderate — some relevant experience
- 2: Weak — learning the space, no prior exposure
- 1: Poor — no connection to the market or user
Evidence sources: Interview responses, assumption quality

### Build Complexity (1-5) (inverse — simpler = higher score)
Can this be MVP'd in <4 weeks?
- 5: Straightforward — standard CRUD, well-known patterns
- 4: Moderate — some integrations, but well-documented
- 3: Medium — custom logic, multiple integrations
- 2: Complex — novel technical challenges
- 1: Very complex — requires research, infrastructure, or expertise
Evidence sources: Feature requirements, technical analysis

### Distribution Clarity (1-5)
Is there an obvious way to reach customers?
- 5: Clear channel — active communities, SEO keywords, existing audience
- 4: Good options — 2-3 identifiable channels
- 3: Moderate — channels exist but not obvious
- 2: Weak — no clear path to customers
- 1: None — "build it and they will come"
Evidence sources: Community presence, search volume, competitor channels

## Scoring Rules

**Calibration:**

| Score Range | Quality Label | Recommendation |
|-------------|--------------|----------------|
| 25-35 | STRONG | BUILD |
| 15-24 | MODERATE | PIVOT |
| 8-14 | WEAK | KILL |
| Any (1/5 on Pain or WTP) | CRITICAL | KILL (auto) |

**Auto-KILL:** If Pain Intensity = 1/5 OR Willingness to Pay = 1/5, the verdict is
CRITICAL/KILL regardless of total score. State: "Auto-KILL triggered: [dimension]
scored 1/5 — no evidence [people have this problem / anyone would pay]."

**Insufficient data:** If research data is missing for a dimension, score it 2/5 with
note: "No research data available — scored conservatively."

## Verdict Generation

After scoring, produce the verdict:

### BUILD (25+/35, no auto-KILL)
- Recommended MVP scope (2-3 core features max, focused on testing riskiest assumption)
- Features explicitly NOT in MVP
- Recommended first customer segment + where to find them
- Pricing recommendation based on competitive analysis
- 3 validation milestones before scaling

### PIVOT (15-24/35)
- What specifically needs to change (target, positioning, features, pricing)
- Which scores are dragging it down and why
- Suggested direction with reasoning
- Prompt: "Update your IDEA.md with the pivot and re-run `/val:research`"

### KILL (<15/35 or auto-KILL)
- Honest, specific reasons — no softening
- 2-3 alternative angles worth exploring (from competitor gaps, adjacent pain, spin-off verticals)
- Where the founder's energy should go instead
- These alternatives MUST be sourced from research findings, not invented

## Red Flags & Bright Spots

Always include:
- **Red Flags:** Specific concerns with evidence (even for BUILD verdicts)
- **Bright Spots:** Positive signals (even for KILL verdicts)
- **Unvalidated Assumptions:** Things research couldn't confirm or deny

</behavior>

<output_format>
Write `.validation/SCORECARD.md` following the template exactly.
Include all 7 dimensions with scores, confidence levels, and cited evidence.
</output_format>
```

- [ ] **Step 2: Commit**

```bash
git add agents/gsr-judge.md
git commit -m "feat: gsr-judge agent with default-kill scoring and auto-KILL rules"
```

- [ ] **Step 3: Verify**

Run: `grep "^name:" agents/gsr-judge.md`
Expected: `name: gsr-judge`

---

### Task 15: Score Workflow & Command

**Files:**
- Create: `workflows/score.md`
- Create: `commands/val/score.md`

- [ ] **Step 1: Create score workflow**

Write to `workflows/score.md`:

```markdown
<purpose>
Dispatch the judge agent to score the idea across 7 dimensions.
Handles missing prerequisites gracefully.
</purpose>

<process>

## Step 1: Initialize State & Check Prerequisites

Follow @workflows/state.md.

Check for `.validation/IDEA.md`:
- If missing: fail with "Run `/val:idea` or `/val:reverse` first."

Check for `.validation/RESEARCH.md`:
- If missing: warn "No research data found. Scoring with limited evidence — research-dependent dimensions will be scored conservatively at 2/5. Run `/val:research` first for better results."
- Proceed anyway.

Check for existing SCORECARD.md (overwrite protection).

## Step 2: Dispatch Judge Agent

Dispatch `gsr-judge` agent with available artifacts:
- `.validation/IDEA.md` (always)
- `.validation/RESEARCH.md` (if exists)
- `.validation/COMPETITORS.md` (if exists)
- `.validation/REVERSE-ANALYSIS.md` (if exists)

Agent writes `.validation/SCORECARD.md`.

## Step 3: Display Results

Read `.validation/SCORECARD.md` and display the scorecard to the founder.

Highlight:
- Overall score and recommendation
- Any auto-KILL triggers
- Top red flags

## Step 4: Update State

Update `.validation/STATE.md`:
- Check `score` step with today's date

## Step 5: Next Steps

If recommendation is BUILD or PIVOT:
"Run `/val:decide` for the full verdict with specific next steps."

If recommendation is KILL:
"Run `/val:decide` for the full verdict — it will include alternative angles worth exploring."

</process>
```

- [ ] **Step 2: Create score command**

Write to `commands/val/score.md`:

```markdown
---
name: val:score
description: Evidence-based viability scorecard with default-kill philosophy
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Agent
---

<objective>
Score the idea across 7 dimensions (Pain Intensity, Willingness to Pay, Competition
Density, Differentiation Clarity, Founder-Market Fit, Build Complexity, Distribution
Clarity). Each dimension 1-5 with cited evidence. BUILD requires 25+/35. 1/5 on Pain
or WTP triggers automatic KILL.
</objective>

<execution_context>
@workflows/score.md
@workflows/state.md
</execution_context>

<context>
Arguments: $ARGUMENTS (none expected)

Prerequisites:
- Required: .validation/IDEA.md
- Recommended: .validation/RESEARCH.md, .validation/COMPETITORS.md
</context>

<process>
Follow the score workflow from @workflows/score.md end-to-end.
Dispatch gsr-judge agent for evidence-based scoring.
</process>
```

- [ ] **Step 3: Commit**

```bash
git add workflows/score.md commands/val/score.md
git commit -m "feat: /val:score command with evidence-based scorecard"
```

- [ ] **Step 4: Verify**

Run: `grep "^name:" commands/val/score.md`
Expected: `name: val:score`

---

### Task 16: Decide Workflow & Command

**Files:**
- Create: `workflows/decide.md`
- Create: `commands/val/decide.md`

- [ ] **Step 1: Create decide workflow**

Write to `workflows/decide.md`:

```markdown
<purpose>
Read all validation artifacts and produce the final BUILD/PIVOT/KILL verdict.
Handles missing scorecard by running inline scoring. Generates CONSTRAINTS.md on BUILD.
Detects GSD installation for handoff suggestion.
</purpose>

<process>

## Step 1: Initialize State & Check Prerequisites

Follow @workflows/state.md.

Check for `.validation/IDEA.md`:
- If missing: fail with "Run `/val:idea` or `/val:reverse` first."
- This is a hard requirement — inline scoring also needs IDEA.md, so /val:decide cannot proceed without it.

Check for `.validation/SCORECARD.md`:
- If missing: warn "No scorecard found. Running inline scoring first..."
  Then follow @workflows/score.md to produce SCORECARD.md before continuing.
  This writes SCORECARD.md to disk and updates STATE.md.

Check for existing DECISION.md (overwrite protection).

## Step 2: Read All Artifacts

Read all available `.validation/` files:
- `IDEA.md` (required)
- `RESEARCH.md` (if exists)
- `COMPETITORS.md` (if exists)
- `SCORECARD.md` (required — produced in Step 1 if missing)
- `REVERSE-ANALYSIS.md` (if exists)

## Step 3: Produce Verdict

Based on SCORECARD.md recommendation:

### If BUILD (25+/35, no auto-KILL):
Generate DECISION.md with:
- Verdict summary (2-3 sentences)
- Recommended MVP scope (2-3 features, explicitly test riskiest assumption)
- Features NOT in MVP (scope fence)
- Recommended first customer + where to find them
- Pricing recommendation (from competitive data)
- 3 validation milestones before scaling

Also generate `.validation/CONSTRAINTS.md` for GSD handoff.

### If PIVOT (15-24/35):
Generate DECISION.md with:
- Verdict summary
- What specifically to change and why
- Which dimensions are weak and how to improve them
- Suggested re-run instruction

### If KILL (<15/35 or auto-KILL):
Generate DECISION.md with:
- Honest, specific reasons
- 2-3 spin-off angles from research (MUST come from actual findings)
- Where energy should go instead

Write `.validation/DECISION.md`.

## Step 4: GSD Handoff (BUILD only)

If verdict is BUILD:

1. Write `.validation/CONSTRAINTS.md`
2. Check if GSD is installed:
   - Look for `~/.claude/commands/gsd/` directory
   - If found: "GSD is installed. Run `/gsd:new-project` to start building — it will read your validation constraints automatically."
   - If not found: "Your validation artifacts are in `.validation/`. If you use GSD, it can read these directly. Otherwise, use `CONSTRAINTS.md` as your requirements reference."

## Step 5: Update State

Update `.validation/STATE.md`:
- Check `decide` step with today's date
- Set `Current Status` to `COMPLETE`

## Step 6: Display Verdict

Display the full DECISION.md content to the founder.

</process>
```

- [ ] **Step 2: Create decide command**

Write to `commands/val/decide.md`:

```markdown
---
name: val:decide
description: Final BUILD / PIVOT / KILL verdict with specific next steps
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Agent
---

<objective>
Read all validation artifacts and produce the final verdict. BUILD verdicts include
MVP scope, pricing, and first customer recommendations. KILL verdicts always include
alternative angles. BUILD generates CONSTRAINTS.md for optional GSD handoff.
</objective>

<execution_context>
@workflows/decide.md
@workflows/state.md
@workflows/score.md
</execution_context>

<context>
Arguments: $ARGUMENTS (none expected)

Prerequisites:
- Required: .validation/IDEA.md
- Recommended: .validation/SCORECARD.md (will run inline scoring if missing)
</context>

<process>
Follow the decide workflow from @workflows/decide.md end-to-end.

If SCORECARD.md is missing, run inline scoring first via @workflows/score.md.
On BUILD verdict, generate CONSTRAINTS.md and check for GSD installation.
</process>
```

- [ ] **Step 3: Commit**

```bash
git add workflows/decide.md commands/val/decide.md
git commit -m "feat: /val:decide command with verdict, GSD handoff, and CONSTRAINTS.md"
```

- [ ] **Step 4: Verify**

Run: `grep "^name:" commands/val/decide.md`
Expected: `name: val:decide`

---

### Task 17: Quick Pipeline Workflow & Command

**Files:**
- Create: `workflows/quick.md`
- Create: `commands/val/quick.md`

- [ ] **Step 1: Create quick workflow**

Write to `workflows/quick.md`:

```markdown
<purpose>
Run the full validation pipeline in one command: idea → research → score → decide.
Detects existing IDEA.md from /val:reverse and offers to continue.
Pauses only for the initial interview.
</purpose>

<process>

## Step 1: Initialize State

Follow @workflows/state.md to ensure `.validation/STATE.md` exists.
Check for completed validation (multi-idea guard).

## Step 2: Check for Existing IDEA.md

If `.validation/IDEA.md` exists:
- Display: "Found an existing idea: [read one-liner from IDEA.md]"
- Ask: "Continue with this idea, or start fresh? (continue/fresh)"
- If "fresh": delete existing `.validation/` artifacts, re-initialize STATE.md
- If "continue": skip to Step 4

## Step 3: Run Interview (if no IDEA.md)

Display: "Step 1/4: Capturing your idea..."

Follow @workflows/idea.md for the interview.
Wait for completion before proceeding.

## Step 4: Run Research

Display: "Step 2/4: Researching the market (3 agents in parallel)..."

Follow @workflows/research.md for parallel research.
Wait for all agents to complete.

## Step 5: Run Scoring

Display: "Step 3/4: Scoring viability..."

Follow @workflows/score.md for evidence-based scoring.

## Step 6: Run Decision

Display: "Step 4/4: Producing verdict..."

Follow @workflows/decide.md for final verdict.

## Step 7: Summary

Display the final verdict from `.validation/DECISION.md`.

</process>
```

- [ ] **Step 2: Create quick command**

Write to `commands/val/quick.md`:

```markdown
---
name: val:quick
description: Full validation pipeline in one command — idea, research, score, decide
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - WebSearch
  - WebFetch
  - AskUserQuestion
  - Agent
  - mcp__firecrawl__*
---

<objective>
Run the complete validation pipeline: interview → parallel research → scoring → verdict.
One command, full BUILD/PIVOT/KILL decision. Pauses only for the initial interview.

If IDEA.md already exists (from /val:reverse), offers to continue with it.
</objective>

<execution_context>
@workflows/quick.md
@workflows/state.md
@workflows/idea.md
@workflows/research.md
@workflows/score.md
@workflows/decide.md
</execution_context>

<context>
Arguments: $ARGUMENTS (optional — if provided, used as idea one-liner for Question 1)
</context>

<process>
Follow the quick workflow from @workflows/quick.md end-to-end.
This orchestrates idea → research → score → decide in sequence.
</process>
```

- [ ] **Step 3: Commit**

```bash
git add workflows/quick.md commands/val/quick.md
git commit -m "feat: /val:quick compressed full-pipeline command"
```

- [ ] **Step 4: Verify**

Run: `grep "^name:" commands/val/quick.md`
Expected: `name: val:quick`

---

### Task 18: Final Verification

- [ ] **Step 1: Verify all files exist**

Run:
```bash
find . -name "*.md" -not -path "./.git/*" | sort
```

Expected output should include all files from the project structure:
- 7 commands in `commands/val/`
- 5 agents in `agents/`
- 7 templates in `templates/`
- 8 workflows in `workflows/` (state, help, idea, reverse, research, score, decide, quick)
- `CLAUDE.md`, `README.md`, `VERSION`, `LICENSE`

- [ ] **Step 2: Verify command names are unique**

Run:
```bash
grep -r "^name:" commands/ | sort
```

Expected: 7 unique `val:*` names, no duplicates.

- [ ] **Step 3: Verify all agent references in workflows match actual agent files**

Run:
```bash
grep -r "gsr-" workflows/ | grep -o "gsr-[a-z-]*" | sort -u
```

Cross-reference with:
```bash
ls agents/gsr-*.md | sed 's|agents/||;s|\.md||' | sort
```

Both lists should match.

- [ ] **Step 4: Verify all workflow references in commands match actual workflow files**

Run:
```bash
grep -r "@workflows/" commands/ | grep -o "workflows/[a-z-]*\.md" | sort -u
```

Cross-reference with:
```bash
ls workflows/*.md | sort
```

All referenced workflows should exist.

- [ ] **Step 5: Final commit**

```bash
git add -A
git status
```

If any unstaged files remain, add and commit:
```bash
git commit -m "chore: verify project structure completeness"
```
