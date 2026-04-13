/**
 * Optimize images: convert JPG/PNG to WebP for smaller file sizes
 * Preserves folder structure, outputs to dist/images/
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcDir = path.join(__dirname, '..', 'images');
const distDir = path.join(__dirname, '..', 'dist', 'images');

const EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const WEBP_QUALITY = 85;
const MAX_WIDTH = 1200; // Resize large images for web (hero banners, game cards)

function getAllImageFiles(dir, base = '') {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const relPath = path.join(base, item.name);
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...getAllImageFiles(fullPath, relPath));
    } else if (EXTENSIONS.some(ext => item.name.toLowerCase().endsWith(ext))) {
      results.push(relPath);
    } else if (item.name.toLowerCase().endsWith('.webp')) {
      results.push(relPath);
    }
  }
  return results;
}

async function optimizeImage(srcPath, relPath) {
  const ext = path.extname(relPath).toLowerCase();
  const baseName = path.basename(relPath, ext);
  const dirName = path.dirname(relPath);
  const outDir = path.join(distDir, dirName);
  const outPath = path.join(outDir, baseName + (EXTENSIONS.includes(ext) ? '.webp' : ext));

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  if (ext === '.webp') {
    fs.copyFileSync(srcPath, outPath);
    return;
  }

  let pipeline = sharp(srcPath);
  const metadata = await pipeline.metadata();
  const needsResize = metadata.width > MAX_WIDTH;

  if (needsResize) {
    pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
  }

  await pipeline.webp({ quality: WEBP_QUALITY }).toFile(outPath);
}

async function run() {
  if (!fs.existsSync(srcDir)) {
    console.log('No images folder found, skipping.');
    return;
  }

  const files = getAllImageFiles(srcDir);
  console.log(`Optimizing ${files.length} images to WebP...`);

  for (const relPath of files) {
    const srcPath = path.join(srcDir, relPath);
    try {
      await optimizeImage(srcPath, relPath);
      console.log(`  ✓ ${relPath}`);
    } catch (err) {
      console.error(`  ✗ ${relPath}:`, err.message);
    }
  }

  // Create og-image.jpg for social sharing if missing (fixes 404/Server Error from missing og:image)
  const distRoot = path.join(__dirname, '..', 'dist');
  const ogImageDest = path.join(distRoot, 'og-image.jpg');
  const ogImageSrc = path.join(srcDir, 'Hero Banner', 'Home.jpg');
  if (!fs.existsSync(ogImageDest) && fs.existsSync(ogImageSrc)) {
    try {
      await sharp(ogImageSrc)
        .resize(1200, 630, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toFile(ogImageDest);
      console.log('✓ Created og-image.jpg for social sharing');
    } catch (err) {
      console.warn('  Could not create og-image.jpg:', err.message);
    }
  }

  console.log('✓ Image optimization complete.');
}

module.exports = run;
