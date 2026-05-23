const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'faq.html');
let html = fs.readFileSync(p, 'utf8');

const block = `                <div class="faq-item">
                    <div class="faq-item__question">Is Nice88 the same as Nice88 Asia? <svg class="icon icon--plus" width="20" height="20"><use href="#icon-plus"></use></svg></div>
                    <div class="faq-item__answer">Yes. <strong>Nice88</strong> and <strong>Nice88 Asia</strong> are the same brand. The official website is <strong>nice88asia.com</strong> — use it for Nice88 login, deposits, withdrawals, and gameplay.</div>
                </div>
`;

const fixedBlock = block.replace(/<\/motion>/g, '</div>').replace(/<motion /g, '<div ');

if (!html.includes('Is Nice88 the same as Nice88 Asia?')) {
  html = html.replace('<div class="faq-list">', '<div class="faq-list">\n' + fixedBlock);
}

const answers = [
  ['Yes. We’re licensed and regulated, and we treat your data and money like they matter — because they do.',
    'Nice88 Asia operates under a valid gaming licence with fair-play, AML, and responsible-gaming policies. You must be 18+ and comply with local laws where you access the site.'],
  ['Plenty — thousands of slots, stacks of live tables, classic table games, plus a sportsbook. We add new titles weekly so it doesn’t get stale.',
    '3,500+ games: Nice88 slots, live casino tables, RNG table games, and a full sportsbook. New titles are added weekly from licensed providers such as Pragmatic Play, Evolution, and Microgaming.'],
  ['Bank, e-wallets, or crypto — from $10, no deposit fee. E-wallets and crypto usually credit fast; banks can take a few hours. Cashier → pick method → done.',
    'Use Cashier to deposit from $10 via e-wallets, bank transfer, QR, or crypto (USDT, Bitcoin). E-wallets and crypto typically credit fastest; bank transfers may take longer.'],
  ['Most withdrawals land in a day or two; crypto and e-wallets are often quicker. First time out? We may need to verify ID (once) — that’s normal. No withdrawal processing fee from us.',
    'Withdrawals usually process within 24–48 hours after account verification. Crypto and e-wallets are often faster. First withdrawal may require one-time ID verification.'],
  ['Absolutely. Browser works great; the app adds push alerts and a smoother ride. Same account, same wallet.',
    'Yes. Play in your mobile browser or install the Nice88 app on iOS/Android. One Nice88 login, one wallet, full game library.'],
  ['Welcome pack, spins, cashback, and spot promos — they change, so peek at the homepage or your inbox. Always skim the terms so you know the playthrough.',
    'Welcome match, free spins, cashback, and seasonal promos are listed in your account. All bonuses have wagering requirements and expiry — read terms before opting in.'],
  ['Live chat or email, any time — including <a href="mailto:sparta4444@protonmail.com">sparta4444@protonmail.com</a>. We speak English and major Asian languages — real humans, not copy-paste bots.',
    '24/7 live chat and email support, including <a href="mailto:sparta4444@protonmail.com">sparta4444@protonmail.com</a>. English and major Asian languages supported.'],
];

for (const [from, to] of answers) {
  if (html.includes(from)) html = html.split(from).join(to);
}

fs.writeFileSync(p, html);
console.log('faq patched');
