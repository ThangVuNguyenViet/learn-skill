# Recording

`pw` below means `npx -y playwright@1.64.1 cli -s=<session> … 2>&1 | sed -E 's/token=[A-Za-z0-9_-]+/token=[redacted]/g'`: attached sessions print the extension's connection URL, token included. Use one session name per recording (`learn-<workflow>`), and run every command from a fresh scratchpad folder: the CLI writes `.playwright-cli/` (snapshots) into the current folder.

## Setup

Once per computer:

1. `node --version` prints 20 or later. If not, ask the person to install Node from nodejs.org and walk them through it.
2. `npx -y playwright@1.64.1 cli install-browser chrome`.
3. The person adds **Playwright Extension** to their main Chrome profile from https://chromewebstore.google.com/detail/playwright-extension/mmlmfjhmonkocbjadbfplnigmagldckm. Walk them through it; you cannot install it for them. Check: `~/Library/Application Support/Google/Chrome/Default/Extensions/mmlmfjhmonkocbjadbfplnigmagldckm` exists.
4. The extension shows a connection token. Ask the person to paste it, then save it with `umask 077; printf '%s' '<token>' > ~/.claude/workflow-runs/.extension-token` and repeat it nowhere. `browser.mjs` loads it as `PLAYWRIGHT_MCP_EXTENSION_TOKEN`; without it, attaching hangs on the extension's connect page.

Attach with `node ~/.claude/skills/learn/scripts/browser.mjs learn-<workflow> start <start-url>`; it falls back to Playwright's own window, signed in once through a saved profile, when the extension is missing.

**The Playwright tab group.** Attached, Playwright sees only the tabs in its own Chrome tab group: the ones it opened. Tell the person: "Work in the tabs inside the *Playwright* group. Ask me when you need another site and I'll open it there." Open extra tabs with `pw tab-new <url>`; a tab the person opens with ⌘T lands outside the group and is not recorded. When the task needs a tab Playwright cannot reach, record in Playwright's own window instead, where every tab is seen.

**Finding the trace.** `tracing-stop` prints a relative `traces/trace-<id>.network`. Attached sessions write it under the system temp folder: `dirname "$(ls -t "$TMPDIR"/playwright-artifacts-*/trace-<id>.network | head -1)"` is the folder to summarise. Own-window sessions write it to `.playwright-cli/traces/`.

## Person mode ("watch me")

1. Attach, then `pw tracing-start` and `pw recording-start`.
2. Tell the person: "Go ahead in the *Playwright* tab group in Chrome. Say *done* here when you've finished." Wait for *done*.
3. `pw recording-stop` prints their actions as Playwright code: save it as `actions.js`. It is the step list. People retry, misclick and fix typos: keep the actions that moved the task forward and the last value of each field.
4. `pw tracing-stop`, then find the trace folder as above.

What they typed (names, phone numbers, emails) is in `actions.js` and the trace. Use it to find the inputs; repeat a typed value back only when they need to confirm it.

## Claude mode ("do X and remember how")

1. Attach, then `pw tracing-start`.
2. `pw recording-start`, then do the task with `pw snapshot`, `pw click`, `pw fill`, `pw goto`, `pw select`, `pw press`. Keep a note of what each action was for.
3. Before any click that saves, sends, pays or deletes, ask the person.
4. `pw recording-stop` prints the actions as Playwright code with stable locators: save it as `actions.js`, the step list and the source of every click fallback. Element refs such as `e12` change between visits; use the printed code instead.
5. `pw tracing-stop`.

## Replay mode ("save what you just did")

The earlier session's transcript has the browser steps but none of the network detail, so replay them under a trace.

1. Find the transcript: `~/.claude/projects/<slug>/<session-id>.jsonl`, where `<slug>` is the project path with every non-alphanumeric character turned into `-`. With no session named, take the most recent one that used a browser.
2. Pull its browser steps:
   ```bash
   jq -c 'select(.type=="assistant") | .message.content[]? | select(.type=="tool_use")
     | select((.name|test("Browser|claude-in-chrome")) or (.name=="Bash" and (.input.command|test("playwright"))))
     | {name, input}' <transcript.jsonl>
   ```
3. Run Claude mode, repeating those steps with the same inputs. Skip steps that only read the page for Claude (screenshots, page text) unless they decided something.
