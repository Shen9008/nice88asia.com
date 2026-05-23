# Nice88 Asia — image assets

Raster sources live here as **JPG / PNG / WebP**. The build (`npm run build`) converts every raster file under `images/` to **optimized WebP** in `dist/images/` (same folder structure, `.webp` extension).

## Naming

- **Hero banners** — `Hero Banner/<Page>.png` or `.jpg` → referenced in HTML as `images/Hero Banner/<Name>.webp` (URL-encoded spaces).
- **Sports betting hero** — use `Sports Betting.png` (HTML: `Sports Betting.webp`). Avoid the old typo filename `Sportsboook`.
- **Payments hero** — source file must be named **`Payment.png`** (not “Payments”) so the output matches `Payment.webp`.
- **Table games hero** — source **`Promo.png`** → `Promo.webp`.
- **Home cards** — `Home/Explore Our Games/` uses `Sports.png`, `Mobile.png`, etc., matching the `.webp` paths in `index.html`.
- **Promotions** — folder **`Promotions & Bonuses`** with `Cashback`, `Free Spin`, `Welcome Bonus` assets.
- **Logo** — `logo-nice88.png`; header/footer use `logo-nice88.webp` after build.

## Sizing (build)

Configured in `build/optimize-images.js`:

| Use | Max width | WebP quality |
|-----|-----------|----------------|
| `Hero Banner/` | 1680px | 78 |
| Other tiles / cards | 720px | 82 |
| `logo-nice88.png` | 260px | 86 |
| `nice88-favicon.webp` | 64px | 92 |

SVG favicon (`favicon.svg`) and `apple-touch-icon.png` are copied as-is after raster generation.
