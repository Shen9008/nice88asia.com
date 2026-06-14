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
    { src: 'blog/index.html', base: '../' },
    { src: 'blogs/index.html', base: '../' }
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
    `<meta name="theme-color" content="#0F291B">`,
    `<link rel="icon" type="image/webp" sizes="32x32" href="${baseForAssets}images/nice88-favicon.webp">`,
    `<link rel="apple-touch-icon" href="${baseForAssets}images/apple-touch-icon.webp">`
  ].join('\n    ');
  html = html.replace(
    '<meta charset="UTF-8">',
    '<meta charset="UTF-8">\n    ' + headExtras
  );

  const premiumCss = `<link rel="stylesheet" href="${baseForAssets}css/premium.css">`;
  if (!html.includes('premium.css')) {
    html = html.replace(
      /(<link rel="stylesheet" href="[^"]*css\/style\.css">)/,
      '$1\n    ' + premiumCss
    );
  }

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

  const premiumScript = pageConfig.base + 'js/premium.js';
  if (!html.includes('premium.js')) {
    html = html.replace(
      /(<script defer src="[^"]*js\/main\.js"><\/script>)/,
      '$1\n    <script defer src="' + premiumScript + '"></script>'
    );
  }

  fs.writeFileSync(distPath, html, 'utf8');
  console.log(`✓ Built: ${pageConfig.src}`);
}

function copyBlogArticleDirs() {
  const blogSrc = path.join(config.srcDir, 'blogs');
  const blogDist = path.join(config.distDir, 'blogs');
  if (!fs.existsSync(blogSrc)) return;
  for (const entry of fs.readdirSync(blogSrc, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      copyRecursiveSync(path.join(blogSrc, entry.name), path.join(blogDist, entry.name));
      console.log(`✓ Copied: blogs/${entry.name}/`);
    }
  }
}

function copyAssets() {
  const assets = ['css', 'js', 'icons', 'config', 'assets'];
  assets.forEach(asset => {
    const src = path.join(config.srcDir, asset);
    const dist = path.join(config.distDir, asset);
    if (fs.existsSync(src)) {
      if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });
      copyRecursiveSync(src, dist);
      console.log(`✓ Copied: ${asset}/`);
    }
  });
  ['robots.txt', 'sitemap.xml', '_redirects', 'og-image.webp'].forEach(file => {
    const src = path.join(config.srcDir, file);
    const dist = path.join(config.distDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dist);
      console.log(`✓ Copied: ${file}`);
    }
  });
}

/** After WebP optimization, copy key assets back into /images so audits and relative hrefs match (see seo-task.md). */
function syncOptimizedWebpToSource() {
  const root = path.join(__dirname, '..');
  const pairs = [
    ['dist/images/logo-nice88.webp', 'images/logo-nice88.webp'],
    ['dist/images/hero-banner/news.webp', 'images/hero-banner/news.webp']
  ];
  for (const [fromRel, toRel] of pairs) {
    const from = path.join(root, fromRel);
    const to = path.join(root, toRel);
    if (fs.existsSync(from)) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      try {
        fs.copyFileSync(from, to);
        console.log(`✓ Synced ${toRel} for source parity`);
      } catch (err) {
        console.warn(`⚠ Skipped sync ${toRel}: ${err.message}`);
      }
    }
  }
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
  copyBlogArticleDirs();
  copyAssets();
  await require('./optimize-images.js')();
  syncOptimizedWebpToSource();
  console.log('\n✓ Build complete!');
})();
