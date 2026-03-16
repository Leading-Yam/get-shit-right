# DONE RIGHT — GSD Companion Workflows

## The Pitch (One Line)

**GSD builds the thing. DONE RIGHT makes sure you build the *right* thing — and that it actually works when real people pay for it.**

---

## Project Identity

- **Name:** `done-right` (working title — candidates: `ship-ready`, `no-excuses`, `before-after`)
- **Repo:** Separate from GSD. Independent install. Designed to handshake with GSD's `.planning/` artifacts.
- **Philosophy:** Inherit GSD's core ethos — "the complexity is in the system, not in your workflow." No enterprise roleplay. Few commands. Subagent orchestration hidden. Opinionated defaults.
- **Target User:** Non-technical solo founders who use GSD (or similar) to build, but skip everything before and after the code.
- **License:** MIT (matching GSD)

---

## Problem Statement

GSD solves the hardest technical problem for non-technical founders: turning an idea into working code. But the founder lifecycle has three phases, not one:

```
[BEFORE]          [BUILD]           [AFTER]
Validate idea  →  Write code     →  Go live
Research market    Test & verify     Monitor & operate
Score viability    Ship features     Handle billing
Kill bad ideas     Deploy            Legal compliance
```

**GSD owns BUILD.** Nobody owns BEFORE or AFTER.

The result: founders build fast, ship broken, skip validation, ignore operations, and wonder why they have users but no revenue — or worse, revenue but no idea if it's leaking.

DONE RIGHT fills the gap with two orchestrated workflow systems:

1. **`/val`** — The Validate workflow (BEFORE)
2. **`/ops`** — The Launch-Ops workflow (AFTER)

---

## Architecture Overview

### Design Principles

1. **Mirror GSD's patterns** — `.validation/` and `.ops/` directories (like `.planning/`), markdown state files, subagent orchestration, atomic operations
2. **Handshake with GSD** — `/val` outputs feed into `/gsd:new-project`. `/ops` reads GSD's `.planning/` and the codebase.
3. **Claude Code native** — Commands, agents, skills. No external dependencies beyond what Claude Code provides. Web search via Claude's built-in capabilities.
4. **Opinionated defaults** — Don't ask the founder 50 questions. Make smart assumptions, state them clearly, let them override.
5. **Evidence over opinion** — Every recommendation cites sources. Every score shows its work. No hand-wavy "this looks promising."

### Directory Structure

```
done-right/
├── bin/
│   └── install.js                    # Installer (global/local, like GSD)
├── commands/
│   ├── val-idea.md                   # /val:idea
│   ├── val-research.md               # /val:research
│   ├── val-score.md                  # /val:score
│   ├── val-decide.md                 # /val:decide
│   ├── val-quick.md                  # /val:quick (compressed single-command flow)
│   ├── ops-scan.md                   # /ops:scan
│   ├── ops-infra.md                  # /ops:infra
│   ├── ops-legal.md                  # /ops:legal
│   ├── ops-billing.md                # /ops:billing
│   ├── ops-monitor.md                # /ops:monitor
│   ├── ops-launch.md                 # /ops:launch
│   ├── ops-quick.md                  # /ops:quick (compressed single-command flow)
│   └── dr-help.md                    # /dr:help
├── agents/
│   ├── val-interviewer.md            # Extracts and structures the idea
│   ├── val-researcher.md             # Web research subagent
│   ├── val-competitor-analyst.md     # Competitive landscape analysis
│   ├── val-market-sizer.md           # TAM/SAM/SOM estimation
│   ├── val-judge.md                  # Produces scorecard and verdict
│   ├── ops-scanner.md                # Codebase + stack analysis
│   ├── ops-infra-agent.md            # Error tracking, analytics, email
│   ├── ops-legal-agent.md            # Privacy policy, ToS, cookie consent
│   ├── ops-billing-agent.md          # Stripe integration + testing
│   ├── ops-monitor-agent.md          # Health checks, uptime, alerting
│   └── ops-launch-coordinator.md     # Final checklist + launch prep
├── skills/
│   ├── validation-frameworks/        # Lean Canvas, Riskiest Assumption
│   │   └── SKILL.md
│   ├── competitor-analysis/          # G2/Capterra/Reddit research patterns
│   │   └── SKILL.md
│   ├── stack-detection/              # Detect tech stack from codebase
│   │   └── SKILL.md
│   ├── stripe-integration/           # Stripe setup patterns by framework
│   │   └── SKILL.md
│   ├── monitoring-setup/             # Sentry/PostHog/Plausible patterns
│   │   └── SKILL.md
│   └── legal-templates/              # Privacy/ToS generation logic
│       └── SKILL.md
├── templates/
│   ├── RESEARCH.md                   # Research output template
│   ├── SCORECARD.md                  # Validation scorecard template
│   ├── DECISION.md                   # Build/Pivot/Kill template
│   ├── LAUNCH-CHECKLIST.md           # Launch checklist template
│   └── CONSTRAINTS.md               # Constraints file (feeds GSD)
├── CLAUDE.md                         # Project rules for Claude Code
└── README.md
```

