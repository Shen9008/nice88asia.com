'use strict';
/**
 * E-E-A-T patch for all blog posts:
 *  1. Replace Organization author with Person (Jerome Liu) in Article JSON-LD
 *  2. Update dateModified to today (2026-08-30)
 *  3. Insert a visible byline element (name + role + date) into the article prose div
 *  4. Add the Curaçao licence to the Organisation JSON-LD in each blog post
 *
 * Run once:  node build/patch-eeat.js
 */
const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..');
const BLOGS_DIR = path.join(ROOT, 'blogs');
const TODAY     = '2026-08-30';

const OLD_AUTHOR_ORG = `"author": {
      "@type": "Organization",
      "name": "Nice88 Asia",
      "url": "https://www.nice88asia.com/"
    }`;

const NEW_AUTHOR_PERSON = `"author": {
      "@type": "Person",
      "name": "Jerome Liu",
      "url": "https://www.nice88asia.com/authors/jerome-liu/",
      "sameAs": "https://www.nice88asia.com/authors/jerome-liu/",
      "jobTitle": "Senior Casino Specialist & Content Writer"
    }`;

// Byline HTML injected right after the opening div of article-prose
const BYLINE_MARKER = '<div class="article-prose blog-prose">';
const BYLINE_HTML = `<div class="article-prose blog-prose">
              <p class="article-byline">By <a href="../../authors/jerome-liu/" rel="author" class="article-byline__name">Jerome Liu</a><span class="article-byline__sep">·</span><span class="article-byline__role">Senior Casino Specialist &amp; Content Writer</span><span class="article-byline__sep">·</span><span class="article-byline__updated">Updated <time datetime="${TODAY}">August 2026</time></span></p>`;

function patchBlogPost(filePath, slug) {
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Replace Organization author with Person
  if (html.includes('"@type": "Organization",\n      "name": "Nice88 Asia",\n      "url": "https://www.nice88asia.com/"\n    }')) {
    html = html.replace(
      '"@type": "Organization",\n      "name": "Nice88 Asia",\n      "url": "https://www.nice88asia.com/"\n    }',
      '"@type": "Person",\n      "name": "Jerome Liu",\n      "url": "https://www.nice88asia.com/authors/jerome-liu/",\n      "sameAs": "https://www.nice88asia.com/authors/jerome-liu/",\n      "jobTitle": "Senior Casino Specialist & Content Writer"\n    }'
    );
    changed = true;
  }

  // 2. Update dateModified to today
  const oldDateMod = /"dateModified": "20\d{2}-\d{2}-\d{2}"/;
  if (oldDateMod.test(html)) {
    html = html.replace(oldDateMod, `"dateModified": "${TODAY}"`);
    changed = true;
  }

  // 3. Insert visible byline (only if not already present)
  if (!html.includes('article-byline') && html.includes(BYLINE_MARKER)) {
    html = html.replace(BYLINE_MARKER, BYLINE_HTML);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
    return true;
  }
  return false;
}

function main() {
  const dirs = fs.readdirSync(BLOGS_DIR).filter(d =>
    fs.statSync(path.join(BLOGS_DIR, d)).isDirectory()
  );

  let updated = 0;
  let skipped = 0;

  for (const slug of dirs) {
    const htmlPath = path.join(BLOGS_DIR, slug, 'index.html');
    if (!fs.existsSync(htmlPath)) { skipped++; continue; }
    const did = patchBlogPost(htmlPath, slug);
    if (did) { updated++; console.log(`✓ ${slug}`); }
    else      { skipped++; console.log(`– ${slug} (no changes)`); }
  }

  console.log(`\nDone. Updated: ${updated}  Skipped: ${skipped}`);
}

main();
