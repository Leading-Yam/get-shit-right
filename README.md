<p align="center">
  <img src="GetShitRight_image.jpg" alt="GetShitRight — Because 'Done' is just the beginning. 'Right' is the destination." width="700">
</p>

<h1 align="center">GetShitRight</h1>

<p align="center">
  <strong>Stop building things nobody wants.</strong><br>
  Evidence-backed BUILD / PIVOT / KILL decisions for SaaS ideas.<br>
  Free. Open source. Brutally honest.
</p>

<p align="center">
  <em>Inspired by <a href="https://github.com/get-shit-done">GetShitDone (GSD)</a> — which helps you build things right.<br>
  GetShitRight makes sure you're building the <strong>right thing</strong> in the first place.</em>
</p>

---

## The Problem

If you're a non-technical solo founder in 2026, you can vibe-code a full SaaS app in a weekend. Claude Code, Cursor, Replit — the tools are incredible.

Which means you can now waste a weekend building something nobody wants *faster than ever before*.

Here's how most "brilliant" ideas go:

1. Get excited about an idea at 2am
2. Spend 3 weeks building it
3. Launch to... crickets
4. Google the idea properly for the first time
5. Find 14 competitors who do it better
6. Question life choices

The problem was never the building. The problem is building the **wrong thing**.

GetShitRight is a free Claude Code plugin that forces you to validate before you code. Think of it as a brutally honest co-founder who does the market research you keep skipping.

## Install

```bash
npx get-shit-right-cc
```

Then:

```
/val:quick
```

One command. Full validation pipeline. No excuses.

## What Happens When You Run It

**1. It interviews you** (6 questions max — it respects your time, even if it won't respect your feelings)

```
/val:idea
```

Captures your idea, target customer, and riskiest assumptions. Don't know the answer? Say "Surprise me" and it'll make a smart assumption instead of blocking you.

**2. It researches your market** with 3 parallel AI agents

```
/val:research
```

- **Pain validation** — Reddit, HN, Indie Hackers, Twitter/X
- **Competitive landscape** — pricing, features, negative reviews
- **Market sizing** — TAM/SAM/SOM with methodology

**3. It scores your idea honestly**

```
/val:score
```

7 dimensions, each 1-5. Default-kill philosophy: you need **25+/35** to earn a BUILD. Score a 1/5 on Pain Intensity or Willingness to Pay? Automatic KILL. No appeals court.

**4. It delivers a verdict**

```
/val:decide
```

**BUILD**, **PIVOT**, or **KILL** — with specific next steps for each.

KILL verdicts always include alternative angles worth exploring. You're redirected, not stopped.

## All Commands

| Command | What It Does |
|---------|-------------|
| `/val:idea` | Interview to capture & structure your idea |
| `/val:reverse` | Reverse engineer a competitor to find spin-off angles |
| `/val:skew` | Analyze value delivery to find 10x skew opportunities |
| `/val:research` | Parallel market research (pain, competitors, market size) |
| `/val:score` | Evidence-based viability scorecard |
| `/val:decide` | Final BUILD / PIVOT / KILL verdict |
| `/val:quick` | Full pipeline in one command |
| `/val:help` | Usage guide & current progress |
| `/val:update` | Update to the latest version |
| `/val:reapply-patches` | Recover files backed up during updates |

### Start from a competitor instead

```
/val:reverse "Calendly"
```

Deep-dive a competitor's weaknesses and find underserved angles. Pick a spin-off direction and validate it.

## Better Research (Optional)

GetShitRight works out of the box with built-in web search. For deeper competitor
analysis and more reliable content extraction, install Firecrawl:

1. Get a free API key at https://firecrawl.dev (no credit card required)
2. Run: `claude mcp add firecrawl`

Works without it. Better with it.

## GSD Integration

Inspired by [GetShitDone (GSD)](https://github.com/get-shit-done) — the planning and execution engine for Claude Code. If you use GSD, a BUILD verdict generates `CONSTRAINTS.md` that GSD reads directly:

```
/val:decide  →  .validation/CONSTRAINTS.md  →  /gsd:new-project
```

**GetShitRight validates. GetShitDone builds.** No manual copy-paste between them.

## Philosophy

- **Default-kill** — BUILD is hard to earn. Most ideas should get KILL or PIVOT. That's not pessimism, that's math.
- **Evidence over opinion** — every score cites sources. No hand-wavy "this looks promising."
- **Surprise me** — don't know the answer? Say so. You get smart defaults, not blockers.
- **Always an alternative** — KILL verdicts include spin-off angles. The idea dies, not your ambition.

## Who This Is For

- Solo founders who are tired of building first and asking questions never
- Non-technical vibe-coders who can now ship fast (maybe too fast)
- Anyone who's ever said "I'll validate later" and never did

## Who This Is NOT For

- People who enjoy spending 3 months on ideas that could've been killed in 3 minutes
- Your ego

---

<p align="center">
  <em>Because 'Done' is just the beginning. 'Right' is the destination.</em>
</p>

## Uninstall

1. Remove hook entries containing `gsr-` from `~/.claude/settings.json`
2. Delete `~/.claude/get-shit-right/`
3. Delete `~/.claude/cache/gsr-update-check.json`

## License

MIT
