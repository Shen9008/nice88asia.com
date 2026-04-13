/**
 * Nice88 Asia - Site Configuration (nice88asia.com)
 */
const SITE_CONFIG = {
  name: 'Nice88 Asia',
  tagline: 'Trusted Online Casino & Sports Betting in Asia',
  baseUrl: 'https://www.nice88asia.com',
  locale: 'en',
  region: 'AS',
  currency: 'USD',
  supportEmail: 'support@nice88asia.com',
  social: {
    facebook: 'https://www.facebook.com/nice88asia',
    twitter: 'https://twitter.com/nice88asia',
    instagram: 'https://www.instagram.com/nice88asia',
    telegram: 'https://t.me/nice88asia'
  },
  nav: [
    { label: 'Slots', href: 'slots.html' },
    { label: 'Live Casino', href: 'live-casino.html' },
    { label: 'Table Games', href: 'table-games.html' },
    { label: 'Sports Betting', href: 'sports-betting.html' },
    { label: 'Payments', href: 'payments.html' },
    { label: 'Mobile App', href: 'mobile-app.html' },
    { label: 'About Us', href: 'about-us.html' },
    { label: 'FAQ', href: 'faq.html' },
    { label: 'News', href: 'news/index.html' }
  ],
  footerColumns: [
    {
      title: 'Casino',
      links: [
        { label: 'Slots', href: 'slots.html' },
        { label: 'Live Casino', href: 'live-casino.html' },
        { label: 'Table Games', href: 'table-games.html' }
      ]
    },
    {
      title: 'Sports & More',
      links: [
        { label: 'Sports Betting', href: 'sports-betting.html' },
        { label: 'Predictions', href: 'sports-betting.html#predictions' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Payments', href: 'payments.html' },
        { label: 'Mobile App', href: 'mobile-app.html' },
        { label: 'FAQ', href: 'faq.html' },
        { label: 'About Us', href: 'about-us.html' }
      ]
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SITE_CONFIG;
}
