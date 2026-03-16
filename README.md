# GetShitRight

**Validate before you build.** Evidence-backed BUILD/PIVOT/KILL decisions for SaaS ideas.

GetShitRight is a free, open-source Claude Code plugin that protects non-technical solo founders from building the wrong thing. It researches your market, scores your idea, and tells you honestly whether to build, pivot, or kill it.

## Install

```bash
claude install get-shit-right
```

Or manually:

```bash
git clone https://github.com/EdenTan26/get-shit-right.git
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

If you use GetShitDone (GSD), a BUILD verdict generates `CONSTRAINTS.md` that GSD can read directly:

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
