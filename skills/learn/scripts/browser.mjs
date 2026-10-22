#!/usr/bin/env node
// Start or stop the browser session a workflow runs in.
// Usage: node browser.mjs <workflow> start [start-url] | stop
// start attaches to the person's Chrome through the Playwright Extension, else opens the workflow's own signed-in window.
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const [workflow, action, url] = process.argv.slice(2);
if (!workflow || !['start', 'stop'].includes(action)) { console.error('usage: node browser.mjs <workflow> start [start-url] | stop'); process.exit(2); }
const runDir = join(homedir(), '.claude', 'workflow-runs', workflow);
mkdirSync(runDir, { recursive: true });
const tokenFile = join(homedir(), '.claude', 'workflow-runs', '.extension-token');
if (existsSync(tokenFile)) process.env.PLAYWRIGHT_MCP_EXTENSION_TOKEN = readFileSync(tokenFile, 'utf8').trim();
const pw = (...args) => execFileSync('npx', ['-y', 'playwright@1.64.1', 'cli', `-s=${workflow}`, ...args], { encoding: 'utf8', cwd: runDir, stdio: ['ignore', 'pipe', 'pipe'] });

if (action === 'stop') {
  try { pw('detach'); } catch {}
  try { pw('close'); } catch {}
  process.exit(0);
}
try {
  execFileSync('npx', ['-y', 'playwright@1.64.1', 'cli', `-s=${workflow}`, 'attach', '--extension=chrome'], { cwd: runDir, stdio: 'ignore', timeout: 60000 });
  if (url) pw('goto', url);
  console.log('attached');
} catch {
  pw('open', '--headed', '--persistent', '--profile', join(runDir, 'profile'), ...(url ? [url] : []));
  console.log('own-window');
}
