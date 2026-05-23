'use strict';

const fs = require('fs');
const path = require('path');
const { injectInternalLinks } = require('./lib/inject-internal-links.js');

const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blogs');
const BLOGS_JSON_PATH = path.join(ROOT, 'assets/data/blogs.json');

// Match article body through </div></div> before the CTA (layout matches current blog templates)
const PROSE_REGEX =
  /<div class="article-prose(?: [^"]*)?">\s*([\s\S]*?)\s*<\/div>\s*<\/div>\s*\n\s*<section class="blog-article-cta"/;
const PROSE_REGEX_ALT =
  /<div class="article-prose(?: [^"]*)?">\s*([\s\S]*?)\s*<\/div>\s*<\/div>\s*\n\s*<section class="[^"]*blog-inline-cta[^"]*"/;

const STRIP_INTERNAL_LINKS_RE = /<a href="\/blogs\/[^"]+\/"[^>]*>([^<]+)<\/a>/g;
const STRIP_RELATED_READING_RE = /\n<p class="blog-related-reading">[\s\S]*?<\/p>\s*$/i;

function countInternalBlogLinks(html) {
  return (html.match(/href="\/blogs\//g) || []).length;
}

/** SEO: ensures at least one internal link when phrase injection finds no matches (seo-task.md internal linking). */
function appendRelatedReading(innerHtml, blogEntry, blogs) {
  if (!blogEntry?.related_posts?.length) return innerHtml;
  const parts = [];
  for (const rs of blogEntry.related_posts.slice(0, 4)) {
    const b = blogs.find((x) => x.slug === rs);
    if (!b) continue;
    const label = b.title || rs;
    parts.push(`<a href="/blogs/${rs}/">${label}</a>`);
  }
  if (parts.length === 0) return innerHtml;
  return (
    innerHtml +
    `\n<p class="blog-related-reading"><strong>Further reading on Nice88 Asia:</strong> ${parts.join('; ')}.</p>\n`
  );
}

function getArticlePaths() {
  const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
  const paths = [];
  for (const e of entries) {
    if (e.isDirectory()) {
      const indexPath = path.join(BLOG_DIR, e.name, 'index.html');
      if (fs.existsSync(indexPath)) {
        paths.push(indexPath);
      }
    }
  }
  return paths;
}

function loadBlogs() {
  const raw = fs.readFileSync(BLOGS_JSON_PATH, 'utf8');
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}

function backfillFile(filePath, blogs, force) {
  let content = fs.readFileSync(filePath, 'utf8');
  const slug = path.basename(path.dirname(filePath));

  const match = content.match(PROSE_REGEX) || content.match(PROSE_REGEX_ALT);
  if (!match) {
    return { status: 'skip', reason: 'could not find article-prose block' };
  }

  const originalInnerHtml = match[1];
  let innerHtml = originalInnerHtml;
  if (force) {
    innerHtml = innerHtml.replace(STRIP_INTERNAL_LINKS_RE, '$1');
    innerHtml = innerHtml.replace(STRIP_RELATED_READING_RE, '');
  }

  const blogEntry = blogs.find((b) => b.slug === slug);
  const relatedSlugs = new Set(blogEntry?.related_posts || []);
  let injected = injectInternalLinks(innerHtml, blogs, slug, { relatedSlugs });
  if (countInternalBlogLinks(injected) === 0) {
    injected = appendRelatedReading(injected, blogEntry, blogs);
  }

  if (injected === originalInnerHtml) {
    return { status: 'skip', reason: 'no links added' };
  }

  const newInner = match[0].replace(match[1], injected);
  const newContent = content.replace(match[0], newInner);

  fs.writeFileSync(filePath, newContent, 'utf8');
  return { status: 'updated' };
}

function run() {
  const force = process.argv.includes('--force');
  const blogs = loadBlogs();
  const paths = getArticlePaths();

  console.log(`Found ${paths.length} article(s), ${blogs.length} posts in blogs.json.${force ? ' (--force: re-injecting all)' : ''}`);

  let updated = 0;
  let skipped = 0;

  for (const p of paths) {
    const r = backfillFile(p, blogs, force);
    if (r.status === 'updated') {
      updated++;
      console.log(`  Updated: ${path.relative(ROOT, p)}`);
    } else {
      skipped++;
    }
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
}

run();
