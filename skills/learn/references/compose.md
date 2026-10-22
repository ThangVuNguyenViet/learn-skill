# Compose

A composed workflow C reuses workflows A and B. OpenProse cannot `call` into another file, so C is one file whose inline step helpers run A's and B's step files where they already live.

## Building C

1. Read A's and B's `.prose.md`. Their Parameters and Returns are the joins: C's Execution passes A's outputs into B's inputs.
2. Copy A's and B's step helpers into C as inline `## a-<step>` / `## b-<step>` sections. Their commands keep pointing at `~/.claude/skills/do-a/steps/...`; the step files are shared, never copied.
3. Add C's own steps, then run the retro and verification as for a new workflow. The graph groups A's and B's steps in one labelled box each.

## Keeping C current

Before recompiling any workflow, find what builds on it:

```bash
grep -l "skills/do-<workflow>/steps/" ~/.claude/skills/do-*/do-*.prose.md | grep -v "/do-<workflow>/"
```

After the recompile, regenerate each match's copied helpers from the new contract and rerun its verification. Tell the person which other workflows were updated.

## Suggesting a compose

When a new recording repeats the steps of an existing workflow, offer: "The first part of this is your *daily report*. Want me to reuse it?"
