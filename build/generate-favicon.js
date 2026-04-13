/**
 * Rasterize Nice88 Asia favicon from images/favicon.svg
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'images', 'favicon.svg');

async function run() {
  if (!fs.existsSync(svgPath)) {
    console.warn('generate-favicon: favicon.svg missing, skipping.');
    return;
  }
  const svg = fs.readFileSync(svgPath);

  await sharp(svg)
    .resize(32, 32, { fit: 'contain', background: { r: 45, g: 45, b: 45, alpha: 0 } })
    .webp({ quality: 92 })
    .toFile(path.join(root, 'images', 'nice88-favicon.webp'));

  await sharp(svg)
    .resize(180, 180, { fit: 'contain', background: { r: 45, g: 45, b: 45, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(root, 'images', 'apple-touch-icon.png'));

  console.log('✓ Generated nice88-favicon.webp and apple-touch-icon.png from favicon.svg');
}

module.exports = run;
