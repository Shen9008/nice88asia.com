'use strict';
/**
 * One-off CTR optimization pass for blog post meta titles/descriptions.
 * Updates assets/data/blogs.json (source of truth for the CMS) and
 * globally replaces the old meta_title / meta_description strings inside
 * each blogs/<slug>/index.html (title, og:title, twitter:title are all
 * identical to meta_title; description, og:description, twitter:description
 * and the Article JSON-LD "description" are all identical to meta_description).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BLOGS_JSON = path.join(ROOT, 'assets/data/blogs.json');
const BLOGS_DIR = path.join(ROOT, 'blogs');

const UPDATES = {
  'dragon-strike-mega888-review-discover-the-dragon-bonus-feature': {
    meta_title: 'Dragon Strike Mega888 Review: Dragon Bonus Tips | Nice88 Asia',
    meta_description: "Is Dragon Strike Mega888 worth playing? See how the Dragon Bonus Feature triggers, real win potential, and 3 tips to boost your session at Nice88 Asia."
  },
  'mega888-slots-known-for-fast-bonus-triggers-and-quick-gameplay': {
    meta_title: '5 Mega888 Slots With the Fastest Bonus Triggers | Nice88 Asia',
    meta_description: "Want quicker bonus rounds? Discover the Mega888 slots known for fast triggers and rapid gameplay, plus 3 tips to stretch your bankroll further."
  },
  'most-casino-bonuses-quietly-change-the-way-players-bet': {
    meta_title: 'How Casino Bonuses Secretly Change the Way You Bet | Nice88 Asia',
    meta_description: "Wagering requirements do more than lock your bonus, they reshape your betting habits. Here's exactly how, and how to bet smarter around them."
  },
  'why-slot-players-keep-remembering-near-misses-more-than-actual-losses': {
    meta_title: 'Why Your Brain Remembers Slot Near-Misses, Not Losses | Nice88 Asia',
    meta_description: "Almost won? That near-miss sticks in your memory far longer than losses do. Here's the slot psychology behind it, and how to play with your eyes open."
  },
  'small-wins-quietly-keep-players-gambling-longer-than-jackpots-do': {
    meta_title: 'Small Wins Keep You Playing Longer Than Jackpots Do | Nice88 Asia',
    meta_description: "It's not the jackpot that keeps players spinning, it's the small, frequent wins. Discover the reward psychology behind longer gambling sessions."
  },
  'most-last-minute-bets-are-emotional-decisions-disguised-as-strategy': {
    meta_title: 'Are Your Last-Minute Bets Strategy or Just Emotion? | Nice88 Asia',
    meta_description: "Most last-minute in-play bets feel like strategy but are driven by emotion. Learn to spot the difference and avoid common in-play betting mistakes."
  },
  'smart-casino-players-compare-withdrawal-systems-before-bonuses': {
    meta_title: 'Why Smart Players Check Withdrawals Before Bonuses | Nice88 Asia',
    meta_description: "Before claiming any bonus, savvy players check one thing first: the withdrawal system. Here's why that habit matters at the best online casinos in Asia."
  },
  'why-human-dealers-feel-more-trustworthy-than-casino-algorithms': {
    meta_title: 'Why Live Dealers Beat Algorithms on Trust | Nice88 Asia',
    meta_description: "Live dealer casinos outshine RNG algorithms in one key way: trust. Discover why players feel safer watching a real dealer deal every card and spin."
  },
  'players-take-bigger-risks-on-phones-than-on-desktop': {
    meta_title: 'Why Players Bet Bigger on Phones Than on Desktop | Nice88 Asia',
    meta_description: "Your phone screen may be pushing you to bet bigger. Explore the casino mobile psychology behind riskier smartphone play, and how to stay in control."
  },
  'most-players-use-rtp-numbers-incorrectly-without-realizing-it': {
    meta_title: "You're Probably Reading RTP Numbers Wrong | Nice88 Asia",
    meta_description: "RTP explained the right way: what those percentages actually mean for your session, why they're not a payout guarantee, and how to use them properly."
  },
  'the-longer-you-gamble-the-more-normal-bigger-bets-start-feeling': {
    meta_title: 'Why Bigger Bets Start Feeling Normal Over Time | Nice88 Asia',
    meta_description: "Gambling fatigue quietly raises your bet size the longer you play. Learn to recognize the warning signs before your stakes creep past your comfort zone."
  },
  'everything-feels-instant-until-the-casino-requests-documents': {
    meta_title: "Why Casinos Ask for Documents (And Why That's Good) | Nice88 Asia",
    meta_description: "Everything feels instant online, until verification kicks in. Here's what casino security document checks actually protect, and why that's a good sign."
  },
  'huge-casino-lobbies-quietly-encourage-players-to-stay-longer': {
    meta_title: 'How Casino Lobbies Are Designed to Keep You Playing | Nice88 Asia',
    meta_description: "That endless scroll of games isn't an accident. See the design tricks behind casino game lobbies that quietly extend every session, and how to spot them."
  },
  'football-fans-usually-bet-emotionally-before-they-bet-logically': {
    meta_title: 'Football Betting: Logic or Just Emotion? | Nice88 Asia',
    meta_description: "Football betting psychology reveals fans bet with the heart before the head. Learn to separate loyalty from logic and build a smarter matchday strategy."
  },
  'why-players-trust-live-baccarat-more-than-regular-slot-games': {
    meta_title: 'Why Live Baccarat Feels More Trustworthy Than Slots | Nice88 Asia',
    meta_description: "Slots run on RNG, live baccarat runs in front of your eyes. Discover why that visible fairness makes live baccarat the top choice in online live casinos."
  },
  'a-fast-deposit-system-doesnt-always-mean-a-reliable-casino': {
    meta_title: "Fast Deposits Don't Always Mean a Reliable Casino | Nice88 Asia",
    meta_description: "A slick deposit page can hide a shaky operator. Our casino safety guide reveals the real signs of reliability that fast deposits alone won't show you."
  },
  'live-betting-feels-smarter-because-everything-happens-too-fast-to-question': {
    meta_title: 'Why Live Betting Feels Smarter Than It Really Is | Nice88 Asia',
    meta_description: "Live betting moves so fast you rarely stop to question it, that's exactly the trap. Build a real live betting strategy instead of chasing the clock."
  },
  'why-mobile-casino-sessions-feel-shorter-than-they-actually-are': {
    meta_title: 'Why Mobile Casino Sessions Feel Shorter Than They Are | Nice88 Asia',
    meta_description: "20 minutes can feel like 5 on mobile. See why mobile casino sessions in Asia distort your sense of time, and 3 ways to keep better track of play."
  },
  'the-longest-wait-in-online-gambling-starts-after-a-big-win': {
    meta_title: 'What Happens After a Big Win? Nice88 Withdrawal Guide | Nice88 Asia',
    meta_description: "Just won big at Nice88? Here's exactly what to expect during withdrawal, verification steps, realistic timelines, and how to avoid unnecessary delays."
  },
  'why-online-casino-platforms-compete-with-streaming-apps': {
    meta_title: 'Why Online Casinos Now Compete With Streaming Apps | Nice88 Asia',
    meta_description: "Netflix isn't your casino's only competitor, attention is. See how digital gaming platforms are redesigning the experience to win against streaming apps."
  },
  'why-near-win-moments-make-slot-sessions-feel-more-intense': {
    meta_title: "Why 'Near Win' Moments Make Slots Feel So Intense | Nice88 Asia",
    meta_description: "That heart-jump when symbols almost align isn't luck, it's design. Learn how near-win moments shape online gambling behavior and keep sessions thrilling."
  },
  '5-features-trusted-online-casinos-usually-share': {
    meta_title: '5 Features Every Trusted Online Casino Shares | Nice88 Asia',
    meta_description: "Not sure if a casino is safe? These are the 5 features every safe online casino in Malaysia has in common, check for them before you deposit anywhere."
  },
  'how-experienced-players-avoid-revenge-betting-after-big-losses': {
    meta_title: 'How Pro Players Avoid Revenge Betting After a Loss | Nice88 Asia',
    meta_description: "Chasing a loss almost always makes it worse. See the exact habits experienced players use to avoid revenge betting and gamble responsibly in Malaysia."
  },
  'why-younger-bettors-are-choosing-esports-over-traditional-football': {
    meta_title: 'Why Younger Bettors Are Ditching Football for Esports | Nice88 Asia',
    meta_description: "Esports betting in Malaysia is booming with younger players. Discover why Gen Z bettors prefer CS2 and Dota 2 markets over traditional football odds."
  },
  'the-rise-of-commute-gambling-among-mobile-casino-users': {
    meta_title: "Commute Gambling: Malaysia's Fastest-Growing Habit | Nice88 Asia",
    meta_description: "Bus rides and train commutes are becoming prime betting time. Explore the rise of commute gambling and what it reveals about mobile gambling habits."
  },
  'how-hd-cameras-revolutionized-online-live-casino-gaming': {
    meta_title: 'How HD Cameras Changed Live Casino Gaming Forever | Nice88 Asia',
    meta_description: "From grainy webcams to studio-grade HD, see how camera technology transformed live casino Malaysia into the immersive experience players expect today."
  },
  'why-players-keep-returning-to-games-they-previously-lost-on': {
    meta_title: 'Why You Keep Returning to Games That Took Your Money | Nice88 Asia',
    meta_description: "Lost on a game last week? You're probably back on it today. Here's the casino behavior science behind why losses don't stop us from replaying."
  },
  'why-some-slot-games-feel-hotter-even-when-rtp-is-similar': {
    meta_title: "Why Some Slots Feel 'Hotter' With the Same RTP | Nice88 Asia",
    meta_description: "Two slots, same RTP, totally different vibe, why? Explore the game design tricks behind hot-feeling slots and sharpen your online slot strategy."
  },
  'the-most-common-mistake-new-baccarat-players-make-within-minutes': {
    meta_title: 'The #1 Mistake New Baccarat Players Make in Minutes | Nice88 Asia',
    meta_description: "New to baccarat? This beginner mistake costs Malaysian players fast, and it's avoidable. Learn it before your first hand, not after your bankroll drops."
  },
  'why-daily-cashback-keeps-players-returning-more-than-big-bonuses': {
    meta_title: 'Why Daily Cashback Beats Big Bonuses for Loyalty | Nice88 Asia',
    meta_description: "Big bonuses grab attention, but daily cashback keeps Malaysian players coming back. Here's the real value math behind cashback casino offers."
  },
  'the-new-habit-of-betting-small-amounts-across-multiple-matches': {
    meta_title: "Micro Betting: Malaysia's New Small-Stakes Trend | Nice88 Asia",
    meta_description: "Small bets, multiple matches, more excitement, micro betting is reshaping how Malaysians wager. Here's why the trend is spreading fast in 2026."
  },
  'popular-betting-markets-available-on-nice88asia-platform': {
    meta_title: 'Top Betting Markets to Explore Right Now | Nice88 Asia',
    meta_description: "From football handicaps to esports specials, discover the most popular betting markets on Nice88 Asia and where Malaysian bettors find the best value."
  },
  'how-nice88asia-combines-sports-betting-and-casino-entertainment': {
    meta_title: 'How Nice88 Asia Blends Sports Betting & Casino Fun | Nice88 Asia',
    meta_description: "One platform, two worlds of entertainment. See how Nice88 Asia combines a full sportsbook with casino gaming for a seamless all-in-one experience."
  },
  'comparing-live-table-games-offered-on-nice88asia': {
    meta_title: 'Comparing Every Live Table Game on Nice88 Asia | Nice88 Asia',
    meta_description: "Baccarat, blackjack, roulette or Dragon Tiger, which live table game suits you? We compare betting limits, pace and dealer interaction side by side."
  },
  'the-live-dealer-experience-available-through-nice88asia': {
    meta_title: 'Inside the Nice88 Asia Live Dealer Experience | Nice88 Asia',
    meta_description: "Real dealers, real cards, real-time action. Take a closer look at what makes the Nice88 Asia live dealer experience feel like a trip to the casino floor."
  },
  'exploring-high-engagement-slot-features-on-nice88asia': {
    meta_title: 'The Slot Features Keeping Nice88 Asia Players Hooked | Nice88 Asia',
    meta_description: "Megaways, cascading reels, buy-bonus, see which high-engagement slot features on Nice88 Asia are driving the longest, most rewarding play sessions."
  },
  'how-modern-slot-mechanics-improve-gameplay-on-nice88asia': {
    meta_title: 'How Modern Slot Mechanics Level Up Nice88 Asia Games | Nice88 Asia',
    meta_description: "Slots have evolved far past 3 reels and a lever. Discover the modern mechanics driving bigger wins and smoother gameplay on Nice88 Asia today."
  },
  'popular-slot-categories-featured-on-nice88asia-casino': {
    meta_title: 'Every Popular Slot Category on Nice88 Asia, Explained | Nice88 Asia',
    meta_description: "Classic, video, progressive or Megaways, not sure where to start? This guide breaks down every popular slot category on Nice88 Asia in plain terms."
  },
  'jili-vs-cq9-which-slot-style-appeals-to-casual-players-more': {
    meta_title: 'JILI vs CQ9: Which Slot Style Wins Casual Players? | Nice88 Asia',
    meta_description: "JILI or CQ9, which suits your play style? We compare themes, bonus features and pacing to see which slot studio Malaysian casual players prefer."
  },
  'why-fish-shooting-games-feel-more-social-than-slot-machines': {
    meta_title: 'Why Fish Shooting Games Feel More Social Than Slots | Nice88 Asia',
    meta_description: "Shared screens, shared targets, shared wins, see why fish shooting games in online arcade casinos feel like a party compared to solo slot machines."
  },
  'why-most-southeast-asian-players-gamble-almost-entirely-on-smartphones': {
    meta_title: 'Why Southeast Asia Gambles Almost Entirely on Mobile | Nice88 Asia',
    meta_description: "Desktop casinos are fading fast in Southeast Asia. Explore why mobile casino Malaysia has become the default, and what that shift means for players."
  },
  'the-unspoken-psychology-behind-watching-live-baccarat-tables': {
    meta_title: 'The Unspoken Psychology of Watching Live Baccarat | Nice88 Asia',
    meta_description: "Ever stayed glued to a live baccarat table without even betting? Explore the live casino behavior science behind why we can't stop watching the cards."
  },
  'why-visual-explosion-slots-are-outperforming-classic-casino-games': {
    meta_title: "Why 'Visual Explosion' Slots Are Beating the Classics | Nice88 Asia",
    meta_description: "Big colors, big animations, big engagement, see why visual explosion slots are outperforming classic casino games in this year's online slot trends."
  },
  'understanding-fair-gaming-practices-on-nice88asia-platform': {
    meta_title: 'How Nice88 Asia Guarantees Fair Gaming, Explained | Nice88 Asia',
    meta_description: "RNG certification, audited payouts, transparent odds, see exactly how Nice88 Asia's fair play standards protect every spin, hand and bet you place."
  },
  'how-nice88asia-supports-secure-online-gaming': {
    meta_title: 'How Nice88 Asia Keeps Your Online Gaming Secure | Nice88 Asia',
    meta_description: "From encrypted transactions to strict data protection, see the exact security measures Nice88 Asia uses to keep every player and payment safe."
  },
  'player-discussions-and-feedback-around-nice88asia': {
    meta_title: "What Players Are Really Saying About Nice88 Asia | Nice88 Asia",
    meta_description: "Real player feedback, real experiences. See what the Nice88 Asia community is discussing about games, payouts, and support before you sign up."
  },
  'key-features-that-make-nice88asia-different-from-competitors': {
    meta_title: 'What Makes Nice88 Asia Different From Competitors? | Nice88 Asia',
    meta_description: "From game variety to payout speed, see the key features that set Nice88 Asia apart from other online casinos, and why players are switching over."
  },
  'managing-casino-sessions-more-effectively-on-nice88asia': {
    meta_title: '5 Ways to Manage Your Casino Sessions Better | Nice88 Asia',
    meta_description: "Play smarter, not just longer. These practical gameplay tips help you manage your time and budget more effectively every time you log into Nice88 Asia."
  },
  'smart-gameplay-approaches-for-nice88asia-casino-players': {
    meta_title: 'Smart Gameplay Strategies for Nice88 Asia Players | Nice88 Asia',
    meta_description: "Want better sessions, not just bigger bets? These smart gameplay approaches help Nice88 Asia players get more consistent value from every game."
  },
  'why-smartphone-users-prefer-accessing-nice88asia-games': {
    meta_title: 'Why Smartphone Players Prefer Nice88 Asia Games | Nice88 Asia',
    meta_description: "No app required, no compromise on quality. See why smartphone users across Malaysia are choosing Nice88 Asia mobile gaming over traditional platforms."
  },
  'the-mobile-casino-experience-on-nice88asia-reviewed': {
    meta_title: 'Nice88 Asia Mobile Casino: An Honest Review | Nice88 Asia',
    meta_description: "Is the Nice88 Asia mobile casino actually worth it? We reviewed load speed, game selection and usability so you know exactly what to expect."
  },
  'what-players-should-expect-during-withdrawals-on-nice88asia': {
    meta_title: 'Nice88 Asia Withdrawals: Timelines & What to Expect | Nice88 Asia',
    meta_description: "Curious how fast Nice88 Asia pays out? Here's exactly what to expect during withdrawal, including timeframes, methods and tips for a smooth payout."
  },
  'how-payment-transactions-work-on-nice88asia-casino': {
    meta_title: 'How Payments Actually Work on Nice88 Asia Casino | Nice88 Asia',
    meta_description: "From deposit to withdrawal, see exactly how payment transactions work on Nice88 Asia, including security checks and the fastest methods available."
  },
  'understanding-reward-features-available-on-nice88asia': {
    meta_title: 'Every Reward Feature on Nice88 Asia, Explained | Nice88 Asia',
    meta_description: "Cashback, loyalty points, referral bonuses, see every reward feature Nice88 Asia offers and how to actually make the most of them as a regular player."
  },
  'what-makes-nice88asia-suitable-for-asian-casino-users': {
    meta_title: 'Why Nice88 Asia Is Built for Asian Casino Players | Nice88 Asia',
    meta_description: "Local payment methods, regional support, familiar games, see exactly what makes Nice88 Asia one of the best-fit casino platforms for Asian players."
  },
  'how-nice88asia-creates-a-smooth-casino-experience-for-players': {
    meta_title: 'How Nice88 Asia Delivers a Smoother Casino Experience | Nice88 Asia',
    meta_description: "Fast load times, clean navigation, secure payments, see the design choices behind Nice88 Asia's smooth casino experience for players in Malaysia."
  },
  'a-beginner-introduction-to-the-nice88asia-gaming-platform': {
    meta_title: "New to Nice88 Asia? Your Complete Beginner's Guide | Nice88 Asia",
    meta_description: "First time on Nice88 Asia? This beginner's guide walks you through games, bonuses, and account setup so you can start playing with confidence."
  },
  'why-nice88asia-is-gaining-attention-among-online-casino-players': {
    meta_title: "Why Nice88 Asia Is the Casino Everyone's Talking About | Nice88 Asia",
    meta_description: "From game variety to payout speed, see exactly why Nice88 Asia's popularity among online casino players keeps climbing across the region."
  },
  'understanding-nice88asia-promotions': {
    meta_title: "Nice88 Asia Promotions: The Complete Player's Guide | Nice88 Asia",
    meta_description: "Welcome bonuses, reload offers, seasonal promos, see how Nice88 Asia structures every promotion so you always know what you're actually getting."
  },
  'how-fast-entertainment-gambling-changed-online-casino-design': {
    meta_title: "How 'Fast Entertainment' Reshaped Online Casino Design | Nice88 Asia",
    meta_description: "Instant casino games didn't happen by accident. See how the demand for fast entertainment reshaped modern online casino design from the ground up."
  },
  'why-daily-cashback-keeps-players-coming-back': {
    meta_title: 'Why Daily Cashback Beats Big Bonuses, Every Time | Nice88 Asia',
    meta_description: "Big bonuses look flashy, but daily cashback wins on real value. Here's why cashback casino Malaysia offers build stronger player loyalty long-term."
  },
  'the-new-wave-of-micro-betting-in-malaysia': {
    meta_title: "Micro Betting Is Taking Over Malaysia, Here's Why | Nice88 Asia",
    meta_description: "Small stakes across dozens of matches, micro betting Malaysia is the fastest-growing wagering trend of 2026. See why players are making the switch."
  },
  'ways-online-players-benefit-from-nice88asia-member-bonuses': {
    meta_title: 'How Nice88 Asia Member Bonuses Actually Pay Off | Nice88 Asia',
    meta_description: "Member-only perks can add up fast if you know how to use them. See exactly how Nice88 Asia bonuses benefit regular players beyond the welcome offer."
  },
  'how-promotional-campaigns-are-structured-on-nice88asia': {
    meta_title: "Inside Nice88 Asia's Promotional Campaign Structure | Nice88 Asia",
    meta_description: "Ever wonder how casino promotions are actually built? See the mechanics behind Nice88 Asia's promotional campaigns and how each type benefits players."
  }
};

function readFile(p) {
  return fs.readFileSync(p, 'utf8');
}

function main() {
  const blogs = JSON.parse(readFile(BLOGS_JSON));
  const report = [];
  let missing = [];

  for (const entry of blogs) {
    const update = UPDATES[entry.slug];
    if (!update) {
      missing.push(entry.slug);
      continue;
    }
    const htmlPath = path.join(BLOGS_DIR, entry.slug, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      report.push(`MISSING HTML: ${entry.slug}`);
      continue;
    }
    let html = readFile(htmlPath);
    const oldTitle = entry.meta_title;
    const oldDesc = entry.meta_description;

    const titleCount = html.split(oldTitle).length - 1;
    const descCount = html.split(oldDesc).length - 1;

    html = html.split(oldTitle).join(update.meta_title);
    html = html.split(oldDesc).join(update.meta_description);

    fs.writeFileSync(htmlPath, html, 'utf8');

    entry.meta_title = update.meta_title;
    entry.meta_description = update.meta_description;

    report.push(
      `${entry.slug}: title x${titleCount}, desc x${descCount} | ` +
      `newTitleLen=${update.meta_title.length} newDescLen=${update.meta_description.length}`
    );
  }

  fs.writeFileSync(BLOGS_JSON, JSON.stringify(blogs, null, 2) + '\n', 'utf8');

  console.log(report.join('\n'));
  if (missing.length) {
    console.log('\nNo update provided for slugs:', missing.join(', '));
  }
  console.log(`\nDone. ${blogs.length} total entries, ${blogs.length - missing.length} updated.`);
}

main();