### State Management

#### Validation State (`.validation/`)

```
.validation/
├── IDEA.md                 # Structured idea description
├── RESEARCH.md             # Market research findings
├── COMPETITORS.md          # Competitive analysis
├── SCORECARD.md            # Viability score with evidence
├── DECISION.md             # Build / Pivot / Kill verdict
├── CONSTRAINTS.md          # → Feeds into GSD's /gsd:new-project
└── STATE.md                # Workflow state tracker
```

#### Ops State (`.ops/`)

```
.ops/
├── STACK-PROFILE.md        # Detected tech stack + framework
├── LAUNCH-CHECKLIST.md     # Categorized checklist (critical/important/nice)
├── INFRA-STATUS.md         # What's been set up, what's pending
├── LEGAL-STATUS.md         # Generated legal docs tracker
├── BILLING-STATUS.md       # Stripe integration status
├── MONITOR-STATUS.md       # Monitoring setup status
└── STATE.md                # Workflow state tracker
```

---

## WORKFLOW 1: `/val` — Validate

### Purpose
Take a raw idea and produce an evidence-backed Build/Pivot/Kill decision before any code is written.

### Commands

#### `/val:idea` — Capture & Structure the Idea

**What it does:** Interviews the founder using Claude's interactive questioning. Extracts the core hypothesis, target customer, pain point, and initial assumptions. Produces `IDEA.md`.

**Interview questions (max 6, adaptive):**
1. What does this product do in one sentence?
2. Who specifically has this problem? (job title, company size, context)
3. What do they do today to solve it? (current alternative)
4. Why would they switch to your thing? (switching trigger)
5. How would you charge for it? (pricing intuition)
6. What's the one thing that must be true for this to work? (riskiest assumption)

