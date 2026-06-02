'use strict';

require('./lib/load-env.js');

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { fetchPosts, getPostsSyncConfig, assertStrictSiteFilter } = require('./lib/fetch-posts.js');
const { normalizePost, validatePost } = require('./lib/normalize-post.js');
const { renderArticle } = require('./lib/render-article.js');
const { generateSitemap } = require('./lib/generate-sitemap.js');
const { syncBlogOutputToDist } = require('../build/sync-blog-output.js');

const ROOT = path.resolve(__dirname, '..');
const BLOGS_JSON_PATH = path.join(ROOT, 'assets/data/blogs.json');

const BLOGS_JSON_FIELDS = [
  'slug', 'title', 'meta_title', 'meta_description', 'focus_keyword',
  'category', 'search_intent', 'published_date', 'reading_time',
  'excerpt', 'placeholder_gradient', 'cover_image', 'related_posts', 'keywords',
  'cms_updated_at', 'content_hash', 'synced_at',
];

function parseArgs(argv) {
  const isAll = argv.includes('--all');
  const isRefresh = argv.includes('--refresh');
  const isForce = argv.includes('--force');
  const isDaily = argv.includes('--daily');
  let limit;
  const limitIdx = argv.indexOf('--limit');
  if (limitIdx !== -1 && argv[limitIdx + 1]) {
    const n = parseInt(argv[limitIdx + 1], 10);
    if (!Number.isNaN(n) && n > 0) limit = n;
  }
  return { isAll, isRefresh, isForce, isDaily, limit };
}

function sortBlogsForIndex(a, b) {
  const syncB = new Date(b.synced_at || b.published_date || 0).getTime();
  const syncA = new Date(a.synced_at || a.published_date || 0).getTime();
  if (syncB !== syncA) return syncB - syncA;
  const cu = new Date(b.cms_updated_at || 0).getTime() - new Date(a.cms_updated_at || 0).getTime();
  if (cu !== 0) return cu;
  return String(b.slug).localeCompare(String(a.slug));
}

function sortBlogsByLatestSyncFirst(a, b) {
  return sortBlogsForIndex(a, b);
}

