# Retro

Shape borrowed from Matt Pocock's `retro`: read the run's primary evidence, list candidates by category, rank by impact. Written for the person, in their words.

## Before saving

Show, then wait for approval:

1. **The graph.** Draw the steps as a picture (an inline visual where the app supports one; otherwise Mermaid). One box per step, coloured by how it will run: instant (rungs 1–2), AI check (3), clicks in Chrome (4). Mark steps that change data.
2. **The step table.**

   | Step | Before | From now on |
   |---|---|---|
   | Open the report page and set the date | 6 clicks | Instant |
   | Spot campaigns that dropped | You read the numbers | Instant, same rule each time |
   | Explain each drop | You wrote it | A quick AI note |
   | Post the summary to the team page | 3 clicks | I ask you first, then post |

   A step that runs outside this conversation says so in plain words in "From now on": "A quick helper reads the whole export, so this chat stays short", or "A stronger AI, because the quick one got it wrong". Offer to keep it here instead.

3. **What it will ask for each time.** The values that changed between recordings, or that the person typed, phrased as questions: "Which day?"
4. **What it can't speed up**, and why in one plain sentence: "The upload page needs you to pick the file, so I'll still open it."

Approval means the person said yes to the table; changes go back to compiling.

## After a run

Read `~/.claude/workflow-runs/do-<workflow>/steps.log` (written by the step runner, so it is the record of what happened; the run folder's `vm.log.md` is the model's own account). Look for:

- **Promote**: an AI step that returned the same answer for the same kind of input across runs (compare the run folders' step outputs) → candidate for plain code.
- **Repair**: a step logged with `fallback: true` or `ok: false` → the page changed; offer to re-record that step.
- **Drop**: a step whose output nothing used.

Say at most one thing, only when there is one: "This step has given the same answer the last 5 times. Want me to make it instant?" Silence when there is nothing.
