/**
 * Import game card visuals from sibling sites in Downloads → nice88asia WebP paths.
 * Primary donor: fun88cambodia (same legacy folder layout, full JPG sources).
 * Run: node build/import-donor-images.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const downloads = path.join(root, '..');
const imagesDir = path.join(root, 'images');

const DONORS = [
  path.join(downloads, 'fun88cambodia', 'images'),
  path.join(downloads, 'hb88-website', 'images'),
  path.join(downloads, 'longfu88asia-com', 'images'),
  path.join(downloads, 'spin77-website', 'images')
];

const PROFILE_HERO = { maxWidth: 1680, quality: 78 };
const PROFILE_CARD = { maxWidth: 720, quality: 82 };

/** Legacy folder segment → kebab-case */
const FOLDER_MAP = {
  'hero banner': 'hero-banner',
  'explore our games': 'explore-our-games',
  'promotions & bonuses': 'promotions-bonuses',
  'best live casino games': 'best-live-casino-games',
  'top live baccarat tables': 'top-live-baccarat-tables',
  'top live blackjack tables': 'top-live-blackjack-tables',
  'top live game shows': 'top-live-game-shows',
  'top live roulette games': 'top-live-roulette-games',
  'table games available': 'table-games-available',
  'top roulette variants': 'top-roulette-variants',
  'top blackjack variants': 'top-blackjack-variants',
  'top baccarat variants': 'top-baccarat-variants',
  'sports markets': 'sports-markets',
  'top football leagues': 'top-football-leagues',
  'top esports to bet on': 'top-esports-to-bet-on',
  'fastest deposit methods': 'fastest-deposit-methods',
  'top games on mobile': 'top-games-on-mobile',
  'top picks this week': 'top-picks-this-week',
  slot: 'slot',
  'live casino': 'live-casino',
  'table games': 'table-games',
  sports: 'sports',
  payments: 'payments',
  mobile: 'mobile',
  home: 'home',
  news: 'news'
};

/** Filename overrides where kebab auto-map differs from site HTML */
const FILE_ALIASES = {
  'slot': 'slot',
  'sports': 'sport-betting',
  'mobile': 'mobile-app',
  'payment': 'payments',
  'promo': 'table-games',
  'free spin': 'free-spins',
  'speed baccrat': 'speed-baccrat',
  'baccrat squeeze': 'baccrat-squeeze',
  'baccrat control squeeze': 'baccrat-control-squeeze',
  'slon baccarat': 'slon-baccarat',
  'lighting baccarat': 'lighting-baccarat',
  'lighitng roulette': 'lighitng-roulette',
  'speed backjack': 'speed-backjack',
  'gates of olympus slot': 'gates-of-olympus-slot',
  'dragon_s fire megaways': 'dragon-s-fire-megaways',
  "dragon's fire megaways": 'dragon-s-fire-megaways',
  'tennis': 'tennnis',
  'sport betting': 'sport-betting',
  'sports betting': 'sports-betting'
};

function toKebab(name) {
  const base = path.basename(name, path.extname(name)).trim().toLowerCase();
  if (FILE_ALIASES[base]) return FILE_ALIASES[base];
  return base
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapLegacyPath(absPath, donorRoot) {
  const rel = path.relative(donorRoot, absPath);
  const parts = rel.split(path.sep).map((p) => p.toLowerCase());
  if (parts.length < 2) return null;
  let fileKebab = toKebab(parts[parts.length - 1]);
  const folderParts = parts.slice(0, -1).map((p) => FOLDER_MAP[p] || p.replace(/\s+/g, '-'));
  if (folderParts[0] === 'hero-banner' && fileKebab === 'mobile-app') fileKebab = 'mobile';
  return path.posix.join(...folderParts, fileKebab + '.webp');
}

function walkHtml(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(f)) continue;
      walkHtml(p, out);
    } else if (f.endsWith('.html')) out.push(p);
  }
  return out;
}

function collectImgRefs() {
  const refs = new Set();
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  for (const file of walkHtml(root)) {
    const html = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = re.exec(html))) {
      const src = m[1];
      if (src.includes('{{') || src.startsWith('http')) continue;
      refs.add(src.replace(/^\//, ''));
    }
  }
  return refs;
}

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
  const dryRun = process.argv.includes('--dry-run');
  const imgRefs = collectImgRefs();
  const donorFiles = [];

  for (const donorRoot of DONORS) {
    if (!fs.existsSync(donorRoot)) continue;
    (function walk(d) {
      for (const f of fs.readdirSync(d)) {
        const p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) walk(p);
        else if (/\.(png|jpe?g)$/i.test(f)) donorFiles.push({ donorRoot, path: p });
      }
    })(donorRoot);
  }

  const planned = new Map();
  for (const { donorRoot, path: src } of donorFiles) {
    const niceRel = mapLegacyPath(src, donorRoot);
    if (!niceRel) continue;
    const fullDest = path.join(imagesDir, niceRel);
    const isReferenced = imgRefs.has('images/' + niceRel.replace(/\\/g, '/'));
    if (!isReferenced) continue;

    const srcSize = fs.statSync(src).size;
    const existing = fs.existsSync(fullDest) ? fs.statSync(fullDest).size : 0;
    const profile = niceRel.startsWith('hero-banner/') ? PROFILE_HERO : PROFILE_CARD;

    const prev = planned.get(niceRel);
    if (!prev || srcSize > prev.srcSize) {
      planned.set(niceRel, { src, srcSize, existing, profile, donor: path.basename(path.dirname(donorRoot)) });
    }
  }

  let updated = 0;
  let skipped = 0;
  for (const [niceRel, item] of planned) {
    const fullDest = path.join(imagesDir, niceRel);
    const shouldUpdate = !fs.existsSync(fullDest) || item.srcSize > item.existing * 1.15 || item.existing < 4000;
    if (!shouldUpdate) {
      skipped++;
      continue;
    }
    console.log(`${dryRun ? '[dry] ' : ''}✓ ${path.basename(item.donor)} → images/${niceRel} (${item.srcSize}b)`);
    if (!dryRun) {
      await convertToWebp(item.src, fullDest, item.profile);
      updated++;
    }
  }

  console.log(`\n${dryRun ? 'Would update' : 'Updated'}: ${dryRun ? planned.size - skipped : updated}, skipped (already good): ${skipped}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
