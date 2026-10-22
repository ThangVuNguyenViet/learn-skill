# Learn skill

Status: in progress (design settled 2026-10-21; skill drafted; Chrome extension path unverified)

## Outcome

A non-technical person who works only in the Claude desktop app teaches Claude a browser task once. Claude turns it into a reusable workflow skill that does each step the cheapest way that still works, and that person runs it afterwards by asking in plain words.

- Compiler skill: `~/.claude/skills/learn/` (typed as `/learn`) (model-invoked).
- Each compiled workflow: `~/.claude/skills/do-<workflow>/`, a model-invoked skill of its own.

## Decisions

| # | Decision |
|---|---|
| Users | Non-technical, Claude desktop app only. They never see code, a terminal, or words such as API, HAR, trace or token. |
| Modes | A: the person works in Chrome while it is recorded. B: Claude does the task while it is recorded. C: Claude replays the browser steps from a past session's transcript with recording on. |
| Recorder | Playwright CLI 1.64 only (`npx playwright cli`). Attach to the person's Chrome with `attach --extension=chrome` (unverified). Fallback: Playwright's own window with a saved login. No agent-browser, no OpenAdapt in v1. |
| Evidence | `tracing-start`/`tracing-stop` holds every tab's requests with headers and bodies (verified). `requests` covers only the active tab, so it is not used. `recording-start`/`recording-stop` gives the person's actions as code (Mode A). |
| Redaction | `scripts/trace-summary.mjs` is the only way trace content reaches the model. It drops static files and analytics, redacts secret headers, fields and echoed token values (verified on a fake bearer token). |
| Step ladder | Each step ends at the cheapest rung that passes its check: request inside the open page → plain code → Haiku → Sonnet/Opus → click. API steps run as `fetch` inside the person's logged-in page, so no cookie or token is ever exported. |
| Output | An OpenProse `kind: function` package per workflow: `<workflow>.prose.md` (Parameters, Returns, Execution with inline `## step` helpers), TypeScript step scripts, and a thin `SKILL.md` that runs it in a Haiku subagent. |
| Graph | Mermaid in the workflow's `SKILL.md`, drawn from its Execution block. Shown to the person as a picture during the retro. |
| Composition | OpenProse `call` cannot reach another file (`use` takes git hosts only, verified). Workflow C is one file whose inline helpers run A's and B's scripts in place. Before recompiling A or B, the compiler finds the workflows whose files reference A's or B's scripts and regenerates them. |
| Better ways | After compiling and before the retro, Claude names the task's goal, researches the standard practice, searches `find-skills` and connectors, and proposes up to three better ways with what, why and cost. The person says yes or no to each; nothing is installed or changed before a yes. Also reachable as "is there a better way". |
| Naming | Compiler typed as `/learn`; generated workflows are `do-<name>`. One skill with branches (record, compose, improve, explain, retro), not a pack. |
| Retro | Before saving: a plain-language step table, the graph, the inputs it will ask for, and which steps change data; the person approves. After each run: a short note proposing the next saving, or asking to show a changed step again. |
| Verification | Two live runs with different inputs that match the recorded result. Steps that change data are checked up to the point of saving; the person confirms one real save on the first run, and the result is read back. |
| Safety | Steps that save, send or pay ask the person every run. Traces live in the scratchpad and are deleted after compiling. Only sites and accounts the person is allowed to automate. |
| Run files | OpenProse runs write under `~/.claude/workflow-runs/<workflow>/`, out of the person's sight. |
| Style | pstack: SKILL.md under ~80 lines, details in `references/`, Guardrails and "When not to use" sections. |

## Spike evidence (2026-10-21)

- Trace across two tabs and a page change: one network log, every request tagged by tab, 15–17 headers each.
- Trace bodies: form fields, JSON request bodies and JSON responses stored under `traces/resources/`.
- Haiku ran a one-file OpenProse function with two inline helper calls and executed the script both times. Cost: about 100K tokens and 35 seconds, mostly the OpenProse rules it reads before step one.
- Cross-file `call` fails: unknown call target; `use` requires a git host.

## Acceptance criteria

- [ ] Mode B on a real site produces a workflow skill whose read steps run as in-page requests and whose two verification runs match the recording.
- [ ] Mode A records the person's clicks and the network log in their own Chrome (blocked on the extension test).
- [ ] Mode C rebuilds a past session's browser steps and compiles them.
- [ ] A composed workflow calls two existing workflows' scripts and is regenerated when one of them is recompiled.
- [ ] No secret value from a trace appears in any generated file or model-visible output.
- [ ] Every user-facing message from both skills is free of technical words.

## Open

- Playwright Extension (tested 2026-10-22): attaching works with the extension's connection token. It sees only the tabs in its own Chrome tab group. The person's clicks inside the group are recorded as code, and the form submission reached the trace. Tabs opened with ⌘T fall outside the group and are not recorded. Attached traces land under `$TMPDIR/playwright-artifacts-*`. Dragging an existing tab into the group is untested.
- Per-run OpenProse cost (~100K Haiku tokens) is accepted for now; revisit if it becomes a complaint.
