'use strict';
/**
 * Bulk-patch embedded blog footers:
 *  - sparta4444@protonmail.com contact email
 *  - real Terms / Privacy / Responsible Gaming links
 *  - licence badge + updated RG copy (match partials/footer.html)
 *  - has-premium-nav + premium.css/js for site-wide nav
 *
 * Run once: node build/patch-blog-footers.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BLOGS_DIR = path.join(ROOT, 'blogs');

const FOOTER_LICENCE = `
        <div class="footer-licence" aria-label="Gaming licence">
            <span class="footer-licence__badge">Licensed</span>
            <p class="footer-licence__text">Curaçao eGaming — Licence <a href="https://www.curacao-egaming.com/" target="_blank" rel="noopener noreferrer">8048/JAZ2017-067</a></p>
        </div>
`;

const RG_TEXT_OLD =
  '<p class="responsible-gaming__text">Gambling can be addictive. Please play responsibly. Nice88 Asia is committed to responsible gaming.</p>';
const RG_TEXT_NEW =
  '<p class="responsible-gaming__text">Gambling can be addictive. Please play responsibly. <a href="../../responsible-gambling.html">Learn about limits, self-exclusion, and support resources</a>.</p>';

function patchBlogPost(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (html.includes('sparta4444@protonmail.com')) {
    html = html.replace(/support@nice88asia\.com/g, 'sparta4444@protonmail.com');
    changed = true;
  }

  if (html.includes('<a href="#">Terms</a>')) {
    html = html.replace('<a href="#">Terms</a>', '<a href="../../terms.html">Terms</a>');
    changed = true;
  }

  if (html.includes('<a href="#">Privacy</a>')) {
    html = html.replace('<a href="#">Privacy</a>', '<a href="../../privacy.html">Privacy</a>');
    changed = true;
  }

  const rgLink = '<a href="../../responsible-gambling.html">Responsible Gaming</a>';
  if (!html.includes('responsible-gambling.html">Responsible Gaming')) {
    html = html.replace(
      /(<a href="mailto:sparta4444@protonmail\.com">Contact<\/a>)/,
      `$1\n                    ${rgLink}`
    );
    changed = true;
  }

  if (html.includes(RG_TEXT_OLD)) {
    html = html.replace(RG_TEXT_OLD, RG_TEXT_NEW);
    changed = true;
  }

  if (!html.includes('footer-licence')) {
    html = html.replace(
      /\s*<div class="trust-links">/,
      FOOTER_LICENCE + '\n\n        <div class="trust-links">'
    );
    changed = true;
  }

  if (!html.includes('has-premium-nav')) {
    html = html.replace(/<body([^>]*)>/, (match, attrs) => {
      if (/class="([^"]*)"/.test(attrs)) {
        return match.replace(/class="([^"]*)"/, 'class="has-premium-nav $1"');
      }
      if (/class='([^']*)'/.test(attrs)) {
        return match.replace(/class='([^']*)'/, "class='has-premium-nav $1'");
      }
      return `<body class="has-premium-nav"${attrs}>`;
    });
    changed = true;
  }

  if (!html.includes('premium.css')) {
    html = html.replace(
      /(<link rel="stylesheet" href="\.\.\/\.\.\/css\/style\.css">)/,
      '$1\n  <link rel="stylesheet" href="../../css/premium.css">'
    );
    changed = true;
  }

  if (!html.includes('premium.js')) {
    html = html.replace(
      /(<script defer src="\.\.\/\.\.\/js\/main\.js"><\/script>)/,
      '$1\n  <script defer src="../../js/premium.js"></script>'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
  }
  return changed;
}

function main() {
  const slugs = fs.readdirSync(BLOGS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  let patched = 0;
  for (const slug of slugs) {
    const filePath = path.join(BLOGS_DIR, slug, 'index.html');
    if (!fs.existsSync(filePath)) continue;
    if (patchBlogPost(filePath)) {
      patched++;
      console.log(`✓ Patched: blogs/${slug}/index.html`);
    }
  }
  console.log(`\nDone — ${patched}/${slugs.length} blog posts updated.`);
}

main();
