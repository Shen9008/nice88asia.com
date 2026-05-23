const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'faq.html');
let html = fs.readFileSync(p, 'utf8');
const t = 'motion'.replace('motion', 'div');

if (!html.includes('faq-item__question">Is Nice88 the same as Nice88 Asia?')) {
  const item = [
    '                <' + t + ' class="faq-item">',
    '                    <' + t + ' class="faq-item__question">Is Nice88 the same as Nice88 Asia? <svg class="icon icon--plus" width="20" height="20"><use href="#icon-plus"></use></svg></' + t + '>',
    '                    <' + t + ' class="faq-item__answer">Yes. <strong>Nice88</strong> and <strong>Nice88 Asia</strong> are the same brand. The official site is <strong>nice88asia.com</strong> — use it for Nice88 login, deposits, withdrawals, and gameplay.</' + t + '>',
    '                </' + t + '>'
  ].join('\n');
  html = html.replace('<' + t + ' class="faq-list">', '<' + t + ' class="faq-list">\n' + item);
}

const pairs = [
  ['Is Nice88 Asia legal?', 'Nice88 Asia operates under a valid gaming licence with fair-play, AML, and responsible-gaming policies. You must be 18+ and comply with local laws where you access the site.'],
  ['What games can I play?', '3,500+ games: Nice88 slots, live casino tables, RNG table games, and a full sportsbook. New titles are added weekly from licensed providers such as Pragmatic Play, Evolution, and Microgaming.'],
  ['How do I deposit?', 'Use Cashier to deposit from $10 via e-wallets, bank transfer, QR, or crypto (USDT, Bitcoin). E-wallets and crypto typically credit fastest; bank transfers may take longer.'],
  ['How long do withdrawals take?', 'Withdrawals usually process within 24–48 hours after account verification. Crypto and e-wallets are often faster. First withdrawal may require one-time ID verification.'],
  ['Can I play on mobile?', 'Yes. Play in your mobile browser or install the Nice88 app on iOS/Android. One Nice88 login, one wallet, full game library.'],
  ['What bonuses are available?', 'Welcome match, free spins, cashback, and seasonal promos are listed in your account. All bonuses have wagering requirements and expiry — read terms before opting in.'],
  ['How do I contact support?', '24/7 live chat and email support, including <a href="mailto:sparta4444@protonmail.com">sparta4444@protonmail.com</a>. English and major Asian languages supported.']
];

for (const [question, answer] of pairs) {
  const marker = 'class="faq-item__question">' + question;
  const start = html.indexOf(marker);
  if (start < 0) continue;
  const ansStart = html.indexOf('class="faq-item__answer">', start);
  if (ansStart < 0) continue;
  const contentStart = ansStart + 'class="faq-item__answer">'.length;
  const contentEnd = html.indexOf('</' + t + '>', contentStart);
  if (contentEnd < 0) continue;
  html = html.slice(0, contentStart) + answer + html.slice(contentEnd);
}

fs.writeFileSync(p, html);
console.log('faq patched');
