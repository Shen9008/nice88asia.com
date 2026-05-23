const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const skip = new Set(['node_modules', 'dist', '.git', '.wrangler']);

function walkHtml(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(p, acc);
    else if (ent.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const imgs = [];
for (const file of walkHtml(root)) {
  const html = fs.readFileSync(file, 'utf8');
  const re = /<img[^>]+>/g;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const srcM = tag.match(/src="([^"]+)"/);
    const altM = tag.match(/alt="([^"]*)"/);
    if (!srcM || !srcM[1].includes('images/')) continue;
    imgs.push({
      file: path.relative(root, file),
      src: srcM[1],
      alt: altM ? altM[1] : ''
    });
  }
}

const old = imgs.filter((i) => /%|Hero Banner|Explore Our|Promotions &/i.test(i.src));
console.log('total', imgs.length, 'old paths', old.length);
old.forEach((i) => console.log(i.file, '->', i.src));

const missing = [];
for (const i of imgs) {
  let rel = i.src.replace(/^images\//, '');
  try {
    rel = decodeURIComponent(rel);
  } catch (_) {}
  const base = rel.replace(/\.webp$/i, '');
  const dir = path.join(root, 'images', ...base.split('/'));
  const found = ['.webp', '.png', '.jpg', '.jpeg'].some((ext) => fs.existsSync(dir + ext));
  if (!found) missing.push({ ...i, rel });
}
console.log('missing source', missing.length);
missing.slice(0, 20).forEach((i) => console.log('  ', i.file, i.src));
