/**
 * EEAT-focused content rewrite for Nice88 Asia.
 * Run: node build/apply-content-rewrite.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function read(f) {
  return fs.readFileSync(path.join(root, f), 'utf8');
}
function write(f, html) {
  fs.writeFileSync(path.join(root, f), html, 'utf8');
}

function patch(file, pairs) {
  let html = read(file);
  let n = 0;
  for (const [from, to] of pairs) {
    if (!html.includes(from)) {
      console.warn(`  ⚠ ${file}: not found: ${from.slice(0, 70)}…`);
      continue;
    }
    html = html.split(from).join(to);
    n++;
  }
  write(file, html);
  console.log(`✓ ${file} (${n} replacements)`);
}

// —— INDEX ——
patch('index.html', [
  ['<h2 class="section__title">Why people stick with Nice88</h2>', '<h2 class="section__title">Why players choose Nice88 Asia</h2>'],
  ['We’ve been at this since 2009 — not to show off, but so you can log in, play what you like, and get on with your day.',
    'Since 2009, <strong>Nice88</strong> has focused on fair games, clear rules, reliable payouts, and support that answers. That is the foundation of the official <strong>Nice88 online casino</strong> at nice88asia.com.'],
  ['<h3 class="feature-block__title">Safe & Sound</h3>', '<h3 class="feature-block__title">Licensed &amp; independently tested</h3>'],
  ['We take security seriously — licensed operation, strong encryption, and games checked by independent labs like <a href="https://www.ecogra.org" target="_blank" rel="noopener noreferrer">eCOGRA</a> and <a href="https://www.itechlabs.com" target="_blank" rel="noopener noreferrer">iTech Labs</a>. Less worry, more play.',
    'Nice88 runs on licensed infrastructure with SSL encryption, segregated balances, and RNG games tested by <a href="https://www.ecogra.org" target="_blank" rel="noopener noreferrer">eCOGRA</a>, <a href="https://www.itechlabs.com" target="_blank" rel="noopener noreferrer">iTech Labs</a>, and <a href="https://www.gli.com" target="_blank" rel="noopener noreferrer">GLI</a>. RTP is displayed in-game where providers publish it.'],
  ['<h3 class="feature-block__title">Something for Everyone</h3>', '<h3 class="feature-block__title">One wallet, full product range</h3>'],
  ['Slots one minute, live baccarat the next, a quick flutter on football or esports after — whatever tonight feels like, there’s a seat or a spin with your name on it.',
    '<a href="slots.html">Nice88 slots</a>, <a href="live-casino.html">live casino</a>, <a href="table-games.html">table games</a>, and <a href="sports-betting.html">sports betting</a> share one balance — switch products without extra logins.'],
  ['<h3 class="feature-block__title">Payments That Work for You</h3>', '<h3 class="feature-block__title">Asia-ready payments</h3>'],
  ['E-wallets, bank transfer, QR where it’s available, plus crypto — pick what suits you. From $10 up, no sneaky processing fees. Cash-outs usually land within a couple of days; crypto and e-wallets are often much faster.',
    'Deposit from $10 via e-wallets, bank transfer, QR, or crypto (USDT, Bitcoin). E-wallet and crypto deposits usually credit quickly; withdrawals typically process in 24–48 hours after verification. Details: <a href="payments.html">payments</a>.'],
  ['<h3 class="feature-block__title">Play Wherever You Are</h3>', '<h3 class="feature-block__title">Desktop &amp; mobile parity</h3>'],
  ['Sofa, commute, lunch break — open the site in your browser and you’re in. Prefer an app? Grab ours for iOS or Android and get notifications when it matters.',
    'Play at nice88asia.com in your browser or via the Nice88 app on iOS and Android — same account, lobby, and cashier on every device.'],
  ['<h2 class="section__title">Explore the lobby</h2>', '<h2 class="section__title">Nice88 casino products at a glance</h2>'],
  ['Over 3,500 titles — jump in wherever you like. New stuff drops all the time, so there’s always a reason to peek back in.',
    'Browse 3,500+ titles from Pragmatic Play, Evolution, Microgaming, PG Soft, and more. New slots, live tables, and sports markets are added weekly.'],
  ['<h2 class="section__title">Megaways picks — thousands of ways to win</h2>', '<h2 class="section__title">Featured Nice88 Megaways slots</h2>'],
  ['<h2 class="section__title">Jackpots that keep climbing</h2>', '<h2 class="section__title">Progressive jackpots at Nice88</h2>'],
  ['<h2 class="section__title" id="promotions">Promos & perks</h2>', '<h2 class="section__title" id="promotions">Nice88 bonuses &amp; promotions</h2>'],
  ['A little extra on the house — welcome offers, spins, and cashback — because regular play deserves a nod now and then.',
    'Welcome packages, free spins, and cashback rotate through the year. Every offer has published terms — read wagering rules before opting in.'],
  ['<h2 class="steps__title">Four steps — you’re in</h2>', '<h2 class="steps__title">How to start at Nice88 Asia</h2>'],
  ['Never joined us before? It’s quick — most people are playing before their coffee goes cold.',
    'Registration takes minutes. You must be 18+ and play only where online gambling is legal in your jurisdiction.'],
  ['Pick a username, add your details, confirm your email — that’s the boring part done.',
    'Create your account, confirm your email, and complete profile details for smoother verification on first withdrawal.'],
  ['From $10 — e-wallet, bank, or crypto. Money usually shows up fast so you’re not staring at a loading screen.',
    'Open Cashier, choose e-wallet, bank transfer, or crypto, and deposit from $10. Processing times vary by method.'],
  ['Unlock the welcome pack — 100% up to $200 plus 50 free spins — and stretch that first session a bit further.',
    'Opt into the welcome offer if eligible (100% up to $200 + 50 free spins). Bonus funds carry wagering requirements stated in the promotion.'],
  ['Head to <a href="slots.html">slots</a>, <a href="live-casino.html">live tables</a>, <a href="table-games.html">classics</a>, or the <a href="sports-betting.html">sportsbook</a> — tonight’s yours.',
    'Explore <a href="slots.html">Nice88 slots</a>, <a href="live-casino.html">live casino</a>, <a href="table-games.html">tables</a>, or <a href="sports-betting.html">sports</a>. Set deposit limits in your account for extra control.'],
]);

const indexSeo = `    <section class="section" id="seo-content">
        <div class="container">
            <div class="content-page__content">
                <h2>What is Nice88? Official brand &amp; Nice88 Asia</h2>
                <p><strong>Nice88</strong> and <strong>Nice88 Asia</strong> refer to the same licensed online casino and sportsbook brand. The official website is <strong>nice88asia.com</strong> — use it for <strong>Nice88 login</strong>, deposits, and gameplay. Searches for <strong>nice88asia</strong>, <strong>Nice88 casino</strong>, or <strong>Nice88 online casino</strong> should lead here; unofficial mirrors may not reflect current promotions or security standards.</p>

                <h2>Nice88 products: slots, live casino, tables &amp; sports</h2>
                <p>The <strong>Nice88 casino</strong> lobby is built for players who want depth in one account. <strong>Nice88 slots</strong> number 3,000+ titles including Sweet Bonanza, Gates of Olympus, Starlight Princess, and Mega Moolah, plus Megaways and high-RTP games with published return rates. The <strong>Nice88 live casino</strong> streams 150+ tables from Evolution, SA Gaming, and Pragmatic Play — baccarat, blackjack, roulette, Dragon Tiger, and game shows such as Crazy Time. RNG <a href="table-games.html">table games</a> add blackjack, baccarat, and roulette variants with transparent house edges. <strong>Nice88 sports betting</strong> covers 40+ sports with pre-match and in-play markets, Asian handicap, and esports.</p>

                <h3>EEAT: experience, expertise, authority &amp; trust</h3>
                <ul style="margin:0 0 1rem 1.25rem;color:var(--text-secondary);">
                    <li><strong>Experience</strong> — operating since 2009 with a product mix shaped by Asian player preferences (live baccarat, football, mobile play).</li>
                    <li><strong>Expertise</strong> — games from tier-one studios; in-game RTP and rules from licensed suppliers; educational content on volatility, house edge, and bankroll management.</li>
                    <li><strong>Authoritativeness</strong> — licensed platform, published policies, third-party testing via <a href="https://www.ecogra.org" target="_blank" rel="noopener noreferrer">eCOGRA</a> / <a href="https://www.itechlabs.com" target="_blank" rel="noopener noreferrer">iTech Labs</a>, transparent <a href="about-us.html">About Us</a> information.</li>
                    <li><strong>Trustworthiness</strong> — SSL, segregated funds, 24/7 support, clear bonus terms, responsible-play tools, and 18+ verification.</li>
                </ul>

                <h3>Nice88 payments &amp; withdrawals</h3>
                <p>Fund your wallet from $10 using e-wallets, bank transfer, QR, or cryptocurrency. Withdrawals are processed after standard identity checks on first cash-out. Timelines depend on method — crypto and e-wallets are often fastest. See the <a href="payments.html">Nice88 payments</a> page.</p>

                <h3>Nice88 mobile: app &amp; browser</h3>
                <p>Access the same library on phone or tablet via mobile browser or the dedicated app. <strong>Nice88 login</strong> credentials work across devices. See the <a href="mobile-app.html">mobile guide</a>.</p>

                <h3>Bonuses: understand the terms</h3>
                <p>Welcome and reload offers, including match bonuses and free spins, are subject to wagering requirements, game weighting, and expiry dates. Promotions extend play — they are not guaranteed profit. Check active offers in your account before depositing.</p>

                <h3>Responsible gambling</h3>
                <p>Gambling should remain entertainment. Use deposit limits, session reminders, cool-off, and self-exclusion in your account. External help: <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer">BeGambleAware</a>, <a href="https://www.gamblingtherapy.org" target="_blank" rel="noopener noreferrer">Gambling Therapy</a>. Only players aged 18+ may register.</p>

                <h3>Need help?</h3>
                <p>Visit the <a href="faq.html">Nice88 FAQ</a> or <a href="about-us.html">About Us</a>. For account-specific issues, use live chat or the contact email on those pages.</p>
            </div>
        </div>
    </section>

`;

let idx = read('index.html');
const seoStart = idx.indexOf('<section class="section" id="seo-content">');
const seoEnd = idx.indexOf('    <!-- INCLUDE: promo-banner -->', seoStart);
if (seoStart >= 0 && seoEnd > seoStart) {
  idx = idx.slice(0, seoStart) + indexSeo + idx.slice(seoEnd);
  write('index.html', idx);
  console.log('✓ index.html (seo-content block)');
}

// —— SLOTS ——
patch('slots.html', [
  ['<title>Nice88 Slots | 3,000+ Nice88 Online Slots | nice88asia.com</title>', '<title>Nice88 Slots | 3,000+ Online Slot Games | Nice88 Asia</title>'],
  ['Nice88 slots at nice88asia.com — 3,000+ online slot games: Megaways, jackpots, Sweet Bonanza, Gates of Olympus, Mega Moolah. Play Nice88 Asia slots with one wallet.',
    'Play Nice88 slots at Nice88 Asia — 3,000+ certified games, Megaways, jackpots, high-RTP picks. Sweet Bonanza, Gates of Olympus, Mega Moolah. One wallet with live casino &amp; sports.'],
  ['<h1 class="hero__title">Nice88 Slots — 3,000+ Games at Nice88 Asia</h1>', '<h1 class="hero__title">Nice88 Slots — 3,000+ Games Online</h1>'],
  ['The full <strong>Nice88</strong> slot library at <strong>nice88asia.com</strong>: over 3,000 titles from 25+ studios — Megaways, jackpots, high-RTP picks. New games weekly.',
    'Explore the full <strong>Nice88 slots</strong> catalogue at <strong>Nice88 Asia</strong>: 3,000+ titles from Pragmatic Play, Microgaming, PG Soft, NetEnt, and more. Megaways, jackpots, and high-RTP games — new releases weekly.'],
  ['<h2 class="listicle__title">5 Tips for Slot Success at Nice88</h2>', '<h2 class="listicle__title">5 expert tips for Nice88 slots players</h2>'],
  ['Choose slots with 96%+ RTP for better long-term value. Nice88 displays RTP for each game.',
    'Prioritise games with 96%+ RTP where published. RTP is theoretical over millions of spins — not a guarantee for any single session.'],
  ['among the most popular online slot games in Cambodia, and for good reason',
    'among the most searched slot brands in Asia, and for good reason'],
]);

// —— ABOUT ——
patch('about-us.html', [
  ['<title>About Nice88 & Nice88 Asia | Official Brand, Mission & Trust Since 2009</title>', '<title>About Nice88 &amp; Nice88 Asia | Licensed Online Casino Since 2009</title>'],
  ['About Nice88 and Nice88 Asia: who we are since 2009, licensing, responsible play, and why players choose the official nice88asia.com experience.',
    'About Nice88 Asia: licensed online casino since 2009, fair games, regional payments, responsible play, and why nice88asia.com is the official Nice88 site.'],
  ['<h1 class="hero__title">About Nice88 Asia</h1>', '<h1 class="hero__title">About Nice88 &amp; Nice88 Asia</h1>'],
  ['We’re not here to reinvent the wheel — just to run a casino and sportsbook that feel fair, fast, and actually built for people in Asia. Here’s how we think about the job.',
    'Nice88 Asia is the regional home of the Nice88 brand — an online casino and sportsbook for players across Asia since 2009. Here is who we are, how we operate, and what you can expect from the official site.'],
  ['<h2 class="section__title">Our Story</h2>', '<h2 class="section__title">Our story: Nice88 since 2009</h2>'],
  ['Have a question about Nice88 Asia? Send us an email and we’ll get back to you.',
    'Questions about Nice88 Asia, your account, or responsible play? Email our team — we aim to respond promptly.'],
  ['<h3>Why we get out of bed</h3>', '<h3>Our mission</h3>'],
  ['<h3>Rules of the road</h3>', '<h3>Compliance &amp; fairness</h3>'],
  ['<h3>We’ve got your back</h3>', '<h3>Player protection</h3>'],
  ['<h3>Who you’re playing with</h3>', '<h3>Game partners you know</h3>'],
  ['<h3>From 2009 to now</h3>', '<h3>Nice88 and Nice88 Asia today</h3>'],
  ['<h3>Scale & quality</h3>', '<h3>Scale &amp; quality</h3>'],
  ['<h3>Trust, in plain English</h3>', '<h3>Trust &amp; transparency</h3>'],
  ['<h3>When fun stops being fun</h3>', '<h3>Responsible gambling</h3>'],
  ['<h3>Talk to a human</h3>', '<h3>Customer support</h3>'],
  ['<h3>Made for Asia — not copy-paste “global”</h3>', '<h3>Built for Asia</h3>'],
]);

// —— FAQ ——
patch('faq.html', [
  ['<h1 class="hero__title">Nice88 FAQ — Help for Nice88 Asia Players</h1>', '<h1 class="hero__title">Nice88 FAQ — Help &amp; Support</h1>'],
  ['Straight answers on Nice88 login, deposits, Nice88 slots &amp; sports, and bonuses — no fluff. If yours isn’t here, ping us on chat.',
    'Clear answers on Nice88 login, deposits, Nice88 slots, live casino, sports betting, and bonuses. Still stuck? Use live chat or email below.'],
  ['<h2>Still reading? Good — here’s the longer version</h2>', '<h2>Extended Nice88 help guide</h2>'],
  ['This <strong>FAQ</strong> covers the stuff people ask us daily.',
    'This <strong>Nice88 FAQ</strong> covers the topics players ask about most often.'],
]);

// Insert FAQ item at top of faq-list
let faq = read('faq.html');
const faqInsert = `                <div class="faq-item">
                    <div class="faq-item__question">Is Nice88 the same as Nice88 Asia? <svg class="icon icon--plus" width="20" height="20"><use href="#icon-plus"></use></svg></div>
                    <div class="faq-item__answer">Yes. <strong>Nice88</strong> and <strong>Nice88 Asia</strong> are the same brand. The official website is <strong>nice88asia.com</strong> — use it for Nice88 login, deposits, and gameplay.</div>
                </div>
`;
const faqMarker = '<div class="faq-list">';
if (faq.includes(faqMarker) && !faq.includes('Is Nice88 the same as Nice88 Asia?')) {
  faq = faq.replace(faqMarker, faqMarker + '\n' + faqInsert);
  write('faq.html', faq);
  console.log('✓ faq.html (added brand FAQ item)');
}

// —— FOOTER ——
patch('partials/footer.html', [
  ['<strong>Nice88</strong> (Nice88 Asia) at <strong>nice88asia.com</strong> — slots, live casino and sports in one account for players across Asia. Official Nice88 online casino site: licensed, clear rules, 24/7 support. Play smart, have fun.',
    '<strong>Nice88</strong> (Nice88 Asia) at <strong>nice88asia.com</strong> — the official Nice88 online casino and sportsbook for Asia. 3,500+ games, licensed play since 2009, regional payments, responsible-gaming tools, and 24/7 support.'],
]);

// —— LIVE CASINO hero ——
patch('live-casino.html', [
  ['<h1 class="hero__title">Nice88 Asia Live Casino</h1>', '<h1 class="hero__title">Nice88 Live Casino — Real Dealers Online</h1>'],
  ['150+ live tables from Evolution, SA Gaming & Pragmatic Play. Baccarat, Blackjack, Roulette, Dragon Tiger, game shows – 24/7 HD streaming with professional dealers.',
    'Stream 150+ <strong>Nice88 live casino</strong> tables from Evolution, SA Gaming, and Pragmatic Play. Baccarat, blackjack, roulette, Dragon Tiger, and game shows — HD video, professional dealers, and limits for every bankroll.'],
  ['<h2 class="listicle__title">5 Live Casino Tips for Beginners</h2>', '<h2 class="listicle__title">5 tips for Nice88 live casino beginners</h2>'],
]);

patch('table-games.html', [
  ['<h1 class="hero__title">Nice88 Asia Table Games</h1>', '<h1 class="hero__title">Nice88 Table Games — Blackjack, Baccarat &amp; Roulette</h1>'],
  ['80+ table games: 15+ Blackjack variants, 10+ Baccarat, 8+ Roulette, Poker, Sic Bo, Dragon Tiger. RNG and live dealer. House edges from 1% (Blackjack) to 2.7% (European Roulette).',
    'Play 80+ <strong>Nice88 table games</strong> — blackjack, baccarat, roulette, poker, Sic Bo, and Dragon Tiger. Choose RNG tables for speed or live dealer for atmosphere. House edges from ~1% (blackjack with basic strategy) to 2.7% (European roulette).'],
]);

patch('sports-betting.html', [
  ['<h1 class="hero__title">Nice88 Asia Sports Betting</h1>', '<h1 class="hero__title">Nice88 Sports Betting — Football, Esports &amp; More</h1>'],
  ['40+ sports, 50+ leagues, 200+ markets per football match. Pre-match and live in-play. Asian handicap, 1X2, over/under, correct score. Competitive odds.',
    '<strong>Nice88 sports betting</strong> covers 40+ sports and 50+ leagues with 200+ markets on major football fixtures. Pre-match and live in-play, Asian handicap, totals, and esports — all from your Nice88 wallet.'],
  ['<h2 class="listicle__title">5 Sports Betting Tips for Smarter Wagers</h2>', '<h2 class="listicle__title">5 tips for smarter Nice88 sports bets</h2>'],
  ['Nice88 Sports Betting – Overview</h3>\n                <p>Nice88 sports betting covers football, basketball, tennis, cricket, esports, and dozens more disciplines. Cambodian players',
    'Nice88 sports betting overview</h3>\n                <p>Nice88 sports betting covers football, basketball, tennis, cricket, esports, and dozens more disciplines. Players across Asia'],
]);

patch('payments.html', [
  ['<h1 class="hero__title">Nice88 Asia Payments</h1>', '<h1 class="hero__title">Nice88 Payments — Deposits &amp; Withdrawals</h1>'],
  ['Cambodian players', 'Players across Asia'],
  ['Nice88 E-Wallet Guide – ABA Pay, Wing, Pi Pay</h3>\n                <p>ABA Pay, Wing, and Pi Pay are popular e-wallets in Cambodia',
    'Regional e-wallet guide — ABA Pay, Wing, Pi Pay</h3>\n                <p>ABA Pay, Wing, and Pi Pay are widely used e-wallets in Southeast Asia'],
]);

patch('mobile-app.html', [
  ['<h1 class="hero__title">Nice88 Asia Mobile</h1>', '<h1 class="hero__title">Nice88 Mobile App &amp; Browser Play</h1>'],
  ['Cambodian players', 'Players across Asia'],
]);

console.log('\nContent rewrite script finished.');
