document.addEventListener('DOMContentLoaded', function() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.btn').forEach(function (btn) {
    if (btn.querySelector('.btn__label')) return;
    var span = document.createElement('span');
    span.className = 'btn__label';
    while (btn.firstChild) span.appendChild(btn.firstChild);
    btn.appendChild(span);
  });

  document.querySelectorAll('.promo-banner__cta').forEach(function (cta) {
    if (cta.querySelector('.promo-banner__cta-label')) return;
    var label = document.createElement('span');
    label.className = 'promo-banner__cta-label';
    while (cta.firstChild) label.appendChild(cta.firstChild);
    cta.appendChild(label);
  });

  function initTypewriterHeadings() {
    if (prefersReducedMotion) return;
    var selectors = 'h1.hero__title, h1.section__title, h2.section__title, h2.listicle__title';
    document.querySelectorAll(selectors).forEach(function (heading) {
      if (heading.dataset.typewriterInit === '1') return;
      heading.dataset.typewriterInit = '1';
      var full = heading.textContent.trim();
      if (!full) return;
      heading.setAttribute('aria-label', full);
      heading.textContent = '';
      heading.classList.add('typewriter-heading');
      var textSpan = document.createElement('span');
      textSpan.className = 'typewriter-heading__text';
      textSpan.setAttribute('aria-hidden', 'true');
      var cursor = document.createElement('span');
      cursor.className = 'typewriter-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      heading.appendChild(textSpan);
      heading.appendChild(cursor);

      var i = 0;
      var delayMs = 28;
      var started = false;

      function tick() {
        if (i <= full.length) {
          textSpan.textContent = full.slice(0, i);
          i += 1;
          window.setTimeout(tick, delayMs);
        } else {
          cursor.classList.add('typewriter-cursor--done');
        }
      }

      function start() {
        if (started) return;
        started = true;
        tick();
      }

      if (heading.closest('.hero')) {
        start();
        return;
      }

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              start();
              io.disconnect();
            }
          });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
        io.observe(heading);
      } else {
        start();
      }
    });
  }

  initTypewriterHeadings();

  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav');
  const navOverlay = document.querySelector('.nav-overlay');

  function openMobileMenu() {
    if (nav) nav.classList.add('nav--open');
    if (navOverlay) navOverlay.classList.add('is-open');
    document.body.classList.add('nav-open');
    document.body.style.overflow = 'hidden';
    if (mobileMenuToggle) {
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
      mobileMenuToggle.setAttribute('aria-label', 'Close menu');
    }
  }

  function closeMobileMenu() {
    if (nav) nav.classList.remove('nav--open');
    if (navOverlay) navOverlay.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    document.body.style.overflow = '';
    if (mobileMenuToggle) {
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      mobileMenuToggle.setAttribute('aria-label', 'Open menu');
    }
  }

  if (mobileMenuToggle && nav) {
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileMenuToggle.addEventListener('click', function() {
      nav.classList.contains('nav--open') ? closeMobileMenu() : openMobileMenu();
    });
  }
  if (navOverlay) navOverlay.addEventListener('click', closeMobileMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) closeMobileMenu();
  });

  document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 992) closeMobileMenu();
    });
  });

  document.querySelectorAll('.faq-item__question').forEach(q => {
    q.addEventListener('click', function() {
      const item = this.closest('.faq-item');
      const wasActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId !== '#') {
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
