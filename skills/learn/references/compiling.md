# Compiling steps

For each recorded step, find the requests it caused in the trace summary (same tab, between this action and the next), then move it down the **ladder** to the cheapest rung that passes the step's check.

## The ladder

| Rung | When it fits | What you write |
|---|---|---|
| 1. In-page request | The step's effect is a first-party request whose inputs you can explain (typed values, earlier results, values the page shows). | A browser step file that calls `fetch` inside the page (below). |
| 2. Plain code | The step is a decision or transform with a rule you can state: filter, compare, format, total. | A `.ts` file run with `npx -y tsx`. |
| 3. Judgment | Classify, summarise, or extract from free text: no rule you can state. | An inline helper whose Strategies say what to judge; the model running the workflow does it. |
| 4. Click | Anything below fails: signed or encrypted requests, per-form tokens you cannot read from the page, captchas, file pickers. | A browser step file using `page` locators, taken from the recorded actions. |

Every step keeps a rung-4 click version as its fallback, except rung-2 and rung-3 steps, which never touch the page.

## Where each step runs

By default every step runs inline, in the person's own conversation, on the model they chose: its cached context is reused on every step, while another agent starts from an empty cache and re-reads everything it needs. Give a step its own `session` only when one of these holds, and write the reason as a comment beside it:

| Case | Session |
|---|---|
| Steps in a `parallel` block | One per branch, no `model:`. |
| A step reads a large input (an export, a long page) and returns a short result | `model: haiku`. Inline, the large input would be re-read from cache by every later step. |
| A rung-3 step failed its check on the person's model during verification | `model:` the next larger model; verify again. |

The retro lists every step that runs outside the conversation and why; the person can ask to keep it inline.

## Finding the request behind a step

Work from the summary, never the raw trace. A step's request is usually the first non-GET, or the GET whose response holds the data the page then showed. Record the step at least twice with different inputs when you can: the parts of the URL and body that change are the inputs.

Method credit: the record → identify → extract → generate → verify sequence comes from agent-browser's derive-client skill; here it runs on Playwright traces, inside the page.

## Browser step files

One function per file: `async (page, inputs) => result`, returned as plain JSON. Run with:

```bash
node ~/.claude/skills/learn/scripts/run-step.mjs <session> <step.js> '<inputs-json>'
```

Rung 1 makes the request from inside the page so the person's login rides along and no credential leaves the browser:

```js
async (page, inputs) => page.evaluate(async ({ query }) => {
  const r = await fetch('/api/search?q=' + encodeURIComponent(query), { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error('search ' + r.status);
  return (await r.json()).items.map(({ id, name, price }) => ({ id, name, price }));
}, inputs)
```

- Start every browser step with `page.goto` to the page the request came from, so a relative `fetch` hits the right site.
- Read per-form tokens from the page (`document.querySelector('input[name=csrf]').value`) at run time; never copy one from the trace.
- When the request needs a key the summary redacted, first look for the site's own documented API on the same site (an "API" link in the page footer is a common sign) that needs no key; otherwise read the key from the page at run time.
- In click versions, after a click that reloads a list (a filter, a search), wait until the list changes; waiting for the network to go quiet returns the old list.
- Return only the fields later steps use.

## Each step's check

A click version that cannot cover an input (a date range its menu lacks) throws, saying so in plain words, rather than return a different result.

Put the check inside the step file as a `throw`: what must be true of its result for the run to continue (non-empty list, record id present, total matches the page). `run-step.mjs` exits non-zero and logs the failure; the workflow then runs that step's `.click.js` fallback and tells the person the page changed.
