import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PAGES = [
  'index.html',
  '404.html',
  'lessons/fsrs.html',
  'lessons/request-journey.html',
];

const EXPECTED_REFERRER = /<meta\s+name="referrer"\s+content="strict-origin-when-cross-origin"\s*\/?>/i;
const EXPECTED_CSP = /<meta\s+http-equiv="Content-Security-Policy"\s+content="[^"]+"\s*\/?>/i;

let failed = false;
for (const relPath of PAGES) {
  const html = readFileSync(resolve(process.cwd(), relPath), 'utf8');
  const headEnd = html.toLowerCase().indexOf('</head>');
  const head = headEnd === -1 ? html : html.slice(0, headEnd);

  if (!EXPECTED_CSP.test(head)) {
    console.error(`[FAIL] ${relPath}: missing Content-Security-Policy meta in <head>`);
    failed = true;
  }
  if (!EXPECTED_REFERRER.test(head)) {
    console.error(`[FAIL] ${relPath}: missing referrer meta (strict-origin-when-cross-origin) in <head>`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log(`[PASS] Verified CSP and referrer meta in ${PAGES.length} HTML pages.`);