**Output: `.validation/IDEA.md`**
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
[Founder's initial pricing thought]
```

**Agent:** `val-interviewer`
- Uses AskUserQuestion tool for structured input
- Keeps interview under 3 minutes
- Explicitly names assumptions the founder didn't state

---

#### `/val:research` — Automated Market Research

**What it does:** Spawns parallel subagents to research the idea from three angles. Produces `RESEARCH.md` and `COMPETITORS.md`.

**Subagent 1: `val-researcher` (Pain Validation)**
- Searches Reddit (target subreddits), Indie Hackers, HN for people describing the pain
- Searches Twitter/X for complaints about current solutions
- Counts frequency and intensity of pain mentions
- Extracts direct quotes (anonymized)
- Produces pain validation section with evidence

**Subagent 2: `val-competitor-analyst` (Competitive Landscape)**
- Identifies direct competitors via web search
- Checks G2/Capterra for review themes
- Maps competitor pricing tiers
- Identifies gaps in competitor offerings (from negative reviews)
- Produces competitive matrix

**Subagent 3: `val-market-sizer` (Market Estimation)**
- Estimates TAM from public data (industry reports, census data, LinkedIn job counts)
- Calculates SAM based on target segment
- Projects SOM based on realistic capture rate
- Cross-references with similar SaaS company revenue data
- All estimates show methodology and sources

**Output: `.validation/RESEARCH.md`**
```markdown
# Market Research: [Idea Name]

## Pain Validation
- **Signal Strength:** [Strong / Moderate / Weak]
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
- **Data Sources:** [list]

## Research Gaps
- [What we couldn't find / verify]
- [Assumptions that remain unvalidated]
```

**Output: `.validation/COMPETITORS.md`**
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

---

#### `/val:score` — Evidence-Based Scorecard

**What it does:** Reads IDEA.md and RESEARCH.md, produces a structured viability scorecard. Every score has evidence. No vibes.

**Agent:** `val-judge`

**Scoring Dimensions (each 1-5 with evidence):**

| Dimension | What It Measures |
|-----------|-----------------|
| **Pain Intensity** | How badly do people need this? (from research quotes + frequency) |
| **Willingness to Pay** | Evidence of spending on alternatives or stated willingness |
| **Competition Density** | How crowded is the space? (inverse: less competition = higher score) |
| **Differentiation Clarity** | Can you articulate why you're different in one sentence? |
| **Founder-Market Fit** | Does the founder understand this market? (from interview signals) |
| **Build Complexity** | Can this be MVP'd in <4 weeks with GSD? |
| **Distribution Clarity** | Is there an obvious channel to reach customers? |

**Output: `.validation/SCORECARD.md`**
```markdown
# Validation Scorecard: [Idea Name]

## Overall Score: [X]/35 — [STRONG / MODERATE / WEAK / KILL]

| Dimension | Score | Evidence |
|-----------|-------|----------|
| Pain Intensity | 4/5 | 23 Reddit threads, avg 47 upvotes on pain posts |
| Willingness to Pay | 3/5 | Competitors charge $29-99/mo; 2 threads mention paying for solution |
| Competition Density | 2/5 | 6 direct competitors, market feels crowded |
| Differentiation | 4/5 | No competitor targets [segment] specifically |
| Founder-Market Fit | 3/5 | Founder has domain experience but no existing audience |
| Build Complexity | 5/5 | Standard CRUD + API integrations, GSD-friendly |
| Distribution | 3/5 | Target hangs out in 3 identifiable subreddits + LinkedIn |

## Red Flags
- [Flag 1: specific concern with evidence]
- [Flag 2: specific concern with evidence]

## Bright Spots
- [Spot 1: specific positive signal]
- [Spot 2: specific positive signal]

## Unvalidated Assumptions
- [Assumption that research couldn't confirm or deny]
```

---

#### `/val:decide` — Build / Pivot / Kill

**What it does:** Reads everything, produces a final decision with clear reasoning.

**Output: `.validation/DECISION.md`**
```markdown
# Decision: [BUILD / PIVOT / KILL]

## Verdict
[2-3 sentence summary of why]

## If BUILD:
### Recommended MVP Scope
- [Core feature 1 — the one thing that tests the riskiest assumption]
- [Core feature 2]
- [Explicitly NOT in MVP: feature X, feature Y]

### Recommended First Customer
[Specific segment + where to find them]

### Pricing Recommendation
[$X/mo based on competitive analysis and willingness-to-pay signals]

### Validation Milestones (before scaling)
1. [X paying customers in Y weeks]
2. [Z% retention after first month]
3. [Specific signal that confirms riskiest assumption]

## If PIVOT:
### What to change
[Specific pivot direction with reasoning]

## If KILL:
### Why
[Honest, specific reasons]
### Where the energy should go instead
[Alternative direction if any emerged from research]
```

**GSD Handoff:** If BUILD, also generates `.validation/CONSTRAINTS.md` — a structured file that `/gsd:new-project` can reference:

```markdown
# Project Constraints (from Validation)

## Must-Have Requirements
- [From validation: core features only]

## Must-NOT-Have (Scope Fence)
- [Features explicitly excluded from MVP]

## Target User
- [From IDEA.md, refined by research]

## Competitive Context
- [Key differentiators to maintain]

## Success Criteria
- [From DECISION.md validation milestones]
```

---

#### `/val:quick` — Compressed Single-Command Flow

For when you want the full pipeline without running 4 separate commands. Runs idea → research → score → decide in sequence, pausing only for the initial interview.

---

## WORKFLOW 2: `/ops` — Launch-Ops

### Purpose
Take a deployed codebase and make it production-ready from a business operations standpoint.

### Commands

#### `/ops:scan` — Stack Detection & Gap Analysis

**What it does:** Reads the codebase (and `.planning/` if GSD was used). Detects the tech stack, framework, hosting platform, database, auth system, and payment integration status. Produces a prioritized launch checklist.

**Agent:** `ops-scanner`

**Detection targets:**
- Framework: Next.js / Nuxt / SvelteKit / Rails / Django / Laravel / etc.
- Hosting: Vercel / Netlify / Railway / Fly.io / AWS / etc.
- Database: Postgres / MySQL / SQLite / Supabase / PlanetScale / etc.
- Auth: NextAuth / Clerk / Supabase Auth / Auth0 / custom / etc.
- Payments: Stripe / Lemon Squeezy / Paddle / none
- Email: Resend / Postmark / SendGrid / none
- Monitoring: Sentry / none
- Analytics: PostHog / Plausible / GA / none

**Output: `.ops/STACK-PROFILE.md`**
```markdown
# Stack Profile

## Detected Stack
- **Framework:** Next.js 14 (App Router)
- **Hosting:** Vercel
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Payments:** Stripe (partial — webhook handler missing)
- **Email:** None detected
- **Monitoring:** None detected
- **Analytics:** None detected

## Framework-Specific Notes
- [Relevant gotchas for this stack combination]
```

**Output: `.ops/LAUNCH-CHECKLIST.md`**
```markdown
# Launch Checklist

## 🔴 CRITICAL (Blocks Launch)
- [ ] Error monitoring — no Sentry or equivalent detected
- [ ] Stripe webhook handler — payment events will be lost
- [ ] Environment variables — .env.example missing 3 production keys
- [ ] HTTPS — verify SSL certificate auto-renewal

## 🟡 IMPORTANT (First Week)
- [ ] Transactional email — no email provider configured
- [ ] Analytics — no usage tracking
- [ ] Backup strategy — no database backup configured
- [ ] Rate limiting — API endpoints unprotected

## 🟢 NICE-TO-HAVE (First Month)
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Cookie consent banner
- [ ] Custom error pages (404, 500)
- [ ] OpenGraph meta tags for social sharing
- [ ] Favicon and PWA manifest
```

---

#### `/ops:infra` — Infrastructure Setup

**What it does:** Reads STACK-PROFILE.md, then spawns subagents to set up missing infrastructure. Each subagent generates actual integration code, verifies it compiles/runs, and commits.

**Sub-tasks (each a subagent):**

**Error Monitoring:**
- Generates Sentry config for detected framework
- Adds error boundary / global error handler
- Configures source maps upload
- Verifies by triggering a test error

**Analytics:**
- Sets up PostHog or Plausible (based on stack)
- Adds page view tracking
- Adds custom event helpers
- Verifies tracking fires on test page load

**Transactional Email:**
- Configures Resend (preferred) or Postmark
- Creates email templates: welcome, password reset, receipt
- Adds send helpers to the codebase
- Verifies with test email send

Each subagent follows GSD's verify pattern: implement → verify → commit.

---

#### `/ops:legal` — Legal Document Generation

**What it does:** Reads the codebase to understand data practices, then generates tailored legal pages.

**Agent:** `ops-legal-agent`

**Analysis (from codebase):**
- What user data is collected (from schema + forms)
- What third-party services process data (from env vars + imports)
- What cookies are set (from auth + analytics setup)
- Where data is stored (from database config)
- Whether data crosses borders (from hosting region)

**Generates:**
- `privacy-policy.md` — Tailored to actual data practices
- `terms-of-service.md` — Tailored to the product type
- `cookie-policy.md` — Lists actual cookies used

**Adds to codebase:**
- Legal pages route/component
- Cookie consent banner (if cookies detected)
- Footer links

**IMPORTANT CAVEAT:** Generated with clear disclaimer: "This is a starting template based on your detected data practices. Have a lawyer review before launch." The agent should be explicit about this limitation.

---

#### `/ops:billing` — Stripe Integration Hardening

**What it does:** If Stripe is detected, audits and hardens the integration. If not detected, scaffolds it.

**Agent:** `ops-billing-agent`

**Audit checks (if Stripe exists):**
- Webhook handler exists and covers: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Webhook signature verification is implemented
- Customer portal redirect is configured
- Subscription status is synced to database
- Failed payment handling exists
- Trial expiry handling exists (if applicable)

**Setup (if Stripe missing):**
- Creates checkout session endpoint
- Creates webhook handler with signature verification
- Creates customer portal redirect
- Adds subscription status to user model
- Creates billing helper utilities

**Verification:**
- Configures Stripe CLI for local webhook testing
- Runs through checkout → webhook → status update flow in test mode
- Verifies failed payment webhook handling
- Reports pass/fail for each billing scenario

---

#### `/ops:monitor` — Monitoring & Alerting

**What it does:** Sets up production monitoring appropriate to the stack.

**Agent:** `ops-monitor-agent`

**Creates:**
- Health check endpoint (`/api/health`) — checks DB, external services
- Uptime monitoring config (for BetterUptime, UptimeRobot, or similar)
- Basic alerting rules (error rate spike, response time degradation)
- Runbook: `.ops/RUNBOOK.md` with common failure scenarios and fixes

**Runbook format:**
```markdown
# Production Runbook

## Scenario: Database Connection Errors
**Symptoms:** 500 errors on all authenticated routes
**Check:** [specific command to verify DB status]
**Fix:** [specific steps for this hosting provider]
**Escalation:** [when to contact hosting support]

## Scenario: Stripe Webhook Failures
**Symptoms:** Payments succeed but subscription status doesn't update
**Check:** Stripe Dashboard → Webhooks → Recent events
**Fix:** [steps to replay failed events]
```

---

#### `/ops:launch` — Launch Readiness Check

**What it does:** Final verification. Reads all `.ops/` status files, runs through checklist, produces launch-ready report.

**Agent:** `ops-launch-coordinator`

**Actions:**
1. Re-runs `/ops:scan` to verify checklist items are resolved
2. Runs lighthouse audit on key pages
3. Checks SSL certificate validity
4. Verifies all environment variables are set in production
5. Tests critical user flows (signup → checkout → dashboard)
6. Generates launch report

**Output: `.ops/LAUNCH-REPORT.md`**
```markdown
# Launch Readiness Report

## Status: [READY / BLOCKED / NEEDS ATTENTION]

## Checklist Summary
- Critical: [X/Y complete]
- Important: [X/Y complete]
- Nice-to-have: [X/Y complete]

## Blocking Issues
- [Issue 1 — what's wrong and how to fix]

## Performance Baseline
- Lighthouse Score: [X]
- TTFB: [X ms]
- LCP: [X ms]

## Recommended Launch Sequence
1. [ ] Final production environment check
2. [ ] DNS propagation verification
3. [ ] Smoke test critical flows
4. [ ] Remove maintenance mode / go live
5. [ ] Post launch announcement to [channel]
6. [ ] Monitor error rate for first 2 hours
```

#### `/ops:quick` — Compressed Single-Command Flow

Runs scan → infra → billing → legal → monitor → launch in sequence, pausing only when user input is needed.

---

## GSD Integration Points

### `/val` → GSD Handoff

When `/val:decide` produces a BUILD verdict:

```
.validation/CONSTRAINTS.md  →  Referenced by /gsd:new-project discussion phase
.validation/COMPETITORS.md  →  Available context for GSD's research agent
.validation/SCORECARD.md    →  Referenced by GSD's requirements scoping
```

The CONSTRAINTS.md file is structured so GSD's interviewer agent can read it and skip redundant questions. The founder shouldn't have to re-explain their idea.

### GSD → `/ops` Handoff

When GSD completes a milestone:

```
.planning/ROADMAP.md        →  /ops:scan reads for context
.planning/REQUIREMENTS.md   →  /ops:legal reads for data practice analysis
src/ (actual codebase)      →  /ops:scan detects stack
package.json / Gemfile etc  →  /ops:scan detects dependencies
```

### Lifecycle Flow

```
/val:idea → /val:research → /val:score → /val:decide
                                              │
                                        [BUILD verdict]
                                              │
                                    /gsd:new-project (reads CONSTRAINTS.md)
                                              │
                                    /gsd:execute (builds the thing)
                                              │
                                    /ops:scan → /ops:infra → /ops:billing
                                              │
                                    /ops:legal → /ops:monitor → /ops:launch
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
- Repo setup, installer, CLAUDE.md
- `/val:idea` command + `val-interviewer` agent
- `/val:research` command + `val-researcher` agent (pain validation only)
- State management (`.validation/STATE.md`)
- Basic `/dr:help` command

### Phase 2: Full Validation Pipeline (Week 2)
- `val-competitor-analyst` agent
- `val-market-sizer` agent
- `/val:score` command + `val-judge` agent
- `/val:decide` command + GSD CONSTRAINTS.md output
- `/val:quick` compressed flow

### Phase 3: Ops Scanner (Week 3)
- `/ops:scan` command + `ops-scanner` agent
- `stack-detection` skill (framework/hosting/DB detection patterns)
- LAUNCH-CHECKLIST.md generation
- STACK-PROFILE.md generation

### Phase 4: Ops Infrastructure (Week 4)
- `/ops:infra` command + `ops-infra-agent`
- Sentry integration patterns (per framework)
- Analytics setup patterns
- Email provider setup patterns

### Phase 5: Ops Billing & Legal (Week 5)
- `/ops:billing` command + `ops-billing-agent`
- `/ops:legal` command + `ops-legal-agent`
- Stripe integration skill
- Legal template generation

### Phase 6: Ops Launch (Week 6)
- `/ops:monitor` command + `ops-monitor-agent`
- `/ops:launch` command + `ops-launch-coordinator`
- `/ops:quick` compressed flow
- End-to-end testing of full lifecycle

---

## Open Questions & Risks

### Technical Risks
1. **Web research reliability** — Claude's web search results vary. The val-researcher agent needs fallback strategies when searches return low-quality results.
2. **Stack detection accuracy** — Monorepos and unconventional project structures may confuse the scanner. Need progressive detection with confidence scores.
3. **Stripe test mode automation** — Requires Stripe CLI to be installed. Need graceful degradation if it's not available.

### Design Risks
1. **Scope creep** — The "everything you skip" framing invites infinite feature additions. The Phase 1-6 plan is the scope fence. Respect it.
2. **Over-automation of legal** — Generated legal docs need very clear disclaimers. We're generating starting points, not legal advice. This must be prominent.
3. **GSD coupling** — DONE RIGHT should work standalone (founder might not use GSD). The GSD integration should be a bonus, not a requirement.

### Questions for You
1. Should `/val:research` support manual input too? (e.g., "I already interviewed 10 people, here are quotes")
2. For `/ops:billing`, should we support Lemon Squeezy / Paddle as alternatives to Stripe?
3. How aggressive should `/val:judge` be? Should it actively try to kill ideas (high bar) or be balanced?
4. Do you want a `/dr:status` command that shows where you are in the full validate→build→launch lifecycle?

---

## Competitive Landscape (for this project itself)

| Project | What It Does | Gap DONE RIGHT Fills |
|---------|-------------|----------------------|
| GSD | Spec-driven development | No validation, no ops |
| claude-code-workflows | Dev workflows (implement, test, review) | Dev-only, no business ops |
| ruflo | Multi-agent orchestration platform | General purpose, not founder-focused |
| wshobson/agents | 112 agents, 72 plugins | Kitchen sink, no opinionated workflow |
| BMAD | Agile workflow | Enterprise-flavored, not solo founder |

**DONE RIGHT's differentiation:** It's the only project that addresses the non-coding parts of the SaaS founder lifecycle with the same opinionated, subagent-orchestrated simplicity that GSD brought to coding.

---

## Success Metrics

For the open-source project itself:
- **Adoption:** GitHub stars (vanity but signals resonance), forks, issues
- **Usage signal:** Do people actually run `/val:decide` and get KILL verdicts? (proves the system works — it should kill bad ideas)
- **GSD community pickup:** Does the GSD Discord/community reference DONE RIGHT?
- **Founder testimonials:** "DONE RIGHT saved me from building X" is the ideal quote

For founders using it:
- **Validation hit rate:** % of BUILD verdicts that lead to >$1K MRR within 3 months
- **Launch time reduction:** Time from "code complete" to "accepting payments" drops from weeks to hours
- **Zero-downtime launches:** Ops workflow catches issues pre-launch that would have caused outages
