'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

function copyRecursiveSync(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

/**
 * Copy blogs.json, sitemap, and blog HTML into dist/ for local preview (npm run serve).
 * No-op when dist/ does not exist yet.
 */
function syncBlogOutputToDist() {
  if (!fs.existsSync(DIST)) {
    console.log('dist/ not found — skipped copying blog output (run npm run build for a full deploy bundle).');
    return;
  }

  const blogsJsonSrc = path.join(ROOT, 'assets/data/blogs.json');
  const blogsJsonDist = path.join(DIST, 'assets/data/blogs.json');
  if (fs.existsSync(blogsJsonSrc)) {
    fs.mkdirSync(path.dirname(blogsJsonDist), { recursive: true });
    fs.copyFileSync(blogsJsonSrc, blogsJsonDist);
  }

  const sitemapSrc = path.join(ROOT, 'sitemap.xml');
  const sitemapDist = path.join(DIST, 'sitemap.xml');
  if (fs.existsSync(sitemapSrc)) {
    fs.copyFileSync(sitemapSrc, sitemapDist);
  }

  const blogsSrc = path.join(ROOT, 'blogs');
  const blogsDist = path.join(DIST, 'blogs');
  if (fs.existsSync(blogsSrc)) {
    for (const entry of fs.readdirSync(blogsSrc, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        copyRecursiveSync(path.join(blogsSrc, entry.name), path.join(blogsDist, entry.name));
      }
    }
  }

  const blogLoaderSrc = path.join(ROOT, 'js/blog-loader.js');
  const blogLoaderDist = path.join(DIST, 'js/blog-loader.js');
  if (fs.existsSync(blogLoaderSrc)) {
    fs.mkdirSync(path.dirname(blogLoaderDist), { recursive: true });
    fs.copyFileSync(blogLoaderSrc, blogLoaderDist);
  }

  console.log('Synced blog output to dist/ (blogs.json, articles, sitemap).');
}

module.exports = { syncBlogOutputToDist };

if (require.main === module) {
  syncBlogOutputToDist();
}
