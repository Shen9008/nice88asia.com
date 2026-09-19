/**
 * Normalize apex domain (non-www) across HTML, XML, JSON, and JS sources.
 * Run: node build/patch-seo-urls.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const REPLACEMENTS = [
  ['https://nice88asia.com', 'https://nice88asia.com'],
  ['https%3A%2F%2Fnice88asia.com', 'https%3A%2F%2Fnice88asia.com']
];
const skip = new Set(['node_modules', 'dist', '.git', '.wrangler']);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(name.name)) continue;
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walk(full, out);
    else if (/\.(html|xml|json|js|mjs|txt)$/i.test(name.name)) out.push(full);
  }
  return out;
}

let filesChanged = 0;
let replacements = 0;

for (const file of walk(root)) {
  let text = fs.readFileSync(file, 'utf8');
  let next = text;
  let fileReplacements = 0;
  for (const [from, to] of REPLACEMENTS) {
    if (!next.includes(from)) continue;
    const count = (next.match(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    next = next.split(from).join(to);
    fileReplacements += count;
  }
  if (next !== text) {
    fs.writeFileSync(file, next, 'utf8');
    filesChanged++;
    replacements += fileReplacements;
  }
}

console.log(`Updated ${filesChanged} files (${replacements} URL replacements).`);
