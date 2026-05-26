(function () {
  'use strict';

  /* Root-relative so /blogs and /blogs/ both resolve when serving from site root (e.g. npm run serve dist) */
  var DATA_URL = '/assets/data/blogs.json';
  /* Source: images/blog-default.webp (build copies optimize output to dist/images/) */
  var DEFAULT_LIST_IMAGE = '/images/blog-default.webp';
  var PAGE_SIZE = 6;
  /** Hard cap so URLs and the pager never exceed page 99 (compact hub). */
  var MAX_PAGE = 99;

  function sortBlogs(a, b) {
    var pd = new Date(b.published_date || 0).getTime() - new Date(a.published_date || 0).getTime();
    if (pd !== 0) return pd;
    var cu = new Date(b.cms_updated_at || 0).getTime() - new Date(a.cms_updated_at || 0).getTime();
    if (cu !== 0) return cu;
    var sy = new Date(b.synced_at || 0).getTime() - new Date(a.synced_at || 0).getTime();
    if (sy !== 0) return sy;
    return String(b.slug).localeCompare(String(a.slug));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatListDate(iso) {
    if (!iso) return '';
    try {
      return new Date(String(iso) + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return '';
    }
  }

  function readPageFromUrl() {
    var raw = parseInt(String(new URLSearchParams(window.location.search).get('page') || '1'), 10);
    if (isNaN(raw) || raw < 1) return 1;
    if (raw > MAX_PAGE) return MAX_PAGE;
    return raw;
  }

  function pageHref(page) {
    var u = new URL(window.location.href);
    if (page <= 1) u.searchParams.delete('page');
    else u.searchParams.set('page', String(page));
    return u.pathname + u.search + u.hash;
  }

  /**
   * Compact window with ellipses — never lists all 99 numbers in a long row.
   */
  function compactPageSequence(current, total) {
    var delta = 2;
    var range = [];
    var i;
    var last = 0;
    var out = [];
    for (i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }
    for (i = 0; i < range.length; i++) {
      if (last && range[i] - last > 1) out.push(null);
      out.push(range[i]);
      last = range[i];
    }
    return out;
  }

  /**
   * Resolved cover URL for listing cards, or empty when missing (caller uses DEFAULT_LIST_IMAGE).
   * Supports blogs.json `cover_image` plus common API-style keys and Strapi media shapes.
   */
  function rawListingImageUrl(b) {
    var candidates = [
      b.cover_image,
      b.coverImage,
      b.featured_image,
      b.featuredImage,
      b.thumbnail_url,
      b.thumbnail,
      b.image,
      b.hero_image,
      b.heroImage,
    ];
    for (var i = 0; i < candidates.length; i++) {
      var v = candidates[i];
      var url = '';
      if (v == null || v === '') continue;
      if (typeof v === 'string') {
        url = v.trim();
      } else if (typeof v === 'object') {
        if (v.url) url = String(v.url).trim();
        else {
          var d = v.data;
          if (d) {
            var entry = Array.isArray(d) ? d[0] : d;
            if (entry) {
              var a = entry.attributes || entry;
              if (a && a.url) url = String(a.url).trim();
              else if (a && a.formats) {
                var f = a.formats.large || a.formats.medium || a.formats.small;
                if (f && f.url) url = String(f.url).trim();
              }
            }
          }
        }
      }
      if (url) return url;
    }
    return '';
  }

  function renderBlogCard(b) {
    var imgSrc = rawListingImageUrl(b);
    if (!imgSrc) imgSrc = DEFAULT_LIST_IMAGE;
    imgSrc = escapeHtml(imgSrc);
    var dateStr = formatListDate(b.published_date);
    var metaHtml = '';
    if (dateStr) {
      metaHtml +=
        '<time class="blog-card__date" datetime="' +
        escapeHtml(String(b.published_date || '')) +
        '">' +
        escapeHtml(dateStr) +
        '</time>';
    }
    if (b.reading_time) {
      if (metaHtml) metaHtml += '<span class="blog-card__meta-sep" aria-hidden="true">·</span>';
      metaHtml += '<span class="blog-card__read">' + escapeHtml(b.reading_time) + '</span>';
    }
    var categoryLabel = (b.category && String(b.category).trim()) || '';
    return (
      '<article class="blog-card">' +
      '<a href="/blogs/' +
      escapeHtml(b.slug) +
      '/" class="blog-card__link">' +
      '<div class="blog-card__media">' +
      (categoryLabel
        ? '<span class="blog-card__category">' + escapeHtml(categoryLabel) + '</span>'
        : '') +
      '<img src="' +
      imgSrc +
      '" alt="' +
      escapeHtml(b.title) +
      '" class="blog-card__img" width="640" height="400" loading="lazy" decoding="async">' +
      '</div>' +
      '<div class="blog-card__body">' +
      (metaHtml ? '<p class="blog-card__meta">' + metaHtml + '</p>' : '') +
      '<h2 class="blog-card__title">' +
      escapeHtml(b.title) +
      '</h2>' +
      '<p class="blog-card__excerpt">' +
      escapeHtml(b.excerpt || '') +
      '</p>' +
      '<span class="blog-card__cta">Read article</span>' +
      '</div></a></article>'
    );
  }

  function buildPaginationMarkup(current, total) {
    var seq = compactPageSequence(current, total);
    var parts = [];
    var p;
    parts.push('<div class="blog-pagination__inner">');
    parts.push('<ul class="blog-pagination__list" role="list">');

    parts.push('<li class="blog-pagination__item">');
    if (current > 1) {
      parts.push(
        '<a href="' +
          escapeHtml(pageHref(current - 1)) +
          '" class="blog-pagination__btn blog-pagination__btn--prev" data-page="' +
          (current - 1) +
          '">Previous</a>'
      );
    } else {
      parts.push(
        '<span class="blog-pagination__btn blog-pagination__btn--prev blog-pagination__btn--disabled" aria-disabled="true">Previous</span>'
      );
    }
    parts.push('</li>');

    for (var i = 0; i < seq.length; i++) {
      p = seq[i];
      parts.push('<li class="blog-pagination__item blog-pagination__item--num">');
      if (p === null) {
        parts.push('<span class="blog-pagination__gap" aria-hidden="true">…</span>');
      } else if (p === current) {
        parts.push(
          '<span class="blog-pagination__num blog-pagination__num--current" aria-current="page">' +
            p +
            '</span>'
        );
      } else {
        parts.push(
          '<a href="' +
            escapeHtml(pageHref(p)) +
            '" class="blog-pagination__num" data-page="' +
            p +
            '">' +
            p +
            '</a>'
        );
      }
      parts.push('</li>');
    }

    parts.push('<li class="blog-pagination__item">');
    if (current < total) {
      parts.push(
        '<a href="' +
          escapeHtml(pageHref(current + 1)) +
          '" class="blog-pagination__btn blog-pagination__btn--next" data-page="' +
          (current + 1) +
          '">Next</a>'
      );
    } else {
      parts.push(
        '<span class="blog-pagination__btn blog-pagination__btn--next blog-pagination__btn--disabled" aria-disabled="true">Next</span>'
      );
    }
    parts.push('</li>');

    parts.push('</ul>');
    parts.push(
      '<p class="blog-pagination__status">Page ' + current + ' of ' + total + '</p>'
    );
    parts.push('</div>');
    return parts.join('');
  }

  function scrollBlogListIntoView() {
    var el = document.querySelector('.blog-posts-wrap');
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.getElementById('blog-posts-grid');
    var nav = document.getElementById('blog-pagination');
    var truncatedEl = document.getElementById('blog-pagination-truncated');
    if (!grid) return;

    fetch(DATA_URL, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('load failed');
        return res.json();
      })
      .then(function (blogs) {
        if (!Array.isArray(blogs) || blogs.length === 0) {
          grid.innerHTML =
            '<p class="blog-grid__empty">New guides and updates land here — check back soon.</p>';
          if (nav) {
            nav.hidden = true;
            nav.innerHTML = '';
          }
          if (truncatedEl) truncatedEl.hidden = true;
          return;
        }

        blogs.sort(sortBlogs);

        var maxItems = MAX_PAGE * PAGE_SIZE;
        var listing = blogs.length > maxItems ? blogs.slice(0, maxItems) : blogs;
        var isTruncated = blogs.length > maxItems;
        var totalPages = Math.max(1, Math.ceil(listing.length / PAGE_SIZE));

        if (isTruncated && truncatedEl) {
          truncatedEl.hidden = false;
          truncatedEl.textContent =
            'Showing the ' +
            String(maxItems) +
            ' most recent articles (up to ' +
            String(MAX_PAGE) +
            ' pages).';
        } else if (truncatedEl) {
          truncatedEl.hidden = true;
          truncatedEl.textContent = '';
        }

        function renderForPage(page) {
          var requested = typeof page === 'number' ? page : readPageFromUrl();
          var current = Math.min(Math.max(requested, 1), totalPages);

          if (requested !== current) {
            history.replaceState({ blogPage: current }, '', pageHref(current));
          }

          var start = (current - 1) * PAGE_SIZE;
          var slice = listing.slice(start, start + PAGE_SIZE);
          grid.innerHTML = slice.map(renderBlogCard).join('');

          if (nav) {
            if (totalPages <= 1) {
              nav.hidden = true;
              nav.innerHTML = '';
            } else {
              nav.hidden = false;
              nav.innerHTML = buildPaginationMarkup(current, totalPages);
            }
          }

          return current;
        }

        var fromUrl = readPageFromUrl();
        var initial = Math.min(Math.max(fromUrl, 1), totalPages);
        if (initial !== fromUrl) {
          history.replaceState({ blogPage: initial }, '', pageHref(initial));
        }
        renderForPage(initial);

        if (nav && totalPages > 1 && !nav._blogPageBound) {
          nav._blogPageBound = true;
          nav.addEventListener('click', function (e) {
            var a = e.target && e.target.closest && e.target.closest('a[data-page]');
            if (!a) return;
            e.preventDefault();
            var p = parseInt(a.getAttribute('data-page'), 10);
            if (isNaN(p)) return;
            p = Math.min(Math.max(p, 1), totalPages);
            history.pushState({ blogPage: p }, '', pageHref(p));
            renderForPage(p);
            scrollBlogListIntoView();
          });
        }

        window.addEventListener('popstate', function () {
          renderForPage();
        });
      })
      .catch(function (err) {
        console.error(err);
        grid.innerHTML =
          '<p class="blog-grid__empty">Could not load articles. Please try again later.</p>';
        if (nav) {
          nav.hidden = true;
          nav.innerHTML = '';
        }
        if (truncatedEl) truncatedEl.hidden = true;
      });
  });
})();