function hashContent(content) {
  const raw = typeof content === 'string' ? content : JSON.stringify(content || '');
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function toBlogsEntry(normalized, raw, syncedAt) {
  const entry = {};
  for (const k of BLOGS_JSON_FIELDS) {
    if (normalized[k] !== undefined) entry[k] = normalized[k];
  }
  entry.cms_updated_at = raw.updatedAt || raw.publishedAt || entry.cms_updated_at || '';
  entry.content_hash = hashContent(raw.content);
  entry.synced_at = syncedAt || new Date().toISOString();
  return entry;
}

function getRelatedSlugs(blogs, currentSlug, opts = {}, limit = 3) {
  const searchIntent = (opts.searchIntent || 'informational').toLowerCase();
  const category = (opts.category || '').toLowerCase();
  const others = blogs.filter((b) => b.slug !== currentSlug);

  const sameIntent = others.filter((b) => (b.search_intent || '').toLowerCase() === searchIntent).sort(sortBlogsByLatestSyncFirst);
  const sameIntentSlugs = new Set(sameIntent.map((b) => b.slug));
  const sameCategory = others
    .filter((b) => !sameIntentSlugs.has(b.slug) && category && (b.category || '').toLowerCase() === category)
    .sort(sortBlogsByLatestSyncFirst);
  const sameCategorySlugs = new Set(sameCategory.map((b) => b.slug));
  const rest = others
    .filter((b) => !sameIntentSlugs.has(b.slug) && !sameCategorySlugs.has(b.slug))
    .sort(sortBlogsByLatestSyncFirst);

  const merged = [...sameIntent, ...sameCategory, ...rest];
  return merged.slice(0, limit).map((b) => b.slug);
}

function sanitizeRelatedPosts(related, allowedSlugs) {
  if (!Array.isArray(related)) return [];
  return related.filter((s) => allowedSlugs.has(s));
}

function loadBlogsJson() {
  try {
    const raw = fs.readFileSync(BLOGS_JSON_PATH, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveBlogsJson(blogs) {
  const json = JSON.stringify(blogs, null, 2);
  fs.writeFileSync(BLOGS_JSON_PATH, json + '\n', 'utf8');
}

function postSlug(raw) {
  return raw.slug || raw.documentId || '';
}

function postNeedsRefresh(raw, existing) {
  if (!existing) return false;
  const cmsUpdated = raw.updatedAt || raw.publishedAt || '';
  const newHash = hashContent(raw.content);
  if (existing.content_hash && newHash !== existing.content_hash) return true;
  if (cmsUpdated && existing.cms_updated_at && cmsUpdated !== existing.cms_updated_at) return true;
  if (!existing.content_hash || !existing.cms_updated_at) return true;
  return false;
}

function buildWorklist(strapiPosts, blogs, flags) {
  const { isAll, isRefresh, isForce, isDaily, limit } = flags;
  const knownBySlug = new Map(blogs.map((b) => [b.slug, b]));
  const doRefresh = isForce || isRefresh || isDaily;

  const newPosts = strapiPosts
    .filter((p) => {
      const slug = postSlug(p);
      return slug && !knownBySlug.has(slug);
    })
    .sort((a, b) => new Date(a.publishedAt || 0) - new Date(b.publishedAt || 0));

  const worklist = [];
  const seen = new Set();

  if (isForce) {
    const all = [...strapiPosts].sort(
      (a, b) => new Date(a.publishedAt || 0) - new Date(b.publishedAt || 0),
    );
    const capped = limit ? all.slice(0, limit) : all;
    for (const raw of capped) {
      const slug = postSlug(raw);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      worklist.push({ raw, action: knownBySlug.has(slug) ? 'update' : 'create' });
    }
    return worklist;
  }

  let maxNew;
  if (isDaily) {
    maxNew = limit ?? 1;
  } else if (isAll) {
    maxNew = limit ?? newPosts.length;
  } else if (isRefresh) {
    maxNew = limit ?? newPosts.length;
  } else {
    maxNew = limit ?? 1;
  }

  for (const raw of newPosts.slice(0, maxNew)) {
    const slug = postSlug(raw);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    worklist.push({ raw, action: 'create' });
  }

  if (doRefresh) {
    for (const raw of strapiPosts) {
      const slug = postSlug(raw);
      if (!slug || seen.has(slug) || !knownBySlug.has(slug)) continue;
      if (postNeedsRefresh(raw, knownBySlug.get(slug))) {
        seen.add(slug);
        worklist.push({ raw, action: 'update' });
      }
    }
  }

  return worklist;
}

async function run() {
  const flags = parseArgs(process.argv.slice(2));
  const cfg = getPostsSyncConfig();
  assertStrictSiteFilter(cfg);

  const apiUrl = process.env.STRAPI_API_URL || 'http://localhost:1337/api';

  console.log('Fetching posts from API...');
  const strapiPosts = await fetchPosts({ baseUrl: apiUrl });

  let blogs = loadBlogsJson();
  const worklist = buildWorklist(strapiPosts, blogs, flags);

  if (worklist.length === 0) {
    blogs.sort(sortBlogsForIndex);
    saveBlogsJson(blogs);
    console.log('No articles to publish or refresh. blogs.json sorted by latest sync.');
    return;
  }

  const creates = worklist.filter((w) => w.action === 'create').length;
  const updates = worklist.filter((w) => w.action === 'update').length;
  console.log(`Processing ${worklist.length} article(s) (${creates} new, ${updates} refresh)...`);

  for (const { raw, action } of worklist) {
    const slug = postSlug(raw);
    const related = getRelatedSlugs(blogs, slug, {
      searchIntent: raw.search_intent,
      category: raw.category,
    });

    const normalized = normalizePost(raw, { relatedPosts: related });
    validatePost(normalized);

    console.log(`  - [${action}] ${normalized.title} (${slug})`);
    renderArticle(normalized, { blogs });

    const syncedAt = new Date().toISOString();
    const entry = toBlogsEntry(normalized, raw, syncedAt);

    const idx = blogs.findIndex((b) => b.slug === slug);
    if (idx >= 0) {
      blogs[idx] = entry;
    } else {
      blogs.push(entry);
    }
  }

  const allowedSlugs = new Set(blogs.map((b) => b.slug));
  blogs = blogs.map((b) => ({
    ...b,
    related_posts: sanitizeRelatedPosts(b.related_posts, allowedSlugs),
  }));

  blogs.sort(sortBlogsForIndex);
  saveBlogsJson(blogs);
  generateSitemap();
  syncBlogOutputToDist();
  console.log('Done. blogs.json and sitemap.xml updated.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
