/**
 * Apply alt text and normalize image src paths across all HTML.
 * Run: node build/apply-image-alts.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const altMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'image-alt-map.json'), 'utf8'));
const skip = new Set(['node_modules', 'dist', '.git', '.wrangler']);

function slugSegment(seg) {
  return seg
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/&/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeSrc(rawSrc) {
  let decoded = rawSrc.replace(/\{\{base\}\}/g, '');
  try {
    decoded = decodeURIComponent(decoded);
  } catch (_) {}
  if (decoded.startsWith('../../images/')) decoded = decoded.replace(/^\.\.\/\.\.\/images\//, 'images/');
  if (!decoded.startsWith('images/') || !decoded.endsWith('.webp')) return rawSrc;
  const parts = decoded.slice('images/'.length, -5).split('/');
  return `images/${parts.map(slugSegment).join('/')}.webp`;
}

function walkHtml(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(p, acc);
    else if (ent.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

let filesChanged = 0;
let imgsUpdated = 0;

for (const file of walkHtml(root)) {
  let html = fs.readFileSync(file, 'utf8');
  let changed = false;

  html = html.replace(/<img([^>]*?)>/g, (tag, attrs) => {
    const srcM = attrs.match(/\ssrc="([^"]+)"/);
    if (!srcM) return tag;
    const rawSrc = srcM[1];
    if (!rawSrc.includes('images/') || rawSrc.endsWith('.svg')) return tag;

    const normSrc = normalizeSrc(rawSrc);
    const alt = altMap[normSrc];
    if (!alt) return tag;

    let next = attrs;
    if (normSrc !== rawSrc) {
      next = next.replace(/src="[^"]+"/, `src="${normSrc}"`);
    }
    if (/\salt="[^"]*"/.test(next)) {
      next = next.replace(/\salt="[^"]*"/, ` alt="${escapeAttr(alt)}"`);
    } else {
      next += ` alt="${escapeAttr(alt)}"`;
    }

    if (next !== attrs) {
      changed = true;
      imgsUpdated++;
    }
    return `<img${next}>`;
  });

  if (changed) {
    fs.writeFileSync(file, html, 'utf8');
    filesChanged++;
    console.log('Updated', path.relative(root, file));
  }
}

console.log(`Done. ${filesChanged} file(s), ${imgsUpdated} image tag(s) updated.`);
