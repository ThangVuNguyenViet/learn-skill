#!/usr/bin/env node
// Summarise a Playwright trace's network log for the model: first-party calls only, secrets redacted.
// Usage: node trace-summary.mjs <traces-dir> [--all]   (--all keeps static files and third-party hosts)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
const keepAll = process.argv.includes('--all');
if (!dir) { console.error('usage: node trace-summary.mjs <traces-dir> [--all]'); process.exit(2); }

const SECRET_HEADER = /cookie|authorization|token|csrf|xsrf|api[-_]?key|secret|session|signature/i;
const SECRET_FIELD = /pass(word)?|token|secret|otp|pin$|cvv|cvc|card|iban|ssn|api[-_]?key|session|csrf|xsrf|signature|cookie|authorization/i;
const BEARER = /\b(Bearer|Basic)\s+[A-Za-z0-9._~+\/=-]+/g;
const secretValues = new Set();
const KEEP_HEADER = /^(content-type|accept|origin|referer|x-requested-with)$/i;
const STATIC = /^(image|font|text\/css|video|audio)|javascript/;
const STATIC_URL = /\.(woff2?|ttf|otf|png|jpe?g|gif|svg|webp|ico|css|m?js|map)(\?|$)/i;
const NOISE = /_private\/browser|\/rum\b|google-analytics|googletagmanager|doubleclick|segment\.|sentry|datadog|intercom|hotjar|mixpanel|amplitude|facebook\.net|clarity\.ms|\/(collect|track|beacon|log|rgstr|telemetry)\b/i;
const MAX_BODY = 2000;

const redactValue = (key, value) => (SECRET_FIELD.test(key) ? '[redacted]' : value);
const redactJson = (node) => {
  if (Array.isArray(node)) return node.slice(0, 5).map(redactJson);
  if (node && typeof node === 'object')
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, SECRET_FIELD.test(k) ? '[redacted]' : redactJson(v)]));
  return node;
};
const readBody = (file, mime = '') => {
  if (!file || !existsSync(join(dir, file))) return undefined;
  const text = readFileSync(join(dir, file), 'utf8');
  if (/json/.test(mime) || /^\s*[\[{]/.test(text)) {
    try { return JSON.stringify(redactJson(JSON.parse(text))).slice(0, MAX_BODY); } catch {}
  }
  if (/x-www-form-urlencoded/.test(mime))
    return [...new URLSearchParams(text)].map(([k, v]) => `${k}=${redactValue(k, v)}`).join('&').slice(0, MAX_BODY);
  return /html/.test(mime) ? `[html, ${text.length} chars]` : text.slice(0, MAX_BODY);
};
// Set-Cookie attributes (domain=github.com, path=/) are not secrets; scrubbing them hides the site's own name.
const COOKIE_ATTR = /^(domain|path|expires|max-age|samesite|priority)$/i;
const remember = (list = []) => list.filter((h) => SECRET_HEADER.test(h.name) && h.value.length >= 8)
  .forEach((h) => { secretValues.add(h.value); for (const part of h.value.split(/[;,\s]+/)) { const [k, ...rest] = part.split('='); const v = rest.join('='); if (v.length >= 8 && !COOKIE_ATTR.test(k)) secretValues.add(v); } });
const scrub = (text) => {
  let t = text.replace(BEARER, '$1 [redacted]');
  for (const v of secretValues) t = t.split(v).join('[redacted]');
  return t;
};
const headers = (list = []) => Object.fromEntries(
  list.filter((h) => KEEP_HEADER.test(h.name) || SECRET_HEADER.test(h.name))
    .map((h) => [h.name.toLowerCase(), SECRET_HEADER.test(h.name) ? '[redacted]' : h.value]));
const stripQuery = (url) => {
  const u = new URL(url);
  for (const k of [...u.searchParams.keys()]) if (SECRET_FIELD.test(k)) u.searchParams.set(k, '[redacted]');
  return u.toString();
};

if (!existsSync(dir)) { console.error(`no such folder: ${dir}`); process.exit(1); }
const files = readdirSync(dir).filter((f) => f.endsWith('.network'));
if (!files.length) { console.error(`no .network file in ${dir}`); process.exit(1); }
const out = [];
for (const f of files) {
  for (const line of readFileSync(join(dir, f), 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const s = JSON.parse(line).snapshot;
    if (!s?.request) continue;
    const { request: rq, response: rs = {} } = s;
    const mime = rs.content?.mimeType ?? '';
    remember(rq.headers);
    remember(rs.headers);
    if (!/^https?:/.test(rq.url)) continue;
    if (!keepAll && (STATIC.test(mime) || STATIC_URL.test(rq.url) || NOISE.test(rq.url))) continue;
    out.push({
      n: out.length,
      tab: s.pageref,
      at: s.startedDateTime,
      method: rq.method,
      url: stripQuery(rq.url),
      status: rs.status,
      requestHeaders: headers(rq.headers),
      requestBody: rq.postData ? readBody(rq.postData._file, rq.postData.mimeType) ?? redactJson(Object.fromEntries((rq.postData.params ?? []).map((p) => [p.name, p.value]))) : undefined,
      responseType: mime,
      responseBody: readBody(rs.content?._file, mime),
    });
  }
}
console.log(scrub(JSON.stringify(out, null, 1)));
