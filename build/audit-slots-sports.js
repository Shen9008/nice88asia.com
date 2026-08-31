const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
for (const page of ['slots.html', 'sports-betting.html']) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const re = /src="(images\/(?:slot|sports)[^"]+)"/g;
  let m;
  const missing = [];
  const tiny = [];
  const seen = new Set();
  while ((m = re.exec(html))) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    const p = path.join(root, m[1]);
    if (!fs.existsSync(p)) missing.push(m[1]);
    else {
      const s = fs.statSync(p).size;
      if (s < 5000) tiny.push({ src: m[1], size: s });
    }
  }
  console.log('===', page, '===');
  console.log('refs', seen.size, 'missing', missing.length, missing);
  console.log('tiny', tiny);
}
