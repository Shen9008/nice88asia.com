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
    { src: 'faq.html', base: '' }
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

  const gtmId = 'GTM-TS95HFR5';
  const gtmHead = `    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');</script>
    <!-- End Google Tag Manager -->`;
  html = html.replace(/<head([^>]*)>/, '<head$1>\n' + gtmHead);

  const baseForAssets = pageConfig.base || '';
  const headExtras = [
    `<link rel="icon" href="${baseForAssets}images/favicon.svg" type="image/svg+xml">`,
    `<link rel="icon" type="image/webp" sizes="32x32" href="${baseForAssets}images/nice88-favicon.webp">`,
    `<link rel="apple-touch-icon" href="${baseForAssets}images/apple-touch-icon.png">`
  ].join('\n    ');
  html = html.replace(
    '<meta charset="UTF-8">',
    '<meta charset="UTF-8">\n    ' + headExtras
  );

  const gtmNoscript = `    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->`;

  const spritePath = path.join(config.srcDir, 'icons', 'sprite.svg');
  let bodyInject = '';
  if (fs.existsSync(spritePath)) {
    bodyInject += '\n' + fs.readFileSync(spritePath, 'utf8');
  }
  html = html.replace(/<body([^>]*)>/, '<body$1>\n' + gtmNoscript + '\n' + bodyInject);

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
  await require('./generate-favicon.js')();
  config.pages.forEach(buildPage);
  copyAssets();
  await require('./optimize-images.js')();
  console.log('\n✓ Build complete!');
})();
