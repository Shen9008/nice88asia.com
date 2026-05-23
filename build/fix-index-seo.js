const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(p, 'utf8');
const start = html.indexOf('<section class="section" id="seo-content">');
const end = html.indexOf('    <!-- INCLUDE: promo-banner -->', start);
const d = 'div';
const block = `    <section class="section" id="seo-content">
        <${d} class="container">
            <${d} class="content-page__content">
                <h2>What is Nice88? Official brand &amp; Nice88 Asia</h2>
                <p><strong>Nice88</strong> and <strong>Nice88 Asia</strong> refer to the same licensed online casino and sportsbook brand. The official website is <strong>nice88asia.com</strong> — use it for <strong>Nice88 login</strong>, deposits, and gameplay. Searches for <strong>nice88asia</strong>, <strong>Nice88 casino</strong>, or <strong>Nice88 online casino</strong> should lead here; unofficial mirrors may not reflect current promotions or security standards.</p>

                <h2>Nice88 products: slots, live casino, tables &amp; sports</h2>
                <p>The <strong>Nice88 casino</strong> lobby is built for players who want depth in one account. <strong>Nice88 slots</strong> number 3,000+ titles including Sweet Bonanza, Gates of Olympus, Starlight Princess, and Mega Moolah, plus Megaways and high-RTP games with published return rates. The <strong>Nice88 live casino</strong> streams 150+ tables from Evolution, SA Gaming, and Pragmatic Play — baccarat, blackjack, roulette, Dragon Tiger, and game shows such as Crazy Time. RNG <a href="table-games.html">table games</a> add blackjack, baccarat, and roulette variants with transparent house edges. <strong>Nice88 sports betting</strong> covers 40+ sports with pre-match and in-play markets, Asian handicap, and esports.</p>

                <h3>EEAT: experience, expertise, authority &amp; trust</h3>
                <ul style="margin:0 0 1rem 1.25rem;color:var(--text-secondary);">
                    <li><strong>Experience</strong> — operating since 2009 with a product mix shaped by Asian player preferences (live baccarat, football, mobile play).</li>
                    <li><strong>Expertise</strong> — games from tier-one studios; in-game RTP and rules from licensed suppliers; educational content on volatility, house edge, and bankroll management.</li>
                    <li><strong>Authoritativeness</strong> — licensed platform, published policies, third-party testing via <a href="https://www.ecogra.org" target="_blank" rel="noopener noreferrer">eCOGRA</a> and <a href="https://www.itechlabs.com" target="_blank" rel="noopener noreferrer">iTech Labs</a>, transparent <a href="about-us.html">About Us</a> information.</li>
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
            </${d}>
        </${d}>
    </section>

`;
if (start < 0 || end < 0) {
  console.error('markers not found', start, end);
  process.exit(1);
}
fs.writeFileSync(p, html.slice(0, start) + block + html.slice(end));
console.log('OK');
