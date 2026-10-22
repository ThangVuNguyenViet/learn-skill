# Explain

The person asks what a workflow does, or which workflows they have.

- **Which workflows?** List `~/.claude/skills/do-*/`: for each, its name in plain words and the sentence that runs it.
- **What does X do?** Read `do-<x>.prose.md` and show the retro's graph and step table for the current version, plus what it asks for each time and which steps ask before changing anything. Add when it last ran and whether it needed clicks, from `~/.claude/workflow-runs/do-<x>/steps.log`.
- **Why did X stop / do something odd?** Read the last lines of `steps.log` and that run's step outputs, then say what happened in one or two sentences and offer the fix (usually re-recording one step).

Answer from the files. When a file and the person's memory disagree, show the file's version.
