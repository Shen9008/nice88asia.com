# Nice88 Asia — image assets

All site visuals use **WebP** under kebab-case folders. The build (`npm run build`) copies and re-optimizes rasters into `dist/images/`.

## Folder layout

| Folder | Use |
|--------|-----|
| `hero-banner/` | Page hero backgrounds (about, faq, home, live-casino, mobile, payments, slot, sports-betting, table-games) |
| `home/explore-our-games/` | Homepage lobby category cards |
| `home/promotions-bonuses/` | Homepage promotion tiles |
| `slot/`, `live-casino/`, `sports/`, `table-games/`, `payments/`, `mobile/` | Product page game and feature tiles |
| `logo-nice88.webp` | Header and footer brand mark |
| `nice88-favicon.webp`, `apple-touch-icon.webp` | Favicon assets |
| `blog-default.webp` | Blog fallback image |

Legacy folders (`Hero Banner/`, `home/Explore Our Games/`) are migrated by `node build/sync-source-images.js` — do not add new assets there.

## HTML references

Use lowercase paths, e.g. `images/hero-banner/home.webp`, `images/slot/sweet-bonanza.webp`. Alt text is maintained in `build/image-alt-map.json` and applied with `node build/apply-image-alts.js`.

## Sizing (`build/optimize-images.js`)

| Profile | Max width | Quality |
|---------|-----------|---------|
| `hero-banner/` | 1680px | 78 |
| Cards / tiles | 720px | 82 |
| `logo-nice88` | 260px | 86 |
| Favicon | 64px | 92 |

## Maintenance

```bash
node build/sync-source-images.js   # PNG → WebP in kebab paths
node build/apply-image-alts.js     # Update alt text in HTML
npm run build
```
