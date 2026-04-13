# Nice88 Asia - Online Casino Website

A modular, SEO-optimised online casino website for Nice88 Asia with varied layouts and easy maintenance.

## Features

- **Modular structure**: Header and footer managed as partials – update once, applies everywhere
- **Varied layouts**: Hero sections, feature grids, card layouts, two-column content
- **SEO optimised**: Meta tags, canonical URLs, Open Graph, Schema.org (Organization, FAQPage, WebSite), sitemap.xml, robots.txt
- **Responsive**: Mobile-first design with hamburger menu

## Pages

| Page | Description |
|------|-------------|
| Home | Hero, features, game categories, promotions |
| Slots | 3000+ slot games, popular titles |
| Live Casino | Real dealers, HD streaming |
| Table Games | Blackjack, Baccarat, Roulette, Poker, Sic Bo |
| Sports Betting | Football, basketball, tennis, esports, predictions |
| Payments | Deposit & withdrawal methods |
| Mobile App | App download & mobile browser |
| About Us | Company story, mission, licensing |
| FAQ | Frequently asked questions |
| News | Casino tips, predictions, updates |

## Project Structure

```
Nice88cambodia/
├── config/
│   └── site-config.js    # Site-wide config (brand, nav, footer)
├── partials/
│   ├── header.html
│   └── footer.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── build/
│   └── build.js
├── news/
│   └── index.html
├── index.html
├── slots.html
├── live-casino.html
├── table-games.html
├── sports-betting.html
├── payments.html
├── mobile-app.html
├── about-us.html
├── faq.html
├── robots.txt
├── sitemap.xml
└── package.json
```

## Quick Start

1. **Install** (optional – for build):
   ```bash
   npm install
   ```

2. **Build** (injects partials into HTML):
   ```bash
   npm run build
   ```
   Output goes to `dist/`.

3. **Serve locally**:
   ```bash
   npm run serve
   ```
   Or open `dist/` files directly.

## Maintenance

- **Update nav/footer**: Edit `partials/header.html` and `partials/footer.html`
- **Site config**: Edit `config/site-config.js`
- **Add page**: Create HTML file with `<!-- INCLUDE: header -->` and `<!-- INCLUDE: footer -->`, then add to `build/build.js` pages array
- **Styling**: Edit `css/style.css`

## Reference

Layout and content inspired by [96M Casino](https://96magnum.com/).
