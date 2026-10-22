# Workflow package

Read `~/.claude/skills/open-prose/contract-markdown.md` § Functions and `prosescript.md` § Calls, Sessions, Errors before writing the first package of a session.

## Layout

```
~/.claude/skills/do-<workflow>/
├── SKILL.md                 # how the person asks for it; runs the contract
├── do-<workflow>.prose.md   # kind: function: inputs, outputs, step order
└── steps/                   # browser step files (.js) and code steps (.ts)
```

Run state goes to `~/.claude/workflow-runs/do-<workflow>/`: the OpenProse root, the browser profile, and `steps.log` (one line per step run, written by `run-step.mjs`).

Every run opens and closes its browser session with `node ~/.claude/skills/learn/scripts/browser.mjs do-<workflow> start <start-url>` and `… stop`: it attaches to the person's Chrome, or opens the workflow's own signed-in window.

## The contract

One file. The top function is the workflow; every step is an inline `## <step>` helper the Execution block `call`s. OpenProse cannot `call` into another file, so composed workflows also keep everything in one file (see compose.md).

````markdown
---
name: do-daily-report
kind: function
---

# Daily campaign report

### Parameters

- `date`: the day to report on

### Returns

- `report`: the campaigns that dropped, each with the reason

### Execution

```prose
call open-browser

let metrics = call fetch-metrics
  date: date

call close-browser

let drops = call find-drops
  metrics: metrics

let report = call explain-drops
  drops: drops

return report
```

## open-browser

### Returns

- `mode`: `attached` or `own-window`, as printed

### Strategies

- run `node ~/.claude/skills/learn/scripts/browser.mjs do-daily-report start https://ads.example.com/` and return its output

## close-browser

### Strategies

- run `node ~/.claude/skills/learn/scripts/browser.mjs do-daily-report stop`

## fetch-metrics

### Parameters

- `date`: the day to fetch

### Returns

- `metrics`: the JSON printed by the step

### Tools

- `cli:node`: runs the step

### Strategies

- run `node ~/.claude/skills/learn/scripts/run-step.mjs do-daily-report ~/.claude/skills/do-daily-report/steps/fetch-metrics.js '{"date":"<date>"}'` and return its output unchanged
- when the command exits non-zero, run `steps/fetch-metrics.click.js` the same way and tell the person the page changed

## explain-drops

### Parameters

- `drops`: the campaigns that dropped, with their numbers

### Returns

- `report`: each campaign with one sentence on why its numbers dropped

### Strategies

- write one sentence per campaign from the numbers given; invent nothing they do not show
````

Rules:
- Step helpers run commands and return their output unchanged; the model writes nothing a step can compute.
- No `model:` hints, `agent` or `session` blocks: every step runs inline on the person's model (see compiling.md). The one exception is a `parallel` block.
- A step that saves, sends, pays or deletes starts with "ask the person to confirm, showing what will be sent" in its Strategies.
- Use `try` / `catch` in Execution when a fallback must run a different step, not just a different file.

## SKILL.md

```markdown
---
name: do-daily-report
description: "Use for \"daily report\", \"campaign report for <day>\". Builds the daily campaign report."
---

Run the workflow here, in this conversation: read `~/.claude/skills/open-prose/SKILL.md` and execute
`prose run ~/.claude/skills/do-daily-report/do-daily-report.prose.md` with the OpenProse root
`~/.claude/workflow-runs/do-daily-report/`. Run every `call` inline, without a subagent; start a session
only for the steps of a `parallel` block. Ask the person for any input they didn't give.
Afterwards, follow `~/.claude/skills/learn/references/retro.md` § After a run.

<mermaid graph of the steps>
```

Keep the trigger phrases in the person's own words for the task.
