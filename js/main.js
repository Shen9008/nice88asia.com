document.addEventListener('DOMContentLoaded', function() {
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
