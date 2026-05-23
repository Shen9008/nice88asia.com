/** Replace og-image.jpg / apple-touch-icon.png with WebP across HTML (skip node_modules, dist). */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SKIP = new Set(['node_modules', 'dist', '.git']);

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(p);
    } else if (ent.name.endsWith('.html')) {
      let s = fs.readFileSync(p, 'utf8');
      const n = s
        .replace(/og-image\.jpg/g, 'og-image.webp')
        .replace(/apple-touch-icon\.png/g, 'apple-touch-icon.webp');
      if (n !== s) fs.writeFileSync(p, n);
    }
  }
}

walk(root);
console.log('Patched HTML meta / touch icon URLs to WebP where needed.');
