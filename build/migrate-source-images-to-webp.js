/**
 * One-time / maintenance: convert images/*.jpg|jpeg|png to .webp in place and remove originals.
 * Keeps .svg and existing .webp. Run: node build/migrate-source-images-to-webp.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcDir = path.join(__dirname, '..', 'images');
const RASTER = ['.jpg', '.jpeg', '.png'];
const WEBP_QUALITY = 85;
const MAX_WIDTH = 1200;

function walkRasterFiles(dir, base = '') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, item.name);
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      out.push(...walkRasterFiles(full, rel));
    } else {
      const low = item.name.toLowerCase();
      if (RASTER.some((ext) => low.endsWith(ext))) {
        out.push({ full, rel });
      }
    }
  }
  return out;
}

async function convertOne(fullPath) {
  const ext = path.extname(fullPath).toLowerCase();
  const webpPath = fullPath.slice(0, -ext.length) + '.webp';

  const metadata = await sharp(fullPath).metadata();
  let pipeline = sharp(fullPath);
  if (metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
  }

  await pipeline.webp({ quality: WEBP_QUALITY }).toFile(webpPath);
  fs.unlinkSync(fullPath);
}

async function run() {
  const files = walkRasterFiles(srcDir);
  console.log(`Converting ${files.length} raster files under images/ to WebP...`);
  for (const { full, rel } of files) {
    try {
      await convertOne(full);
      console.log(`  ✓ ${rel}`);
    } catch (err) {
      console.error(`  ✗ ${rel}:`, err.message);
    }
  }
  console.log('Done.');
}

run();
