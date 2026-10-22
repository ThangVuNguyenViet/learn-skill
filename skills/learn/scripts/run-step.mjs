#!/usr/bin/env node
// Run one browser step inside a workflow's Playwright CLI session and log the outcome.
// Usage: node run-step.mjs <workflow> <step.js> '<inputs-json>'
// step.js is one function, async (page, inputs) => result, that throws when its check fails.
// Prints the JSON result; appends a line to ~/.claude/workflow-runs/<workflow>/steps.log.
import { readFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { join, basename } from 'node:path';

const [workflow, stepFile, inputsJson = '{}'] = process.argv.slice(2);
if (!workflow || !stepFile) { console.error('usage: node run-step.mjs <workflow> <step.js> \'<inputs-json>\''); process.exit(2); }
const runDir = join(homedir(), '.claude', 'workflow-runs', workflow);
mkdirSync(runDir, { recursive: true });

const inputs = JSON.parse(inputsJson);
const step = readFileSync(stepFile, 'utf8').trim().replace(/;$/, '');
const code = `async (page) => await (${step})(page, ${JSON.stringify(inputs)})`;
const started = Date.now();
let out = '';
let ok = true;
try {
  out = execFileSync('npx', ['-y', 'playwright@1.64.1', 'cli', `-s=${workflow}`, 'run-code', code, '--raw'], { encoding: 'utf8', cwd: runDir });
  if (/^### Error/m.test(out)) ok = false;
} catch (err) {
  ok = false;
  out = String(err.stdout || err.message);
}
appendFileSync(join(runDir, 'steps.log'), JSON.stringify({
  at: new Date(started).toISOString(),
  step: basename(stepFile).replace(/(\.click)?\.js$/, ''),
  fallback: stepFile.endsWith('.click.js'),
  ok,
  ms: Date.now() - started,
  output: createHash('sha256').update(out).digest('hex').slice(0, 12),
}) + '\n');
process.stdout.write(out);
process.exit(ok ? 0 : 1);
