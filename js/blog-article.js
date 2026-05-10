(function () {
  'use strict';

  var DATA_URL = '/assets/data/blogs.json';

  function sortBlogs(a, b) {
    var tb = new Date(b.synced_at || b.published_date || 0).getTime();
    var ta = new Date(a.synced_at || a.published_date || 0).getTime();
    if (tb !== ta) return tb - ta;
    return String(b.slug).localeCompare(String(a.slug));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var slug = document.body.dataset.blogSlug;
    if (!slug) return;

    fetch(DATA_URL, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('load failed');
        return res.json();
      })
      .then(function (blogs) {
        if (!Array.isArray(blogs)) return;

        blogs.sort(sortBlogs);

        var sidebarEl = document.getElementById('sidebar-posts');
        if (sidebarEl) {
          var others = blogs
            .filter(function (b) {
              return b.slug !== slug;
            })
            .sort(sortBlogs)
            .slice(0, 3);
          sidebarEl.innerHTML = others
            .map(function (b) {
              return (
                '<li class="blog-sidebar-list__item"><a href="/blogs/' +
                escapeHtml(b.slug) +
                '/" class="blog-sidebar-list__link">' +
                escapeHtml(b.title) +
                '</a></li>'
              );
            })
            .join('');
        }

        var relatedSlugs = (document.body.dataset.relatedSlugs || '')
          .split(',')
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean);

        var relatedList = document.querySelector('.blog-related-list');
        var relatedPh = document.querySelector('.blog-related-placeholder');
        if (!relatedList || !relatedPh) return;

        if (!relatedSlugs.length) {
          relatedPh.textContent = 'No related posts linked yet.';
          return;
        }

        var bySlug = new Map(blogs.map(function (b) {
          return [b.slug, b];
        }));
        var items = relatedSlugs
          .map(function (s) {
            return bySlug.get(s);
          })
          .filter(Boolean);

        if (!items.length) {
          relatedPh.textContent = 'Related posts unavailable.';
          return;
        }

        relatedPh.hidden = true;
        relatedList.hidden = false;
        relatedList.innerHTML = items
          .map(function (b) {
            return (
              '<li class="blog-related-list__item"><a href="/blogs/' +
              escapeHtml(b.slug) +
              '/" class="blog-related-list__link">' +
              escapeHtml(b.title) +
              '</a></li>'
            );
          })
          .join('');
      })
      .catch(function (err) {
        console.error(err);
      });
  });
})();
