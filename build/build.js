const fs = require('fs');
const path = require('path');

const config = {
  srcDir: path.join(__dirname, '..'),
  distDir: path.join(__dirname, '..', 'dist'),
  partialsDir: path.join(__dirname, '..', 'partials'),
  pages: [
    { src: 'index.html', base: '' },
    { src: '404.html', base: '' },
    { src: 'slots.html', base: '' },
    { src: 'live-casino.html', base: '' },
    { src: 'table-games.html', base: '' },
    { src: 'sports-betting.html', base: '' },
    { src: 'payments.html', base: '' },
    { src: 'mobile-app.html', base: '' },
    { src: 'about-us.html', base: '' },
    { src: 'faq.html', base: '' },
    { src: 'news/index.html', base: '../' },
    { src: 'news/online-casino-cambodia-guide.html', base: '../' },
    { src: 'news/best-online-slots-cambodia.html', base: '../' },
    { src: 'news/live-casino-cambodia-guide.html', base: '../' },
    { src: 'news/sports-betting-cambodia-guide.html', base: '../' },
    { src: 'news/mobile-casino-cambodia.html', base: '../' },
    { src: 'news/baccarat-cambodia-guide.html', base: '../' },
    { src: 'news/blackjack-cambodia-strategy.html', base: '../' },
    { src: 'news/roulette-cambodia-guide.html', base: '../' },
    { src: 'news/dragon-tiger-cambodia.html', base: '../' },
    { src: 'news/deposit-methods-cambodia.html', base: '../' },
    { src: 'news/safe-online-gambling-cambodia.html', base: '../' },
    { src: 'news/casino-bonuses-cambodia.html', base: '../' },
    { src: 'news/megaways-slots-cambodia.html', base: '../' },
    { src: 'news/progressive-jackpots-cambodia.html', base: '../' },
    { src: 'news/responsible-gambling-cambodia.html', base: '../' }
  ]
};

function loadPartial(name) {
  const filePath = path.join(config.partialsDir, `${name}.html`);
  return fs.readFileSync(filePath, 'utf8');
}

function replacePlaceholders(template, data) {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

function buildPage(pageConfig) {
  const srcPath = path.join(config.srcDir, pageConfig.src);
  const distPath = path.join(config.distDir, pageConfig.src);
  const distDir = path.dirname(distPath);

  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

  let html = fs.readFileSync(srcPath, 'utf8');
  const header = replacePlaceholders(loadPartial('header'), { base: pageConfig.base });
  const footer = replacePlaceholders(loadPartial('footer'), { base: pageConfig.base });

  html = html.replace('<!-- INCLUDE: header -->', header);
  html = html.replace('<!-- INCLUDE: footer -->', footer);
  const promoBanner = loadPartial('promo-banner');
  html = html.replace(/<!-- INCLUDE: promo-banner -->/g, promoBanner);

  const baseForAssets = pageConfig.base || '';
  const headExtras = `<link rel="icon" type="image/webp" href="${baseForAssets}images/nice88-favicon.webp">`;
  html = html.replace(/<head([^>]*)>/, '<head$1>\n' + headExtras);

  const spritePath = path.join(config.srcDir, 'icons', 'sprite.svg');
  let bodyInject = '';
  if (fs.existsSync(spritePath)) {
    bodyInject += '\n' + fs.readFileSync(spritePath, 'utf8');
  }
  html = html.replace(/<body([^>]*)>/, '<body$1>\n' + bodyInject);

  fs.writeFileSync(distPath, html, 'utf8');
  console.log(`✓ Built: ${pageConfig.src}`);
}

function copyAssets() {
  const assets = ['css', 'js', 'icons', 'config'];
  assets.forEach(asset => {
    const src = path.join(config.srcDir, asset);
    const dist = path.join(config.distDir, asset);
    if (fs.existsSync(src)) {
      if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });
      copyRecursiveSync(src, dist);
      console.log(`✓ Copied: ${asset}/`);
    }
  });
  ['robots.txt', 'sitemap.xml', '_redirects', 'og-image.jpg'].forEach(file => {
    const src = path.join(config.srcDir, file);
    const dist = path.join(config.distDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dist);
      console.log(`✓ Copied: ${file}`);
    }
  });
}

function copyRecursiveSync(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

(async function main() {
  if (!fs.existsSync(config.distDir)) fs.mkdirSync(config.distDir, { recursive: true });
  config.pages.forEach(buildPage);
  copyAssets();
  await require('./optimize-images.js')();
  console.log('\n✓ Build complete!');
})();
