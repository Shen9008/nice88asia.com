'use strict';

/**
 * Rebuilds blogs/{slug}/index.html shell from article.template.html while preserving
 * the existing <div class="article-prose blog-prose"> inner HTML (TOC + body).
 * Run after template/CSS layout changes: node scripts/rebuild-blog-pages.js
 */

const fs = require('fs');
const path = require('path');
const { renderArticle } = require('./lib/render-article.js');

const ROOT = path.resolve(__dirname, '..');
const BLOGS_JSON = path.join(ROOT, 'assets/data/blogs.json');
const BLOG_DIR = path.join(ROOT, 'blogs');

function extractArticleProseInner(html) {
  const openTag = '<div class="article-prose blog-prose">';
  const start = html.indexOf(openTag);
  if (start === -1) return null;
  let i = start + openTag.length;
  let depth = 1;
  while (i < html.length && depth > 0) {
    const close = html.indexOf('</div>', i);
    if (close === -1) return null;
    const open = html.indexOf('<div', i);
    if (open !== -1 && open < close) {
      depth++;
      i = open + 4;
    } else {
      depth--;
      if (depth === 0) {
        return html.slice(start + openTag.length, close).trim();
      }
      i = close + 6;
    }
  }
  return null;
}

function entryToNormalized(entry) {
  const d = entry.published_date || '';
  let published_date_formatted = '';
  if (d) {
    try {
      published_date_formatted = new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (_) {
      /* ignore */
    }
  }
  const updated = entry.synced_at ? String(entry.synced_at).slice(0, 10) : d;
  return {
    slug: entry.slug,
    title: entry.title,
    meta_title: entry.meta_title || entry.title,
    meta_description: entry.meta_description || entry.excerpt || '',
    focus_keyword: entry.focus_keyword || entry.title,
    category: entry.category || 'Informational',
    published_date: d,
    published_date_formatted,
    updated_date_iso: updated || d,
    reading_time: entry.reading_time || '5 min read',
    excerpt: entry.excerpt || '',
    placeholder_gradient:
      entry.placeholder_gradient ||
      'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.05) 55%, #0a0a0a 100%)',
    related_posts: entry.related_posts || [],
    keywords: entry.keywords || [],
    toc_json: [],
    content: '',
    faq: [],
  };
}

function run() {
  const raw = fs.readFileSync(BLOGS_JSON, 'utf8');
  const blogs = JSON.parse(raw);
  if (!Array.isArray(blogs)) {
    console.error('blogs.json is not an array');
    process.exit(1);
  }

  for (const entry of blogs) {
    const slug = entry.slug;
    if (!slug) continue;
    const indexPath = path.join(BLOG_DIR, slug, 'index.html');
    if (!fs.existsSync(indexPath)) {
      console.warn('Skip (missing file):', slug);
      continue;
    }
    const html = fs.readFileSync(indexPath, 'utf8');
    let inner = extractArticleProseInner(html);
    if (inner == null) {
      console.warn('Skip (no article prose block):', slug);
      continue;
    }
    inner = inner.replace(/class="blog-toc feature-card"/g, 'class="blog-toc"');
    inner = inner.replace(
      /<h2 id="blog-toc-heading" class="blog-toc__title">Table of Contents<\/h2>/gi,
      '<h2 id="blog-toc-heading" class="blog-toc__title">On this page</h2>'
    );
    const normalized = entryToNormalized(entry);
    renderArticle(normalized, { articleProseInner: inner, blogs });
    console.log('Rebuilt:', slug);
  }
  console.log('Done.');
}

run();
