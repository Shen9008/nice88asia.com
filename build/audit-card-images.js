/**
 * Audit game/lobby card images vs HTML references and scan Downloads for sources.
 * Run: node build/audit-card-images.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const downloads = path.join(root, '..');

function walkHtml(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(f)) continue;
      walkHtml(p, out);
    } else if (f.endsWith('.html')) out.push(p);
  }
  return out;
}

function isCardPath(src) {
  return /images\/(slot|live-casino|table-games|sports|home\/explore-our-games|home\/promotions-bonuses|mobile|payments)\//i.test(src);
}

const refs = new Map();
for (const file of walkHtml(root)) {
  const html = fs.readFileSync(file, 'utf8');
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const src = m[1];
    if (src.includes('{{') || src.startsWith('http')) continue;
    const rel = path.relative(root, file).replace(/\\/g, '/');
    if (!refs.has(src)) refs.set(src, []);
    refs.get(src).push(rel);
  }
}

const cardRefs = [...refs.entries()].filter(([src]) => isCardPath(src));
const missing = [];
const tiny = [];

for (const [src, pages] of cardRefs) {
  const abs = path.join(root, src.replace(/\//g, path.sep));
  if (!fs.existsSync(abs)) {
    missing.push({ src, pages });
    continue;
  }
  const stat = fs.statSync(abs);
  if (stat.size < 3000) tiny.push({ src, size: stat.size, pages });
}

console.log('=== Card image audit ===');
console.log('Card refs:', cardRefs.length);
console.log('Missing:', missing.length);
missing.forEach((x) => console.log('  MISSING', x.src, '←', x.pages[0]));

console.log('Suspiciously small (<3KB):', tiny.length);
tiny.forEach((x) => console.log('  SMALL', x.src, x.size, 'bytes'));

// Scan sibling sites for matching filenames
const targets = cardRefs.map(([src]) => path.basename(src, '.webp'));
const uniqueTargets = [...new Set(targets)];

const SITE_DIRS = fs
  .readdirSync(downloads, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name.endsWith('-website') || d.name.match(/^(fun88cambodia|longf88-com|longfu88asia-com|hb88-website|spin77-website|m99game)$/))
  .map((d) => path.join(downloads, d.name));

const foundSources = new Map();

function scanDir(dir, depth = 0) {
  if (depth > 8 || !fs.existsSync(dir)) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      scanDir(p, depth + 1);
    } else if (/\.(png|jpe?g|webp)$/i.test(e.name)) {
      const base = path.basename(e.name, path.extname(e.name)).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      for (const t of uniqueTargets) {
        const norm = t.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (base === norm || base.includes(norm) || norm.includes(base)) {
          if (!foundSources.has(t)) foundSources.set(t, []);
          const site = path.relative(downloads, p).split(path.sep)[0];
          foundSources.get(t).push({ site, path: path.relative(downloads, p), size: fs.statSync(p).size });
        }
      }
    }
  }
}

for (const site of SITE_DIRS) {
  const img = path.join(site, 'images');
  if (fs.existsSync(img)) scanDir(img);
}

console.log('\n=== Potential source visuals in Downloads (by card filename) ===');
for (const [src] of cardRefs) {
  const base = path.basename(src, '.webp');
  const sources = foundSources.get(base) || [];
  const niceOnly = sources.filter((s) => !s.site.includes('nice88asia'));
  if (niceOnly.length) {
    console.log(`\n${src}`);
    niceOnly.slice(0, 5).forEach((s) => console.log(`  ${s.site}: ${s.path} (${s.size}b)`));
  }
}

// Legacy folders still in nice88asia dist
const distLegacy = path.join(root, 'dist', 'images');
if (fs.existsSync(distLegacy)) {
  console.log('\n=== Legacy dist-only image folders (not in source kebab paths) ===');
  const legacyDirs = [];
  function findLegacy(d, rel = '') {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) {
        if (/[A-Z ]/.test(f)) legacyDirs.push(path.join(rel, f));
        findLegacy(p, path.join(rel, f));
      }
    }
  }
  findLegacy(distLegacy);
  [...new Set(legacyDirs)].slice(0, 20).forEach((d) => console.log(' ', d));
}
