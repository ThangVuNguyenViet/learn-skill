# learn

A Claude Code skill that learns a browser task after seeing it once, then runs it for you.

Show Claude a task in Chrome ("watch me"), or ask Claude to do it ("do X and remember how"). `/learn` records it, turns each step into the fastest version that still works (a direct request instead of clicks, plain code instead of AI where a rule will do), suggests better ways to do the task, and saves it as a workflow you run by asking in plain words: "do the daily report".

You approve every step table, every suggestion and every save. Nothing that sends, saves or pays runs without asking you first.

## Install

```bash
npx skills add ThangVuNguyenViet/learn-skill
npx skills add openprose/prose
```

You also need:

- macOS with Google Chrome and Node.js 20 or later
- the Claude desktop app (Code tab) or Claude Code
- the [Playwright Extension](https://chromewebstore.google.com/detail/playwright-extension/mmlmfjhmonkocbjadbfplnigmagldckm) in your main Chrome profile

`/learn` walks you through the rest the first time.

## Use

| Say | What happens |
|---|---|
| "watch me do this" | You work in the *Playwright* tab group in Chrome; Claude records it |
| "do X and remember how" | Claude does the task while recording it |
| "save what you just did" | Claude replays a past session's browser steps and learns them |
| "combine my A and B workflows" | A new workflow that reuses both |
| "is there a better way to do this" | Researched suggestions; you pick |
| "what does my X do" | The workflow's steps as a picture and a table |

Learned workflows are saved as `do-<name>` skills in `~/.claude/skills/`.

## Limits

- Browser tasks only. Desktop apps are not supported yet.
- In your own Chrome, only tabs in the *Playwright* tab group are recorded. Ask Claude to open any extra site there.
- Steps that a site protects with signed requests, captchas or file pickers stay as clicks.

## Layout

- `skills/learn/`: the skill (`SKILL.md`, `references/`, `scripts/`)
- `plans/`: design notes and test evidence
