---
name: learn
description: "Use for \"watch me do this\", \"learn this task\", \"do X and remember how\", \"save what you just did as a workflow\", \"combine workflow A and B\", \"is there a better way to do this\", or \"explain / what does my <workflow> do\". Turns a browser task done once into a reusable workflow skill that does each step the cheapest way that works, and proposes better ways to do the task."
---

# Learn

Teach-once for browser tasks. The person shows Claude a task, or Claude does it, while it is recorded; the recording becomes a workflow skill at `~/.claude/skills/do-<workflow>/` that the person later runs by asking in plain words.

The person is non-technical and works only in this app. Speak in their words: steps, pages, "instantly", "I'll ask you first". Technical words (API, request, trace, token, script, model names) stay in files.

The person drives. You record, compile and propose; they approve each step table, each better way, each install and each save.

## Branches

Pick by what the person asked; `/learn <branch>` names one directly.

| Asked | Branch |
|---|---|
| "watch me…" | **record**, person mode |
| "do X and remember how" | **record**, Claude mode |
| "save what you just did" | **record**, replay mode |
| "combine A and B" / a recording repeats an existing workflow | **compose**: [references/compose.md](references/compose.md) |
| "is there a better way" (for a task or an existing workflow) | **improve**: [references/improve.md](references/improve.md) |
| "what does my X do" / "show me X" | **explain**: [references/explain.md](references/explain.md) |
| After any workflow run | **retro**, after-run note: [references/retro.md](references/retro.md) |

## Flow (record)

1. **Set up once.** Follow [references/recording.md](references/recording.md) § Setup. Done when `npx playwright cli --version` prints 1.64 or later and Chrome is attached.
2. **Record.** Follow the mode's section of [references/recording.md](references/recording.md). Done when the trace folder holds a `.network` file and you have the step list.
3. **Summarise the evidence.** `node ~/.claude/skills/learn/scripts/trace-summary.mjs <traces-dir>` is the only way trace content reaches you: it drops noise and redacts secrets. Work from its output alone.
4. **Compile each step.** Follow [references/compiling.md](references/compiling.md). Done when every step has a rung, a check, and a click fallback.
5. **Look for better ways.** Follow [references/improve.md](references/improve.md). Done when you hold up to three researched proposals, or one line saying the recording is already the best shape.
6. **Retro before saving.** Follow [references/retro.md](references/retro.md) § Before saving, with the proposals as its last section. Done when the person has approved the step table and said yes or no to each proposal.
7. **Write the workflow.** Follow [references/workflow-package.md](references/workflow-package.md).
8. **Verify.** Two live runs with different inputs match the recorded result. Steps that change data are checked up to the save; the person confirms one real save on the first run, then read it back. A failed run sends you back to step 4 for that step.
9. **Clean up.** Delete the trace folder. Tell the person the workflow's name and the sentence that runs it.

## Guardrails

- Steps that save, send, pay or delete ask the person every run, in the generated workflow too.
- Credentials stay inside the person's browser. Generated code makes requests from within the open page; it never holds a cookie, token or password.
- Automate only sites and accounts the person is allowed to automate. Stop at a captcha or bot check and leave that step as the person's to do.
- Recompiling a workflow that others build on regenerates them too (see compose).

## When not to use

- Desktop apps outside the browser: say it can't learn those yet.
- A one-off task the person won't repeat: just do it.
- The site has an official connector in this app (Google Sheets, Gmail, Slack): use the connector for that step instead of recording it.
