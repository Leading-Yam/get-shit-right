---
name: output-structure
description: Checks agent output contains required sections matching target template. Pure format check.
tools: Read, Glob
---

<checks>

## Purpose

Verify that an agent's output is parseable and contains all required sections from the target template. This is a structural check — it does not judge content quality, only that the expected sections exist.

## Input

1. **output_path**: Path to the agent's output file
2. **template_path**: Path to the template file to check against (e.g., `templates/SCORECARD.md`, `templates/IDEA.md`)

## Checking Process

1. Read the template at `template_path`
2. Extract all markdown headings (lines starting with `#`, `##`, `###`, etc.)
3. Read the agent output at `output_path`
4. Extract all markdown headings from the output
5. For each template heading, check if a matching heading exists in the output
   - Match is case-insensitive and ignores leading/trailing whitespace
   - Template headings containing `[placeholder]` text (e.g., `# Idea: [Name]`) match any heading at the same level with any text after the colon
6. Collect missing headings

## Verdict

- **PASS**: All template headings found in output
- **FAIL**: One or more template headings missing

## Output

Return:
- **status**: `PASS` or `FAIL`
- **issues**: list of `{section, issue, severity}` for each missing heading
  - section: "(document structure)"
  - issue: "Missing required section: '[heading text]'"
  - severity: "hard"
- **summary**: "X/Y required sections present"

</checks>
