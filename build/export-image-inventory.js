const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const skip = new Set(['node_modules', 'dist', '.git', '.wrangler']);
const seen = new Map();

function walkHtml(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(p, acc);
    else if (ent.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

for (const file of walkHtml(root)) {
  const html = fs.readFileSync(file, 'utf8');
  const re = /<img[^>]+>/g;
  let m;
  while ((m = re.exec(html))) {
    const srcM = m[0].match(/src="([^"]+)"/);
    const altM = m[0].match(/alt="([^"]*)"/);
    if (!srcM) continue;
    let src = srcM[1];
    if (src.startsWith('../../')) src = src.replace(/^\.\.\/\.\.\//, 'images/');
    if (!src.startsWith('images/')) continue;
    if (!seen.has(src)) seen.set(src, altM ? altM[1] : '');
  }
}

const lines = [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0]));
fs.writeFileSync(path.join(__dirname, 'image-inventory.json'), JSON.stringify(lines.map(([src, alt]) => ({ src, alt })), null, 2));
console.log('wrote', lines.length, 'unique images');
