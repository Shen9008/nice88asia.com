const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'faq.html');
let html = fs.readFileSync(p, 'utf8');

if (!html.includes('Is Nice88 the same as Nice88 Asia?')) {
  const block = [
    '                <div class="faq-item">',
    '                    <div class="faq-item__question">Is Nice88 the same as Nice88 Asia? <svg class="icon icon--plus" width="20" height="20"><use href="#icon-plus"></use></svg></div>',
    '                    <div class="faq-item__answer">Yes. <strong>Nice88</strong> and <strong>Nice88 Asia</strong> are the same brand. The official website is <strong>nice88asia.com</strong> — use it for Nice88 login, deposits, withdrawals, and gameplay.</div>',
    '                </div>'
  ].join('\n');
  html = html.replace('<div class="faq-list">', '<div class="faq-list">\n' + block);
  html = html.replace(/gameplay\.<\/motion>/, 'gameplay.</div>');
  html = html.replace('<div class="faq-list">', '<div class="faq-list">');
}

const replacements = [
  'Nice88 Asia operates under a valid gaming licence with fair-play, AML, and responsible-gaming policies. You must be 18+ and comply with local laws where you access the site.',
  '3,500+ games: Nice88 slots, live casino tables, RNG table games, and a full sportsbook. New titles are added weekly from licensed providers such as Pragmatic Play, Evolution, and Microgaming.',
  'Use Cashier to deposit from $10 via e-wallets, bank transfer, QR, or crypto (USDT, Bitcoin). E-wallets and crypto typically credit fastest; bank transfers may take longer.',
  'Withdrawals usually process within 24–48 hours after account verification. Crypto and e-wallets are often faster. First withdrawal may require one-time ID verification.',
  'Yes. Play in your mobile browser or install the Nice88 app on iOS/Android. One Nice88 login, one wallet, full game library.',
  'Welcome match, free spins, cashback, and seasonal promos are listed in your account. All bonuses have wagering requirements and expiry — read terms before opting in.',
  '24/7 live chat and email support, including <a href="mailto:sparta4444@protonmail.com">sparta4444@protonmail.com</a>. English and major Asian languages supported.',
];

let n = 0;
html = html.replace(/<div class="faq-item__answer">[\s\S]*?<\/div>/g, () => {
  const text = replacements[n] || '';
  n++;
  return '<div class="faq-item__answer">' + text + '</div>';
});

fs.writeFileSync(p, html);
console.log('updated', n, 'faq answers');
