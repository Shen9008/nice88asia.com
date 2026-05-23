/**
 * Convert legacy PNG/JPG folders to kebab-case WebP under images/.
 * Run: node build/sync-source-images.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, '..', 'images');

const PROFILE_HERO = { maxWidth: 1680, quality: 78 };
const PROFILE_CARD = { maxWidth: 720, quality: 82 };
const PROFILE_LOGO = { maxWidth: 260, quality: 86 };

/** @type {{ from: string; to: string; profile: typeof PROFILE_HERO }[]} */
const MAP = [
  ['Hero Banner/About.png', 'hero-banner/about.webp', PROFILE_HERO],
  ['Hero Banner/FAQ.png', 'hero-banner/faq.webp', PROFILE_HERO],
  ['Hero Banner/Live Casino.png', 'hero-banner/live-casino.webp', PROFILE_HERO],
  ['Hero Banner/Mobile.png', 'hero-banner/mobile.webp', PROFILE_HERO],
  ['Hero Banner/Payment.png', 'hero-banner/payments.webp', PROFILE_HERO],
  ['Hero Banner/Promo.png', 'hero-banner/table-games.webp', PROFILE_HERO],
  ['Hero Banner/Slot.png', 'hero-banner/slot.webp', PROFILE_HERO],
  ['Hero Banner/Sports Betting.png', 'hero-banner/sports-betting.webp', PROFILE_HERO],
  ['home/Explore Our Games/Live Casino.png', 'home/explore-our-games/live-casino.webp', PROFILE_CARD],
  ['home/Explore Our Games/Mobile.png', 'home/explore-our-games/mobile-app.webp', PROFILE_CARD],
  ['home/Explore Our Games/Sports.png', 'home/explore-our-games/sport-betting.webp', PROFILE_CARD],
  ['home/Explore Our Games/Table Games.png', 'home/explore-our-games/table-games.webp', PROFILE_CARD],
  ['home/Promotions & Bonuses/Cashback.png', 'home/promotions-bonuses/cashback.webp', PROFILE_CARD],
  ['home/Promotions & Bonuses/Free Spin.png', 'home/promotions-bonuses/free-spins.webp', PROFILE_CARD],
  ['logo-nice88.png', 'logo-nice88.webp', PROFILE_LOGO]
];

async function convertToWebp(srcPath, destPath, profile) {
  const metadata = await sharp(srcPath).metadata();
  let pipeline = sharp(srcPath).rotate();
  if (metadata.width && metadata.width > profile.maxWidth) {
    pipeline = pipeline.resize(profile.maxWidth, null, { withoutEnlargement: true, fit: 'inside' });
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  await pipeline.webp({ quality: profile.quality, effort: 5 }).toFile(destPath);
}

async function run() {
  let n = 0;
  for (const [fromRel, toRel, profile] of MAP) {
    const src = path.join(imagesDir, fromRel);
    const dest = path.join(imagesDir, toRel);
    if (!fs.existsSync(src)) continue;
    try {
      await convertToWebp(src, dest, profile);
      console.log(`  ✓ ${fromRel} → ${toRel}`);
      n++;
    } catch (err) {
      console.error(`  ✗ ${fromRel}:`, err.message);
    }
  }

  const legacyDirs = [
    path.join(imagesDir, 'Hero Banner'),
    path.join(imagesDir, 'home', 'Explore Our Games'),
    path.join(imagesDir, 'home', 'Promotions & Bonuses')
  ];
  for (const dir of legacyDirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isFile() && /\.(png|jpe?g)$/i.test(f)) {
        fs.unlinkSync(full);
        console.log(`  removed ${path.relative(imagesDir, full)}`);
      }
    }
    if (fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir);
      console.log(`  removed empty ${path.relative(imagesDir, dir)}`);
    }
  }

  const logoPng = path.join(imagesDir, 'logo-nice88.png');
  if (fs.existsSync(logoPng)) fs.unlinkSync(logoPng);

  console.log(n ? `Synced ${n} source image(s) to WebP.` : 'No legacy PNG sources found to sync.');
}

run();
