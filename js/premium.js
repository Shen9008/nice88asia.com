/**
 * Nice88 Asia premium UI — blob tracking, data root scroll, form waves, reveals
 */
(function () {
  'use strict';

  var ease = 'cubic-bezier(0.25, 1, 0.5, 1)';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Organic mobile nav */
  var toggle = document.querySelector('.nav-organic__toggle');
  var links = document.getElementById('nav-organic-links');

  function setNavOpen(open) {
    if (!links || !toggle) return;
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-menu-open', open);
  }

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      setNavOpen(!links.classList.contains('is-open'));
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        setNavOpen(false);
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('is-open')) {
        setNavOpen(false);
        toggle.focus();
      }
    });
  }

  /* Active nav link */
  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  document.querySelectorAll('.nav-organic__link').forEach(function (link) {
    try {
      var abs = new URL(link.href, window.location.href);
      var lp = abs.pathname.replace(/\/+$/, '') || '/';
      var active = lp === path || (path === '/' && lp.endsWith('index.html'));
      if (link.getAttribute('href').indexOf('blogs') !== -1) {
        active = path.indexOf('/blogs') !== -1;
      }
      link.classList.toggle('nav-organic__link--active', active);
    } catch (e) {}
  });

  /* Capsule button liquid glow */
  document.querySelectorAll('.btn-capsule').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var r = btn.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width) * 100;
      var y = ((e.clientY - r.top) / r.height) * 100;
      btn.style.setProperty('--glow-x', x + '%');
      btn.style.setProperty('--glow-y', y + '%');
    });
  });

  /* Hero blob cursor tracking */
  var stage = document.querySelector('.hero-blob-stage');
  var blob = document.querySelector('.hero-blob');
  if (stage && blob && !reduced) {
    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      blob.style.setProperty('--blob-x', x);
      blob.style.setProperty('--blob-y', y);
    });
    stage.addEventListener('mouseleave', function () {
      blob.style.setProperty('--blob-x', 0);
      blob.style.setProperty('--blob-y', 0);
    });
  }

  /* Feature cards hover lock on touch */
  document.querySelectorAll('.feature-organic').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      document.querySelectorAll('.feature-organic').forEach(function (c) {
        c.classList.remove('is-active');
      });
      card.classList.add('is-active');
    });
  });

  /* Data root scroll lighting */
  var rootSection = document.querySelector('.data-root');
  if (rootSection) {
    var lines = rootSection.querySelectorAll('.data-root__line');
    var nodes = rootSection.querySelectorAll('.data-root__node');
    var counters = rootSection.querySelectorAll('[data-count]');

    function animateCounter(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      if (isNaN(target)) return;
      var start = 0;
      var dur = 1800;
      var t0 = performance.now();
      function step(now) {
        var p = Math.min((now - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(start + (target - start) * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var idx = parseInt(entry.target.getAttribute('data-index'), 10);
            lines.forEach(function (line, i) {
              if (i <= idx) line.classList.add('is-lit');
            });
            nodes.forEach(function (node, i) {
              if (i <= idx) {
                node.classList.add('is-visible');
                var c = node.querySelector('[data-count]');
                if (c && !c.dataset.done) {
                  c.dataset.done = '1';
                  animateCounter(c);
                }
              }
            });
          });
        },
        { threshold: 0.35, rootMargin: '0px 0px -5% 0px' }
      );
      nodes.forEach(function (node) {
        io.observe(node);
      });
    } else {
      lines.forEach(function (l) { l.classList.add('is-lit'); });
      nodes.forEach(function (n) { n.classList.add('is-visible'); });
      counters.forEach(animateCounter);
    }
  }

  /* Scroll reveals */
  if (!reduced && 'IntersectionObserver' in window) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      io.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* Terminal form — prevent default, mailto fallback */
  var form = document.querySelector('.terminal-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('[name="email"]');
      var msg = form.querySelector('[name="message"]');
      var body = encodeURIComponent((msg && msg.value) || '');
      var to = 'sparta4444@protonmail.com';
      var from = email && email.value ? encodeURIComponent(email.value) : '';
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('Nice88 Asia inquiry') + '&body=' + body + (from ? '%0A%0AFrom:%20' + from : '');
    });
  }
})();
