#!/usr/bin/env node
/*
 * Post-build CSP hash sweeper.
 *
 * Walks every static HTML file under out/, collects the content of every
 * inline <script> tag (excluding `type="application/ld+json"`, which is data),
 * computes SHA-256 hashes, and rewrites out/staticwebapp.config.json so the
 * `script-src` directive lists the hashes and drops `'unsafe-inline'`.
 *
 * Why this exists: Nextra/Next.js static export inlines React Server Component
 * streaming payloads plus Nextra's theme bootstrap (sidebar/navbar state, dark
 * mode). Those inline scripts are legitimate but require either a nonce
 * (runtime) or a hash (build-time) in the CSP. Azure Static Web Apps has no
 * runtime/middleware, so hashes are the viable path. Reclaims the MDN
 * Observatory CSP deduction (-20 points).
 *
 * Style-src is intentionally left with `'unsafe-inline'` because Nextra emits
 * many inline `style=""` attributes (e.g. `height:var(--nextra-navbar-height)`,
 * `transition-duration:300ms`) that come from library internals and aren't
 * addressable from source. That missing bonus is worth +5 to +10 but the
 * script-src tightening alone recovers the -20 deduction.
 *
 * The sweeper preserves every other token already in `script-src` (e.g.
 * `'self'`, `'wasm-unsafe-eval'`, host sources) — it only strips
 * `'unsafe-inline'` and appends the computed hash tokens.
 *
 * No external dependencies — pure Node stdlib: fs, path, crypto.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const OUT_DIR = path.resolve(__dirname, '..', 'out');
const CONFIG_FILE = path.join(OUT_DIR, 'staticwebapp.config.json');

function walkHtml(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkHtml(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

// Conservative inline-script matcher. Skips src-only tags (which are governed
// by host-source entries) and JSON-LD data blocks. Regex is good enough for
// the well-formed HTML Next.js emits; avoids adding an HTML parser dep.
const INLINE_SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

function extractInlineScripts(html) {
  const scripts = [];
  let match;
  INLINE_SCRIPT_RE.lastIndex = 0;
  while ((match = INLINE_SCRIPT_RE.exec(html)) !== null) {
    const attrs = match[1] || '';
    const body = match[2] || '';
    if (/\bsrc\s*=/i.test(attrs)) continue;
    if (/\btype\s*=\s*["']application\/ld\+json["']/i.test(attrs)) continue;
    if (body.length === 0) continue;
    scripts.push(body);
  }
  return scripts;
}

function sha256Base64(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('base64');
}

/**
 * Preserve every token in the existing script-src directive except
 * 'unsafe-inline', then append the supplied hash tokens. Keeps 'self',
 * 'wasm-unsafe-eval', any host sources, etc., without needing the sweeper to
 * know about them. Idempotent: rerunning over an already-hashed directive
 * drops the stale hashes before appending fresh ones.
 */
function rewriteScriptSrc(cspDirective, hashTokens) {
  return cspDirective.replace(/(^|;\s*)script-src\s+([^;]+)/i, (_m, sep, body) => {
    const keep = body
      .trim()
      .split(/\s+/)
      .filter((tok) => tok && tok !== "'unsafe-inline'" && !tok.startsWith("'sha256-"));
    const finalTokens = [...keep, ...hashTokens];
    return `${sep}script-src ${finalTokens.join(' ')}`;
  });
}

function main() {
  if (!fs.existsSync(OUT_DIR)) {
    console.error(`[csp-hashes] Expected build output at ${OUT_DIR} — run "next build" first.`);
    process.exit(1);
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error(
      `[csp-hashes] Missing ${CONFIG_FILE} — is staticwebapp.config.json in public/?`
    );
    process.exit(1);
  }

  const htmlFiles = walkHtml(OUT_DIR);
  if (htmlFiles.length === 0) {
    console.error(`[csp-hashes] No HTML files found under ${OUT_DIR}.`);
    process.exit(1);
  }

  const hashSet = new Set();
  let totalInline = 0;
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const scripts = extractInlineScripts(html);
    totalInline += scripts.length;
    for (const body of scripts) {
      hashSet.add(`'sha256-${sha256Base64(body)}'`);
    }
  }

  const hashTokens = [...hashSet].sort();

  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  const currentCsp = config.globalHeaders?.['Content-Security-Policy'];
  if (!currentCsp || typeof currentCsp !== 'string') {
    console.error(
      `[csp-hashes] globalHeaders["Content-Security-Policy"] missing in ${CONFIG_FILE}.`
    );
    process.exit(1);
  }

  let nextCsp = rewriteScriptSrc(currentCsp, hashTokens).replace(/\s{2,}/g, ' ').trim();

  if (nextCsp === currentCsp) {
    console.log('[csp-hashes] CSP already up-to-date, nothing to write.');
    return;
  }

  config.globalHeaders['Content-Security-Policy'] = nextCsp;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n', 'utf8');

  console.log(
    `[csp-hashes] Scanned ${htmlFiles.length} HTML file(s), ${totalInline} inline script tag(s), ${hashTokens.length} unique hash(es).`
  );
  console.log(`[csp-hashes] Rewrote ${CONFIG_FILE}.`);
}

main();
