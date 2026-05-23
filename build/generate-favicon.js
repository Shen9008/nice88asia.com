/**
 * Build favicon and touch icon from images/logo-nice88.webp (or .png fallback).
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
function resolveLogoPath() {
  const webp = path.join(root, 'images', 'logo-nice88.webp');
  const png = path.join(root, 'images', 'logo-nice88.png');
  if (fs.existsSync(webp)) return webp;
  if (fs.existsSync(png)) return png;
  return null;
}

/** Match <meta name="theme-color"> (#1a1a1f) for letterboxing */
const ICON_BG = { r: 26, g: 26, b: 31, alpha: 1 };

async function run() {
  const logoPath = resolveLogoPath();
  if (!logoPath) {
    console.warn('generate-favicon: logo-nice88.webp (or .png) missing, skipping.');
    return;
  }

  await sharp(logoPath)
    .resize(32, 32, { fit: 'contain', background: ICON_BG })
    .webp({ quality: 92 })
    .toFile(path.join(root, 'images', 'nice88-favicon.webp'));

  await sharp(logoPath)
    .resize(180, 180, { fit: 'contain', background: ICON_BG })
    .webp({ quality: 92 })
    .toFile(path.join(root, 'images', 'apple-touch-icon.webp'));

  console.log('✓ Generated nice88-favicon.webp and apple-touch-icon.webp from', path.basename(logoPath));
}

module.exports = run;
