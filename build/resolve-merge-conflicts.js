const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
function write(rel, content) {
  fs.writeFileSync(path.join(root, rel), content, 'utf8');
}

// index.html — keep EEAT steps intro (HEAD)
write(
  'index.html',
  read('index.html').replace(
    /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n[\s\S]*?>>>>>>> origin\/main\r?\n/,
    '$1'
  )
);

// sports-betting.html — remote webp path
write(
  'sports-betting.html',
  read('sports-betting.html').replace(
    /<<<<<<< HEAD\r?\n[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> origin\/main\r?\n/,
    '$1'
  )
);

// footer — {{base}} logo link + remote dimensions
write(
  'partials/footer.html',
  read('partials/footer.html').replace(
    /<<<<<<< HEAD\r?\n[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> origin\/main\r?\n/,
    `                <a href="{{base}}/" class="logo">
                    <img class="logo__img" src="{{base}}images/logo-nice88.webp" alt="Nice88 Asia" width="315" height="288" decoding="async" loading="lazy">
`
  )
);

// optimize-images.js
let opt = read('build/optimize-images.js');
opt = opt.replace(
  /<<<<<<< HEAD\r?\n      continue;\r?\n=======\r?\n    \} else if \(EXTENSIONS[\s\S]*?>>>>>>> origin\/main\r?\n/,
  '      continue;\n'
);
opt = opt.replace(
  /<<<<<<< HEAD\r?\n=======\r?\n  \/\/ Create og-image\.webp[\s\S]*?>>>>>>> origin\/main\r?\n/,
  '  // Create og-image.webp for social sharing if missing (fixes 404 from missing og:image)\n'
);
opt = opt.replace(
  /<<<<<<< HEAD\r?\n        \.rotate\(\)\r?\n        \.resize\(1200, 630, \{ fit: 'cover', position: 'attention' \}\)\r?\n        \.jpeg\(\{ quality: 88, mozjpeg: true \}\)\r?\n=======\r?\n        \.resize\(1200, 630, \{ fit: 'cover' \}\)\r?\n        \.webp\(\{ quality: 90 \}\)\r?\n>>>>>>> origin\/main\r?\n/,
  `        .rotate()
        .resize(1200, 630, { fit: 'cover' })
        .webp({ quality: 90 })
`
);
write('build/optimize-images.js', opt);

// header — use origin/main version
const header = read('partials/header.html');
const headerResolved = header.includes('<<<<<<<')
  ? header.replace(/<<<<<<< HEAD\r?\n[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> origin\/main\r?\n?/, '$1')
  : header;
write('partials/header.html', headerResolved);

// faq — accessible markup + EEAT answers
const faqItems = [
  {
    q: 'Is Nice88 the same as Nice88 Asia?',
    a: 'Yes. <strong>Nice88</strong> and <strong>Nice88 Asia</strong> are the same brand. The official site is <strong>nice88asia.com</strong> — use it for Nice88 login, deposits, withdrawals, and gameplay.'
  },
  {
    q: 'Is Nice88 Asia legal?',
    a: 'Nice88 Asia operates under a valid gaming licence with fair-play, AML, and responsible-gaming policies. You must be 18+ and comply with local laws where you access the site.'
  },
  {
    q: 'What games can I play?',
    a: '3,500+ games: Nice88 slots, live casino tables, RNG table games, and a full sportsbook. New titles are added weekly from licensed providers such as Pragmatic Play, Evolution, and Microgaming.'
  },
  {
    q: 'How do I deposit?',
    a: 'Use Cashier to deposit from $10 via e-wallets, bank transfer, QR, or crypto (USDT, Bitcoin). E-wallets and crypto typically credit fastest; bank transfers may take longer.'
  },
  {
    q: 'How long do withdrawals take?',
    a: 'Withdrawals usually process within 24–48 hours after account verification. Crypto and e-wallets are often faster. First withdrawal may require one-time ID verification.'
  },
  {
    q: 'Can I play on mobile?',
    a: 'Yes. Play in your mobile browser or install the Nice88 app on iOS/Android. One Nice88 login, one wallet, full game library.'
  },
  {
    q: 'What bonuses are available?',
    a: 'Welcome match, free spins, cashback, and seasonal promos are listed in your account. All bonuses have wagering requirements and expiry — read terms before opting in.'
  },
  {
    q: 'How do I contact support?',
    a: '24/7 live chat and email support, including <a href="mailto:sparta4444@protonmail.com">sparta4444@protonmail.com</a>. English and major Asian languages supported.'
  }
];

const faqBlock = faqItems
  .map((item, i) => {
    const n = i + 1;
    return `                <div class="faq-item">
                    <div class="faq-item__question" role="button" tabindex="0" aria-expanded="false" aria-controls="faq-a-${n}" id="faq-q-${n}">
                        <span class="faq-item__label">${item.q}</span>
                        <span class="faq-item__icon" aria-hidden="true"><svg class="icon icon--plus" width="20" height="20"><use href="#icon-plus"></use></svg></span>
                    </div>
                    <div class="faq-item__answer" id="faq-a-${n}" role="region" aria-labelledby="faq-q-${n}">${item.a}</div>
                </div>`;
  })
  .join('\n');

let faq = read('faq.html');
faq = faq.replace(
  /<div class="faq-list">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>\s*\n\s*<section class="section">\s*\n\s*<div class="container">\s*\n\s*<h2 class="section__title">Quick Links<\/h2>/,
  `<div class="faq-list">\n${faqBlock}\n            </div>\n        </div>\n    </section>\n\n    <section class="section">\n        <div class="container">\n            <h2 class="section__title">Quick Links</h2>`
);
write('faq.html', faq);

console.log('Conflicts resolved');
