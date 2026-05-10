/**
 * Rewrites src="images/..." in root *.html to match kebab-case paths under images/.
 * Run after renaming image folders/files.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const imagesDir = path.join(root, 'images');

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

function mapImageSrc(rawSrc) {
  let decoded;
  try {
    decoded = decodeURIComponent(rawSrc);
  } catch {
    return null;
  }
  if (!decoded.startsWith('images/')) return null;
  const lower = decoded.toLowerCase();
  if (lower.endsWith('.svg')) return null;
  if (lower.endsWith('apple-touch-icon.webp')) return null;
  if (!lower.endsWith('.webp')) return null;

  const withoutPrefix = decoded.slice('images/'.length, -'.webp'.length);
  const parts = withoutPrefix.split('/');
  const slugged = parts.map(slugSegment).join('/');
  return `images/${slugged}.webp`;
}

function sourceImageExists(webpRelFromImages) {
  const relNoWebp = webpRelFromImages.slice(0, -5);
  const fsPath = path.join(imagesDir, ...relNoWebp.split('/'));
  for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
    if (fs.existsSync(fsPath + ext)) return true;
  }
  return false;
}

function rewriteHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  html = html.replace(/src="(images\/[^"]+)"/g, (m, src) => {
    const next = mapImageSrc(src);
    if (!next || next === src) return m;
    if (!sourceImageExists(next.slice('images/'.length))) {
      console.warn(`Missing file for ${path.basename(filePath)}: ${next}`);
    }
    changed = true;
    return `src="${next}"`;
  });
  if (changed) fs.writeFileSync(filePath, html, 'utf8');
  return changed;
}

const htmlFiles = fs
  .readdirSync(root)
  .filter((f) => f.endsWith('.html') && !f.startsWith('.'));

let n = 0;
for (const f of htmlFiles) {
  if (rewriteHtml(path.join(root, f))) {
    console.log(`Updated ${f}`);
    n++;
  }
}
console.log(n ? `Done. ${n} file(s) updated.` : 'No changes.');
