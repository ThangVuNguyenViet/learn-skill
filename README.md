# learn

A Claude Code skill that learns a browser task after seeing it once, then runs it for you.

Show Claude a task in Chrome ("watch me"), or ask Claude to do it ("do X and remember how"). `/learn` records it, turns each step into the fastest version that still works (a direct request instead of clicks, plain code instead of AI where a rule will do), suggests better ways to do the task, and saves it as a workflow you run by asking in plain words: "do the daily report".

You approve every step table, every suggestion and every save. Nothing that sends, saves or pays runs without asking you first.

## Install

Open the Claude desktop app, go to the **Code** tab, and say:

> Install the learn skill from github.com/ThangVuNguyenViet/learn-skill

Then say "watch me" to start. Claude sets up the rest and walks you through the three things only you can do:

- install Node.js if your Mac doesn't have it (it asks for your Mac password)
- click **Add to Chrome** on the [Playwright Extension](https://chromewebstore.google.com/detail/playwright-extension/mmlmfjhmonkocbjadbfplnigmagldckm) in your usual Chrome
- copy the code the extension shows and paste it to Claude once

You need a Mac with Google Chrome.

<details>
<summary>Installing from a terminal</summary>

```bash
npx skills add ThangVuNguyenViet/learn-skill -g -y
npx skills add openprose/prose -g -y
```

</details>

## Use

| Say | What happens |
|---|---|
| "watch me do this" | You work in the *Playwright* tab group in Chrome (drag other tabs in); Claude records it |
| "do X and remember how" | Claude does the task while recording it |
| "save what you just did" | Claude replays a past session's browser steps and learns them |
| "combine my A and B workflows" | A new workflow that reuses both |
| "is there a better way to do this" | Researched suggestions; you pick |
| "what does my X do" | The workflow's steps as a picture and a table |

Learned workflows are saved as `do-<name>` skills in `~/.claude/skills/`.

## Limits

- Browser tasks only. Desktop apps are not supported yet.
- In your own Chrome, only tabs in the *Playwright* tab group are recorded. Links you open from those tabs join it; drag any other tab into the group before using it.
- Steps that a site protects with signed requests, captchas or file pickers stay as clicks.

## Layout

- `skills/learn/`: the skill (`SKILL.md`, `references/`, `scripts/`)
- `plans/`: design notes and test evidence
