const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const GAME_CONFIG = {
  duration: 120000,
  difficulties: {
    easy: { visibleDuration: 1250, spawnGap: 800, maxVisible: 2, specialPatternChance: 0.18 },
    normal: { visibleDuration: 1050, spawnGap: 650, maxVisible: 3, specialPatternChance: 0.24 },
    hard: { visibleDuration: 620, spawnGap: 350, maxVisible: 4, specialPatternChance: 0.32 }
  },
  reactions: ['squish', 'shake', 'dizzy', 'surprised', 'particles'],
  reactionDuration: 360,
  retreatDuration: 320,
  teaseDuration: 380,
  teaseChance: 0.38,
  angryReactionChance: 0.18,
  goldenBuddy: {
    spawnChance: 0.07,
    scoreValue: 500,
    visibleDuration: 560
  },
  powerups: {
    checkInterval: 11000,
    appearanceChance: 0.48,
    collectibleDuration: 5000,
    pointerHitRadius: 44,
    giantPointerHitRadius: 78,
    giant: { label: 'GIANT HAMMER', icon: '🔨', duration: 9000 },
    lightning: { label: 'LIGHTNING HAMMER', icon: '⚡', instant: true },
    freeze: { label: 'FREEZE TIME', icon: '❄', duration: 9000, timeScale: 0.35 },
    golden: { label: 'GOLDEN ×2', icon: '×2', duration: 9000, scoreMultiplier: 2 },
    silver: { label: 'SILVER ×1.5', icon: '×1.5', duration: 8000, scoreMultiplier: 1.5 },
    ruby: { label: 'RUBY ×3', icon: '×3', duration: 6500, scoreMultiplier: 3 }
  }
};

const BUDDY_HIT_RADIUS = 52;
const GIANT_BUDDY_HIT_RADIUS = 88;
const STORAGE_KEY = 'bonkBuddiesCareerV1';
const HAMMER_KEY = 'bonkBuddiesHammerV1';
const RANKS = [
  { name: 'ROOKIE BONKER', scorePerMinute: 0 },
  { name: 'BONK APPRENTICE', scorePerMinute: 4500 },
  { name: 'HAMMER HERO', scorePerMinute: 9000 },
  { name: 'LEGENDARY BONK LORD', scorePerMinute: 15000 }
];
const RANK_DIFFICULTY_SCALE = { easy: 0.9, normal: 1, hard: 1.15 };
const RESULTS_CONFIG = {
  medals: {
    bronze: { minimum: 5, label: 'BRONZE', icon: '●' },
    silver: { minimum: 10, label: 'SILVER', icon: '◆' },
    gold: { minimum: 20, label: 'GOLD', icon: '★' }
  },
  personalBests: { accuracyMinimumAttempts: 20 },
  specialTitles: {
    dominationMinimumHits: 12,
    dominationMinimumShare: 0.35,
    goldenHits: 4,
    accuracy: 95,
    accuracyMinimumAttempts: 30,
    combo: 20,
    totalHits: 60,
    lowAccuracy: 35,
    lowAccuracyMinimumAttempts: 15
  },
  confetti: { particleCount: 36, duration: 1050 }
};

const BUDDIES = [
  { id: 'charan', sprite: 'charan-clean.png', angrySprite: 'charan-angry.png' },
  { id: 'yesh', sprite: 'yesh-clean.png', angrySprite: 'yesh-angry.png' },
  { id: 'kiran', sprite: 'kiran.png', angrySprite: 'kiran-angry.png' },
  { id: 'vaibhav', sprite: 'vaibhav.png', angrySprite: 'vaibhav-angry.png' },
  { id: 'anand', sprite: 'anand.png', angrySprite: 'anand-angry.png' },
  { id: 'henry', sprite: 'henry.png', angrySprite: 'henry-angry.png' },
  { id: 'hozaif', sprite: 'hozaif.png', angrySprite: 'hozaif-angry.png' },
  { id: 'johannes', sprite: 'johannes.png', angrySprite: 'johannes-angry.png' },
  { id: 'leyneesh', sprite: 'leyneesh.png', angrySprite: 'leyneesh-angry.png' },
  { id: 'mukesh', sprite: 'mukesh.png', angrySprite: 'mukesh-angry.png' },
  { id: 'rohan', sprite: 'rohan.png', angrySprite: 'rohan-angry.png' },
  { id: 'aryan', sprite: 'aryan.png', angrySprite: 'aryan-angry.png' },
  { id: 'philip', sprite: 'philip.png', angrySprite: 'philip-angry.png' },
  { id: 'rashid', sprite: 'rashid.png', angrySprite: 'rashid-angry.png' },
  { id: 'sebastion', sprite: 'sebastion.png', angrySprite: 'sebastion-angry.png' },
  { id: 'adan', sprite: 'adan.png', angrySprite: 'adan-angry.png' },
  { id: 'zain', sprite: 'zain.png', angrySprite: 'zain-angry.png' }
];

const BUDDY_RESULTS_COPY = {
  charan: { titles: ['CHARAN CRUSHER', "CHARAN'S NEMESIS", 'CERTIFIED CHARAN BONKER'], comments: ["I'm filing a complaint.", 'Was all of that really necessary?', 'You have a problem.'] },
  yesh: { titles: ['YESH DESTROYER', "YESH'S WORST NIGHTMARE", 'CERTIFIED YESH BULLY'], comments: ['Bro... why me?', 'I thought we were friends.', 'You enjoyed that way too much.'] },
  kiran: { titles: ['KIRAN WRECKER', "KIRAN'S BIGGEST HATER", 'KIRAN BONK MACHINE'], comments: ['Again?!', 'This feels personal.', "I'm never playing with you again."] },
  vaibhav: { titles: ['VAIBHAV VANQUISHER', "VAIBHAV'S PROBLEM", 'CERTIFIED VAIBHAV MENACE'], comments: ['You could have bonked literally anyone else.', 'I demand a rematch.', 'That was targeted harassment.'] },
  anand: { titles: ['ANAND ANNIHILATOR', "ANAND'S ARCHRIVAL", 'ANAND BONK SPECIALIST'], comments: ['I will remember this.', 'You chose violence.', 'Unbelievable.'] },
  henry: { titles: ['HENRY HUNTER', "HENRY'S HR COMPLAINT", 'HENRY BONK MASTER'], comments: ['HR will be hearing about this.', 'This workplace is unsafe.', 'I need a helmet.'] },
  hozaif: { titles: ['HOZAIF HAVOC', "HOZAIF'S HEADACHE", 'CERTIFIED HOZAIF BONKER'], comments: ['What did I even do?', 'That hammer has my name on it.', "I'm leaving."] },
  johannes: { titles: ['JOHANNES OBLITERATOR', "JOHANNES' NEMESIS", 'JOHANNES BONK EXPERT'], comments: ['This friendship has consequences.', 'You are way too accurate.', 'I was barely on screen.'] },
  leyneesh: { titles: ['LEYNEESH DESTROYER', "LEYNEESH'S WORST DAY", 'LEYNEESH BONK MACHINE'], comments: ['You were waiting for me, weren\'t you?', 'I saw that coming.', 'This is bullying.'] },
  mukesh: { titles: ['MUKESH MENACE', 'MUKESH DESTROYER', "MUKESH'S ARCHRIVAL"], comments: ['I need better insurance.', 'You bonked me into retirement.', 'Never again.'] },
  rohan: { titles: ['ROHAN RUINER', "ROHAN'S RIVAL", 'ROHAN BONK SPECIALIST'], comments: ['I want a recount.', 'That was completely unnecessary.', 'You have made an enemy today.'] },
  aryan: { titles: ['ARYAN ANNIHILATOR', "ARYAN'S ARCHRIVAL", 'ARYAN BONK AUTHORITY'], comments: ['The suit did not protect me.', 'This was absolutely personal.', 'I need a safer profile picture.'] },
  philip: { titles: ['PHILIP PUMMELER', "PHILIP'S PROBLEM", 'CERTIFIED PHILIP BONKER'], comments: ['My glasses saw every hit coming.', 'Can we discuss this calmly?', 'I would like one normal match.'] },
  rashid: { titles: ['RASHID WRECKER', "RASHID'S RIVAL", 'RASHID BONK SPECIALIST'], comments: ['I was minding my business.', 'That was an unreasonable number of bonks.', 'We need to talk.'] },
  sebastion: { titles: ['SEBASTION SMASHER', "SEBASTION'S NEMESIS", 'SEBASTION BONK MACHINE'], comments: ['The tie was not armor.', 'I expected better from you.', 'This friendship needs a cooldown.'] },
  adan: { titles: ['ADAN ANNIHILATOR', "ADAN'S ADVERSARY", 'ADAN BONK BANDIT'], comments: ['My hair took most of the damage.', 'Was the hammer really necessary?', 'I am reconsidering this friendship.'] },
  zain: { titles: ['ZAIN ZAPPER', "ZAIN'S NEMESIS", 'CERTIFIED ZAIN MENACE'], comments: ['The suit deserved better than this.', 'I came prepared for a meeting, not a bonking.', 'You have made this extremely personal.'] }
};
const DEFAULT_BUDDY_RESULTS_COPY = { titles: ['CERTIFIED BUDDY BONKER'], comments: ['I thought we were friends.'] };

const ACHIEVEMENTS = [
  { id: 'first_bonk', name: 'FIRST CONTACT', detail: 'Land your first bonk.', test: ({ career }) => career.totalHits >= 1 },
  { id: 'combo_10', name: 'DOUBLE DIGITS', detail: 'Reach a 10-hit combo.', test: ({ career }) => career.bestCombo >= 10 },
  { id: 'score_10000', name: 'SCORE CHASER', detail: 'Score 10,000 in one match.', test: ({ career }) => career.bestScore >= 10000 },
  { id: 'gold_rush', name: 'GOLD RUSH', detail: 'Bonk 5 Golden Buddies.', test: ({ career }) => career.goldenHits >= 5 },
  { id: 'sharpshooter', name: 'SHARPSHOOTER', detail: 'Finish with 90% accuracy and 20+ swings.', test: ({ match }) => match.swings >= 20 && match.accuracy >= 90 },
  { id: 'full_roster', name: 'EVERYBODY GETS ONE', detail: 'Bonk every buddy in one match.', test: ({ match }) => BUDDIES.every(({ id }) => match.friendHits[id] > 0) },
  { id: 'veteran', name: 'BONK VETERAN', detail: 'Complete 10 matches.', test: ({ career }) => career.gamesPlayed >= 10 }
];

BUDDIES.forEach(({ sprite, angrySprite }) => {
  [sprite, angrySprite].filter(Boolean).forEach(source => {
    const image = new Image();
    image.src = `assets/${source}`;
  });
});

const GOLDEN_BUDDY_SPAWN_CHANCE = GAME_CONFIG.goldenBuddy.spawnChance;
const GOLDEN_BUDDY_SCORE_VALUE = GAME_CONFIG.goldenBuddy.scoreValue;
const GOLDEN_BUDDY_VISIBLE_DURATION = GAME_CONFIG.goldenBuddy.visibleDuration;

const screens = { menu: $('#menu'), game: $('#game'), results: $('#results') };
const field = $('#field');
const hammer = $('#hammer');
const toast = $('#toast');
const trackedTimeouts = new Set();

let level = 'normal';
let selectedDuration = GAME_CONFIG.duration;
let running = false;
let paused = false;
let score = 0;
let hits = 0;
let misses = 0;
let escaped = 0;
let swings = 0;
let goldenHits = 0;
let powerupsCollected = 0;
let combo = 0;
let bestCombo = 0;
let friendHits = Object.fromEntries(BUDDIES.map(({ id }) => [id, 0]));
let timeLeft = GAME_CONFIG.duration;
let clockTimer = null;
let powerTimer = null;
let musicTimer = null;
let lastTick = 0;
let audioOn = true;
let audioCtx;
let activePower = null;
let pausedPower = null;
let lastSpecialPattern = '';
let selectedHammer = loadValue(HAMMER_KEY, 'classic');
let career = loadCareer();

function loadValue(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

function saveValue(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Storage may be disabled. */ }
}

function freshCareer() {
  return { gamesPlayed: 0, totalScore: 0, totalHits: 0, totalMisses: 0, totalSwings: 0, totalEscaped: 0, bestScore: 0, bestCombo: 0, goldenHits: 0, powerupsCollected: 0, buddyHits: Object.fromEntries(BUDDIES.map(({ id }) => [id, 0])), achievements: [], personalBests: { score: 0, combo: 0, accuracy: 0, hits: 0 } };
}

function loadCareer() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const defaults = freshCareer();
    if (!saved || typeof saved !== 'object') return defaults;
    const savedBests = saved.personalBests && typeof saved.personalBests === 'object' ? saved.personalBests : {};
    return {
      ...defaults,
      ...saved,
      buddyHits: { ...defaults.buddyHits, ...(saved.buddyHits || {}) },
      achievements: Array.isArray(saved.achievements) ? saved.achievements : [],
      personalBests: {
        ...defaults.personalBests,
        score: Number(savedBests.score ?? saved.bestScore) || 0,
        combo: Number(savedBests.combo ?? saved.bestCombo) || 0,
        accuracy: Number(savedBests.accuracy) || 0,
        hits: Number(savedBests.hits) || 0
      }
    };
  } catch { return freshCareer(); }
}

function saveCareer() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(career)); } catch { /* Storage may be disabled. */ }
}

function worldTimeScale() {
  return activePower?.id === 'freeze' ? GAME_CONFIG.powerups.freeze.timeScale : 1;
}

function worldDelay(delay) {
  return delay / worldTimeScale();
}

function scheduleTimeout(callback, delay) {
  const timer = setTimeout(() => {
    trackedTimeouts.delete(timer);
    callback();
  }, delay);
  trackedTimeouts.add(timer);
  return timer;
}

function cancelTimeout(timer) {
  if (!timer) return;
  clearTimeout(timer);
  trackedTimeouts.delete(timer);
}

function clearTrackedTimeouts() {
  trackedTimeouts.forEach(clearTimeout);
  trackedTimeouts.clear();
}

for (let index = 0; index < 9; index++) {
  const hole = document.createElement('div');
  hole.className = 'hole';
  hole.dataset.index = index;
  field.appendChild(hole);
}

$$('[data-level]').forEach(button => {
  button.addEventListener('click', () => {
    $$('[data-level]').forEach(option => option.classList.remove('selected'));
    button.classList.add('selected');
    level = button.dataset.level;
    blip(520, 0.05);
  });
});

$$('[data-duration]').forEach(button => {
  button.addEventListener('click', () => {
    $$('[data-duration]').forEach(option => option.classList.remove('selected'));
    button.classList.add('selected');
    selectedDuration = Number(button.dataset.duration);
    blip(620, 0.04);
  });
});

$$('[data-hammer]').forEach(button => {
  button.classList.toggle('selected', button.dataset.hammer === selectedHammer);
  button.addEventListener('click', () => {
    selectedHammer = button.dataset.hammer;
    $$('[data-hammer]').forEach(option => option.classList.toggle('selected', option === button));
    applyHammerStyle();
    saveValue(HAMMER_KEY, selectedHammer);
    blip(720, 0.05);
  });
});

$('#startBtn').addEventListener('click', startGame);
$('#againBtn').addEventListener('click', startGame);
$('#menuBtn').addEventListener('click', () => showScreen('menu'));
$('#quitBtn').addEventListener('click', () => $('#quitModal').classList.remove('hidden'));
$('#pauseBtn').addEventListener('click', pauseGame);
$('#resumeBtn').addEventListener('click', resumeGame);
$('#keepPlaying').addEventListener('click', () => $('#quitModal').classList.add('hidden'));
$('#confirmQuit').addEventListener('click', quitGame);
$('#soundBtn').addEventListener('click', toggleSound);
$('#resetStatsBtn').addEventListener('click', () => {
  if (!window.confirm('Reset all Bonk Career statistics and achievements?')) return;
  career = freshCareer();
  saveCareer();
  renderCareer();
});

applyHammerStyle();
renderCareer();

document.addEventListener('pointermove', event => {
  hammer.style.left = `${event.clientX}px`;
  hammer.style.top = `${event.clientY}px`;
});

document.addEventListener('pointerdown', event => {
  hammer.classList.remove('swing');
  void hammer.offsetWidth;
  hammer.classList.add('swing');
  if (!running || !screens.game.contains(event.target) || event.target.closest('.game-controls, .quit-modal')) return;
  const strikeX = event.clientX;
  const strikeY = event.clientY;
  performHammerStrike(strikeX, strikeY);
});

function performHammerStrike(strikeX, strikeY) {
  if (!running) return;
  swings++;
  const collectedPowerup = collectNearbyPowerup(strikeX, strikeY);
  const hitRadius = activePower?.id === 'giant' ? GIANT_BUDDY_HIT_RADIUS : BUDDY_HIT_RADIUS;
  const hole = findBuddyAtStrike(strikeX, strikeY, hitRadius);
  if (hole) {
    hitBuddy(hole);
    return;
  }
  const fieldBounds = field.getBoundingClientRect();
  if (collectedPowerup || !pointInsideRect(strikeX, strikeY, fieldBounds)) return;
  misses++;
  combo = 0;
  updateHud();
  blip(100, 0.04);
}

function findBuddyAtStrike(strikeX, strikeY, hitRadius) {
  return $$('.hole.up').find(hole => {
    const buddy = hole.querySelector('.buddy');
    const canReact = hole.dataset.hit === '0' || hole._buddy?.isFakeOut;
    return buddy && canReact && distanceToRect(strikeX, strikeY, buddy.getBoundingClientRect()) <= hitRadius;
  });
}

function pointInsideRect(x, y, rect) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function distanceToRect(x, y, rect) {
  const nearestX = Math.max(rect.left, Math.min(x, rect.right));
  const nearestY = Math.max(rect.top, Math.min(y, rect.bottom));
  return Math.hypot(x - nearestX, y - nearestY);
}

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.add('hidden'));
  screens[name].classList.remove('hidden');
  $('#hud').classList.toggle('hidden', name !== 'game');
  if (name === 'menu') renderCareer();
}

function startGame() {
  initAudio();
  clearPixelConfetti();
  clearGameTimers();
  clearActivePower();
  removePowerupCollectible();
  score = 0;
  hits = 0;
  misses = 0;
  escaped = 0;
  swings = 0;
  goldenHits = 0;
  powerupsCollected = 0;
  combo = 0;
  bestCombo = 0;
  friendHits = Object.fromEntries(BUDDIES.map(({ id }) => [id, 0]));
  lastSpecialPattern = '';
  pausedPower = null;
  timeLeft = selectedDuration;
  paused = false;
  running = true;
  screens.game.classList.remove('mode-easy', 'mode-normal', 'mode-hard');
  screens.game.classList.add(`mode-${level}`);
  applyHammerStyle();
  $('#pauseModal').classList.add('hidden');
  $('#quitModal').classList.add('hidden');
  $$('.hole').forEach(clearHole);
  showScreen('game');
  lastTick = performance.now();
  updateHud();
  scheduleNextPattern(350);
  clockTimer = setInterval(tick, 100);
  powerTimer = setInterval(trySpawnPowerup, GAME_CONFIG.powerups.checkInterval);
  scheduleTimeout(trySpawnPowerup, Math.min(5000, selectedDuration * 0.25));
  startMusic();
  showToast(`${level.toUpperCase()} MODE!`);
}

function quitGame() {
  running = false;
  paused = false;
  clearGameTimers();
  clearActivePower();
  removePowerupCollectible();
  $$('.hole').forEach(clearHole);
  $('#quitModal').classList.add('hidden');
  showScreen('menu');
}

function scheduleNextPattern(extraDelay = 0) {
  if (!running) return;
  const settings = GAME_CONFIG.difficulties[level];
  const delay = worldDelay(extraDelay + settings.spawnGap * (0.78 + Math.random() * 0.42));
  scheduleTimeout(() => {
    const patternDuration = runSelectedPattern();
    scheduleNextPattern(patternDuration);
  }, delay);
}

const SPAWN_PATTERNS = {
  standard() {
    spawnBuddy();
    return 0;
  },
  leftToRight() {
    const rowStart = Math.floor(Math.random() * 3) * 3;
    [0, 1, 2].forEach((offset, step) => schedulePatternSpawn(step * 170, rowStart + offset));
    return 420;
  },
  rightToLeft() {
    const rowStart = Math.floor(Math.random() * 3) * 3;
    [2, 1, 0].forEach((offset, step) => schedulePatternSpawn(step * 170, rowStart + offset));
    return 420;
  },
  double() {
    spawnBuddy();
    schedulePatternSpawn(90);
    return 180;
  },
  triple() {
    spawnBuddy();
    schedulePatternSpawn(75);
    schedulePatternSpawn(150);
    return 250;
  },
  speedBurst() {
    [0, 120, 240, 360].forEach(delay => schedulePatternSpawn(delay, null, { durationScale: 0.62 }));
    return 480;
  },
  fakeOut() {
    spawnBuddy({ fakeOut: true });
    return 300;
  }
};

function runSelectedPattern() {
  const settings = GAME_CONFIG.difficulties[level];
  if (Math.random() >= settings.specialPatternChance) return SPAWN_PATTERNS.standard();
  const patternNames = ['leftToRight', 'rightToLeft', 'double', 'triple', 'speedBurst', 'fakeOut'];
  const eligiblePatterns = patternNames.filter(name => name !== lastSpecialPattern);
  const selectedName = randomChoice(eligiblePatterns);
  lastSpecialPattern = selectedName;
  return SPAWN_PATTERNS[selectedName]();
}

function schedulePatternSpawn(delay, holeIndex = null, options = {}) {
  scheduleTimeout(() => {
    if (running) spawnBuddy({ ...options, holeIndex });
  }, delay);
}

function spawnBuddy(options = {}) {
  if (!running) return false;
  const settings = GAME_CONFIG.difficulties[level];
  const openHoles = $$('.hole:not(.up)');
  if (!openHoles.length || $$('.hole.up').length >= settings.maxVisible) return false;

  let hole = options.holeIndex === null || options.holeIndex === undefined
    ? null
    : field.querySelector(`.hole[data-index="${options.holeIndex}"]:not(.up)`);
  if (!hole) hole = openHoles[Math.floor(Math.random() * openHoles.length)];

  const buddy = randomChoice(BUDDIES);
  const who = buddy.id;
  const isGolden = !options.fakeOut && Math.random() < GOLDEN_BUDDY_SPAWN_CHANCE;
  const image = new Image();
  image.className = 'buddy';
  image.src = `assets/${buddy.sprite}`;
  image.alt = `${isGolden ? 'Golden ' : ''}${who}`;

  clearHole(hole);
  const buddyStage = document.createElement('div');
  buddyStage.className = 'buddy-stage';
  buddyStage.appendChild(image);
  hole.appendChild(buddyStage);
  if (isGolden) hole.classList.add('golden');
  if (options.fakeOut) hole.classList.add('fake-out');
  hole.dataset.hit = '0';
  hole._buddy = { who, angrySprite: buddy.angrySprite, isGolden, isFakeOut: Boolean(options.fakeOut) };

  if (isGolden) {
    addHoleBadge(hole, 'GOLD!', 'golden-badge');
    addGoldenSparkles(hole);
  }
  if (options.fakeOut) addHoleBadge(hole, '?', 'fake-badge');

  // Commit the hidden starting position before raising the buddy.
  void buddyStage.offsetHeight;
  hole.classList.add('up');

  const baseDuration = isGolden ? GOLDEN_BUDDY_VISIBLE_DURATION : settings.visibleDuration;
  const visibleDuration = options.fakeOut ? 260 : baseDuration * (options.durationScale || 1);
  hole._timer = scheduleTimeout(() => expireBuddy(hole), worldDelay(visibleDuration));
  return true;
}

function expireBuddy(hole) {
  if (!hole.classList.contains('up')) return;
  const shouldTease = hole._buddy?.isFakeOut || Math.random() < GAME_CONFIG.teaseChance;
  if (!shouldTease) {
    beginRetreat(hole);
    return;
  }
  hole.classList.add('teasing');
  const tease = hole._buddy?.isFakeOut
    ? randomChoice(['PSYCH!', 'TOO SLOW!', 'GOTCHA!'])
    : randomChoice(['MISSED ME!', 'NICE TRY!', 'TOO SLOW!']);
  addSpeechBubble(hole, tease);
  hole._timer = scheduleTimeout(() => beginRetreat(hole), worldDelay(GAME_CONFIG.teaseDuration));
}

function hitBuddy(hole) {
  const buddy = hole._buddy;
  if (!buddy || buddy.isFakeOut || hole.dataset.hit === '1') return;

  hole.dataset.hit = '1';
  cancelTimeout(hole._timer);
  hole.classList.remove('teasing', 'retreating');
  hits++;
  friendHits[buddy.who]++;
  if (buddy.isGolden) goldenHits++;
  combo++;
  bestCombo = Math.max(bestCombo, combo);

  const comboMultiplier = 1 + Math.floor(combo / 5);
  const basePoints = buddy.isGolden ? GOLDEN_BUDDY_SCORE_VALUE : 100 * comboMultiplier;
  const powerMultiplier = activePower
    ? GAME_CONFIG.powerups[activePower.id].scoreMultiplier || 1
    : 1;
  const pointsAwarded = basePoints * powerMultiplier;
  score += pointsAwarded;

  hole.classList.add('hit');
  const isAngryReaction = buddy.angrySprite && Math.random() < GAME_CONFIG.angryReactionChance;
  if (isAngryReaction) {
    const image = hole.querySelector('.buddy');
    if (image) image.src = `assets/${buddy.angrySprite}`;
    hole.classList.add('angry-reaction');
  }
  playHitReaction(hole);
  const reactionText = buddy.isGolden
    ? `JACKPOT +${pointsAwarded}!`
    : isAngryReaction
      ? randomChoice(['HEY!', 'RUDE!', 'MY FACE!'])
      : randomChoice(['OUCH!', 'OW!', 'BONK!']);
  addSpeechBubble(hole, reactionText);
  bonk();
  showToast(`${buddy.isGolden ? 'GOLDEN ' : ''}${buddy.who.toUpperCase()} +${pointsAwarded}`);
  updateHud();
  scheduleTimeout(() => beginRetreat(hole), worldDelay(GAME_CONFIG.reactionDuration));
}

function beginRetreat(hole) {
  if (!hole || hole.classList.contains('retreating')) return;
  cancelTimeout(hole._timer);
  hole.classList.remove('teasing');
  hole.classList.add('retreating');
  hole._timer = scheduleTimeout(() => finishRetreat(hole), worldDelay(GAME_CONFIG.retreatDuration));
}

function finishRetreat(hole) {
  if (hole.dataset.hit === '0' && !hole._buddy?.isFakeOut) {
    combo = 0;
    escaped++;
    updateHud();
  }
  hole.classList.add('expired');
  clearHole(hole);
}

function playHitReaction(hole) {
  const reaction = randomChoice(GAME_CONFIG.reactions);
  hole.classList.add(`reaction-${reaction}`);
  if (reaction === 'dizzy') addDizzyStars(hole);
  if (reaction === 'particles') addPixelParticles(hole, activePower?.id === 'giant' ? 10 : 6);
  if (activePower?.id === 'giant' && reaction !== 'particles') addPixelParticles(hole, 8);
}

function addSpeechBubble(hole, text) {
  const speech = document.createElement('span');
  speech.className = 'speech';
  speech.textContent = text;
  hole.appendChild(speech);
}

function addDizzyStars(hole) {
  const stars = document.createElement('span');
  stars.className = 'dizzy-stars';
  stars.innerHTML = '<i>★</i><i>★</i><i>★</i>';
  hole.appendChild(stars);
}

function addPixelParticles(hole, count) {
  const colors = ['#ffd43b', '#ff7a2d', '#42d7cc', '#fff2c6'];
  for (let index = 0; index < count; index++) {
    const particle = document.createElement('i');
    particle.className = 'hit-particle';
    particle.style.setProperty('--particle-angle', `${(360 / count) * index}deg`);
    particle.style.setProperty('--particle-color', colors[index % colors.length]);
    hole.appendChild(particle);
  }
}

function addGoldenSparkles(hole) {
  for (let index = 0; index < 4; index++) {
    const sparkle = document.createElement('i');
    sparkle.className = 'golden-sparkle';
    sparkle.style.setProperty('--sparkle-delay', `${index * 0.12}s`);
    sparkle.style.setProperty('--sparkle-left', `${24 + index * 17}%`);
    hole.appendChild(sparkle);
  }
}

function addHoleBadge(hole, text, className) {
  const badge = document.createElement('span');
  badge.className = `hole-badge ${className}`;
  badge.textContent = text;
  hole.appendChild(badge);
}

function clearHole(hole) {
  if (!hole) return;
  cancelTimeout(hole._timer);
  hole.className = 'hole';
  hole.innerHTML = '';
  hole.dataset.hit = '';
  hole._buddy = null;
  hole._timer = null;
}

function tick() {
  const now = performance.now();
  timeLeft -= (now - lastTick) * worldTimeScale();
  lastTick = now;
  updateActivePower(now);
  if (timeLeft <= 0) {
    endGame();
    return;
  }
  updateHud();
}

function updateHud() {
  const seconds = Math.max(0, Math.ceil(timeLeft / 1000));
  $('#score').textContent = String(score).padStart(4, '0');
  $('#timer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  $('#combo').textContent = `x${Math.max(1, 1 + Math.floor(combo / 5))}`;
}

function trySpawnPowerup() {
  if (!running || $('.powerup') || Math.random() > GAME_CONFIG.powerups.appearanceChance) return;
  const roll = Math.random();
  const powerId = roll < 0.22 ? 'giant'
    : roll < 0.4 ? 'golden'
      : roll < 0.55 ? 'silver'
        : roll < 0.67 ? 'ruby'
          : roll < 0.83 ? 'lightning'
            : 'freeze';
  const config = GAME_CONFIG.powerups[powerId];
  const collectible = document.createElement('button');
  collectible.className = `powerup powerup-${powerId}`;
  collectible.type = 'button';
  collectible.textContent = config.icon;
  collectible.title = config.label;
  collectible.setAttribute('aria-label', `Collect ${config.label}`);
  collectible.style.left = `${10 + Math.random() * 80}%`;
  collectible.style.top = `${38 + Math.random() * 42}%`;
  collectible.dataset.powerId = powerId;
  screens.game.appendChild(collectible);
  collectible._timer = scheduleTimeout(() => collectible.remove(), GAME_CONFIG.powerups.collectibleDuration);
}

function collectPowerup(collectible) {
  if (!collectible?.isConnected) return;
  const powerId = collectible.dataset.powerId;
  cancelTimeout(collectible._timer);
  collectible.remove();
  powerupsCollected++;
  activatePowerup(powerId);
}

function collectNearbyPowerup(pointerX, pointerY) {
  if (!running) return false;
  const collectible = $('.powerup');
  if (!collectible) return false;
  const bounds = collectible.getBoundingClientRect();
  const distance = distanceToRect(pointerX, pointerY, bounds);
  const hitRadius = activePower?.id === 'giant'
    ? GAME_CONFIG.powerups.giantPointerHitRadius
    : GAME_CONFIG.powerups.pointerHitRadius;
  if (distance > hitRadius) return false;
  collectPowerup(collectible);
  return true;
}

function activatePowerup(powerId) {
  if (powerId === 'lightning') {
    activateLightningHammer();
    return;
  }
  clearActivePower();
  const config = GAME_CONFIG.powerups[powerId];
  activePower = { id: powerId, expiresAt: performance.now() + config.duration };
  screens.game.classList.toggle('giant-hammer-active', powerId === 'giant');
  screens.game.classList.toggle('freeze-time-active', powerId === 'freeze');
  if (powerId === 'freeze') slowVisibleBuddies();
  powerSound();
  startMusic();
  updateActivePower(performance.now());
  showToast(`${config.label}!`);
}

function updateActivePower(now) {
  if (!activePower) {
    $('#powerStatus').textContent = 'NONE';
    return;
  }
  if (now >= activePower.expiresAt) {
    clearActivePower();
    return;
  }
  const config = GAME_CONFIG.powerups[activePower.id];
  const secondsLeft = Math.ceil((activePower.expiresAt - now) / 1000);
  $('#powerStatus').textContent = `${config.label} ${secondsLeft}s`;
}

function clearActivePower() {
  const wasFreeze = activePower?.id === 'freeze';
  activePower = null;
  screens.game.classList.remove('giant-hammer-active', 'freeze-time-active');
  $('#powerStatus').textContent = 'NONE';
  if (wasFreeze && running) startMusic();
}

function activateLightningHammer() {
  const targets = $$('.hole.up').filter(hole => hole._buddy && !hole._buddy.isFakeOut && hole.dataset.hit === '0');
  showLightningStorm();
  lightningSound();
  targets.forEach(hitBuddy);
  showToast(targets.length ? `LIGHTNING BONK x${targets.length}!` : 'LIGHTNING STRIKE!');
}

function showLightningStorm() {
  $('.lightning-storm')?.remove();
  const storm = document.createElement('div');
  storm.className = 'lightning-storm';
  for (let index = 0; index < 9; index++) {
    const bolt = document.createElement('i');
    bolt.style.setProperty('--bolt-x', `${5 + Math.random() * 90}%`);
    bolt.style.setProperty('--bolt-delay', `${Math.random() * 0.18}s`);
    bolt.style.setProperty('--bolt-tilt', `${-18 + Math.random() * 36}deg`);
    storm.appendChild(bolt);
  }
  screens.game.appendChild(storm);
  scheduleTimeout(() => storm.remove(), 800);
}

function slowVisibleBuddies() {
  $$('.hole.up').forEach(hole => {
    cancelTimeout(hole._timer);
    const retreating = hole.classList.contains('retreating');
    const teasing = hole.classList.contains('teasing');
    const delay = retreating ? GAME_CONFIG.retreatDuration
      : teasing ? GAME_CONFIG.teaseDuration
        : GAME_CONFIG.difficulties[level].visibleDuration;
    const callback = retreating ? finishRetreat : teasing ? beginRetreat : expireBuddy;
    hole._timer = scheduleTimeout(() => callback(hole), worldDelay(delay));
  });
}

function removePowerupCollectible() {
  const collectible = $('.powerup');
  if (!collectible) return;
  cancelTimeout(collectible._timer);
  collectible.remove();
}

function pauseGame() {
  if (!running || paused) return;
  paused = true;
  running = false;
  pausedPower = activePower
    ? { id: activePower.id, remaining: Math.max(0, activePower.expiresAt - performance.now()) }
    : null;
  clearGameTimers();
  clearActivePower();
  removePowerupCollectible();
  $$('.hole').forEach(clearHole);
  $('#pauseModal').classList.remove('hidden');
}

function resumeGame() {
  if (!paused) return;
  paused = false;
  running = true;
  lastTick = performance.now();
  $('#pauseModal').classList.add('hidden');
  scheduleNextPattern(250);
  clockTimer = setInterval(tick, 100);
  powerTimer = setInterval(trySpawnPowerup, GAME_CONFIG.powerups.checkInterval);
  if (pausedPower?.remaining > 0) {
    activePower = { id: pausedPower.id, expiresAt: performance.now() + pausedPower.remaining };
    screens.game.classList.toggle('giant-hammer-active', activePower.id === 'giant');
    screens.game.classList.toggle('freeze-time-active', activePower.id === 'freeze');
    pausedPower = null;
    updateActivePower(performance.now());
  }
  startMusic();
  showToast('GO!');
}

function endGame() {
  running = false;
  clearGameTimers();
  clearActivePower();
  removePowerupCollectible();
  $$('.hole').forEach(clearHole);
  const match = calculateMatchResults();
  const personalBests = updatePersonalBests(match);
  const unlocked = recordCareer(match);
  showScreen('results');
  renderMatchSummary(match);
  renderSpecialTitle(match.specialTitle);
  renderPersonalBestNotices(personalBests);
  renderMostBonkedBuddy(match.mostBonked, match.specialTitle);
  renderBuddyStats(match.buddyResults);
  renderUnlockedAchievements(unlocked);
  if (shouldLaunchConfetti(match, personalBests)) launchPixelConfetti();
  victorySound();
}

function calculateMatchResults() {
  const accuracy = swings ? Math.max(0, Math.round(((swings - misses) / swings) * 100)) : 0;
  const rankResult = calculateRank(score);
  const buddyResults = BUDDIES.map(buddy => ({ ...buddy, hits: friendHits[buddy.id] || 0, medal: determineBuddyMedal(friendHits[buddy.id] || 0) }));
  const mostBonked = determineMostBonkedBuddy(buddyResults, hits);
  const match = { score, hits, misses, escaped, swings, accuracy, bestCombo, goldenHits, powerupsCollected, friendHits: { ...friendHits }, rankResult, buddyResults, mostBonked };
  match.specialTitle = determineSpecialTitle(match);
  return match;
}

function determineBuddyMedal(hitCount) {
  for (const tier of ['gold', 'silver', 'bronze']) {
    const medal = RESULTS_CONFIG.medals[tier];
    if (hitCount >= medal.minimum) return { tier, ...medal };
  }
  return null;
}

function determineMostBonkedBuddy(buddyResults, totalHits) {
  const highest = Math.max(0, ...buddyResults.map(buddy => buddy.hits));
  if (highest === 0) return { type: 'empty', count: 0, leaders: [], share: 0 };
  const leaders = buddyResults.filter(buddy => buddy.hits === highest);
  if (leaders.length > 1) return { type: 'tie', count: highest, leaders, share: totalHits ? highest / totalHits : 0 };
  const buddy = leaders[0];
  const copy = BUDDY_RESULTS_COPY[buddy.id] || DEFAULT_BUDDY_RESULTS_COPY;
  return { type: 'single', count: highest, leaders, buddy, share: totalHits ? highest / totalHits : 0, title: randomChoice(copy.titles), commentary: randomChoice(copy.comments) };
}

function determineSpecialTitle(match) {
  const rules = RESULTS_CONFIG.specialTitles;
  if (BUDDIES.every(({ id }) => match.friendHits[id] > 0)) return { title: 'EQUAL OPPORTUNITY BONKER', description: 'Bonked every buddy at least once.' };
  if (match.mostBonked.type === 'single' && match.mostBonked.count >= rules.dominationMinimumHits && match.mostBonked.share >= rules.dominationMinimumShare) {
    return { title: match.mostBonked.title, description: `${match.mostBonked.buddy.id.toUpperCase()} took ${Math.round(match.mostBonked.share * 100)}% of all bonks.` };
  }
  if (match.goldenHits >= rules.goldenHits) return { title: 'GOLDEN TOUCH', description: `Bonked ${match.goldenHits} Golden Buddies.` };
  if (match.swings >= rules.accuracyMinimumAttempts && match.accuracy >= rules.accuracy) return { title: 'PIXEL SNIPER', description: `Finished with ${match.accuracy}% accuracy.` };
  if (match.bestCombo >= rules.combo) return { title: 'COMBO KING', description: `Built a ${match.bestCombo}-bonk combo.` };
  if (match.hits >= rules.totalHits) return { title: 'BONK MACHINE', description: `Landed ${match.hits} bonks in one match.` };
  if (match.swings >= rules.lowAccuracyMinimumAttempts && match.accuracy <= rules.lowAccuracy) return { title: 'PROFESSIONAL AIR BONKER', description: `${match.accuracy}% accuracy. The air never stood a chance.` };
  return { title: 'ROOKIE BONKER', description: 'Every bonk legend starts somewhere.' };
}

function updatePersonalBests(match) {
  const bests = career.personalBests;
  const records = [];
  if (match.score > bests.score) records.push({ key: 'score', label: 'NEW HIGH SCORE!', value: match.score.toLocaleString() });
  if (match.bestCombo > bests.combo) records.push({ key: 'combo', label: 'NEW BEST COMBO!', value: `x${match.bestCombo}` });
  if (match.swings >= RESULTS_CONFIG.personalBests.accuracyMinimumAttempts && match.accuracy > bests.accuracy) records.push({ key: 'accuracy', label: 'NEW ACCURACY RECORD!', value: `${match.accuracy}%` });
  if (match.hits > bests.hits) records.push({ key: 'hits', label: 'NEW MOST BONKS RECORD!', value: match.hits });
  bests.score = Math.max(bests.score, match.score);
  bests.combo = Math.max(bests.combo, match.bestCombo);
  bests.hits = Math.max(bests.hits, match.hits);
  if (match.swings >= RESULTS_CONFIG.personalBests.accuracyMinimumAttempts) bests.accuracy = Math.max(bests.accuracy, match.accuracy);
  return records;
}

function calculateRank(matchScore) {
  const minutes = selectedDuration / 60000;
  const scale = RANK_DIFFICULTY_SCALE[level];
  const ranked = RANKS.map(rank => ({ ...rank, threshold: Math.round(rank.scorePerMinute * minutes * scale) }));
  let index = 0;
  ranked.forEach((rank, rankIndex) => { if (matchScore >= rank.threshold) index = rankIndex; });
  return { rank: ranked[index], next: ranked[index + 1] || null };
}

function recordCareer(match) {
  career.gamesPlayed++;
  career.totalScore += match.score;
  career.totalHits += match.hits;
  career.totalMisses += match.misses;
  career.totalSwings += match.swings;
  career.totalEscaped += match.escaped;
  career.bestScore = Math.max(career.bestScore, match.score);
  career.bestCombo = Math.max(career.bestCombo, match.bestCombo);
  career.goldenHits += match.goldenHits;
  career.powerupsCollected += match.powerupsCollected;
  BUDDIES.forEach(({ id }) => { career.buddyHits[id] += match.friendHits[id]; });
  const unlocked = ACHIEVEMENTS.filter(achievement => !career.achievements.includes(achievement.id) && achievement.test({ career, match }));
  career.achievements.push(...unlocked.map(({ id }) => id));
  saveCareer();
  return unlocked;
}

function renderMatchSummary(match) {
  $('#finalScore').textContent = String(match.score).padStart(4, '0');
  $('#finalHits').textContent = match.hits;
  $('#finalCombo').textContent = `x${match.bestCombo}`;
  $('#finalAccuracy').textContent = `${match.accuracy}%`;
  $('#finalEscaped').textContent = match.escaped;
  $('#finalPowerups').textContent = match.powerupsCollected;
  $('#rank').textContent = match.rankResult.rank.name;
  $('#rankTarget').textContent = match.rankResult.next
    ? `${Math.max(0, match.rankResult.next.threshold - match.score).toLocaleString()} MORE POINTS TO ${match.rankResult.next.name}`
    : 'MAXIMUM BONK STATUS ACHIEVED';
}

function renderSpecialTitle(specialTitle) {
  $('#specialTitle').innerHTML = `<small>MATCH TITLE</small><h3>${specialTitle.title}</h3><p>${specialTitle.description}</p>`;
}

function renderPersonalBestNotices(records) {
  const panel = $('#personalBestNotices');
  panel.classList.toggle('hidden', !records.length);
  panel.innerHTML = records.map(record => `<div><b>${record.label}</b><span>${record.value}</span></div>`).join('');
}

function renderMostBonkedBuddy(result, specialTitle) {
  const panel = $('#mostBonkedBuddy');
  if (result.type === 'empty') {
    panel.innerHTML = '<div class="results-section-heading"><small>MATCH MVP</small><h3 id="mostBonkedHeading">NO BUDDY BONKED</h3></div><p class="mvp-empty">The buddies escaped completely untouched.</p>';
    return;
  }
  if (result.type === 'tie') {
    const visibleLeaders = result.leaders.slice(0, 4);
    const extraLeaders = result.leaders.length - visibleLeaders.length;
    const leaderNames = `${visibleLeaders.map(buddy => buddy.id.toUpperCase()).join(' • ')}${extraLeaders ? ` +${extraLeaders} MORE` : ''}`;
    panel.innerHTML = `<div class="results-section-heading"><small>MATCH MVP</small><h3 id="mostBonkedHeading">TIED FOR MOST BONKED</h3></div><div class="mvp-tie-sprites">${visibleLeaders.map(buddy => `<img src="assets/${buddy.sprite}" alt="${buddy.id}">`).join('')}</div><b class="mvp-name">${leaderNames}</b><p>${result.count} BONKS EACH</p><q>They will be comparing notes.</q>`;
    return;
  }
  const { buddy } = result;
  const titleMarkup = specialTitle.title === result.title ? '' : `<span>${result.title}</span>`;
  panel.innerHTML = `<div class="results-section-heading"><small>MATCH MVP</small><h3 id="mostBonkedHeading">MOST BONKED BUDDY</h3></div><div class="mvp-content"><img src="assets/${buddy.sprite}" alt="Pixel portrait of ${buddy.id}"><div><b class="mvp-name">${buddy.id.toUpperCase()}</b><strong>${result.count} BONKS</strong>${titleMarkup}<q>${result.commentary}</q></div></div>`;
}

function renderBuddyStats(buddyResults) {
  $('#buddyStats').innerHTML = buddyResults.map(buddy => {
    const medalClass = buddy.medal ? ` medal-${buddy.medal.tier}` : '';
    const medalLabel = buddy.medal ? `<span class="medal-label"><i>${buddy.medal.icon}</i>${buddy.medal.label} MEDAL</span>` : '';
    return `<article class="friend-stat${medalClass}"><img src="assets/${buddy.sprite}" alt=""><small>${buddy.id.toUpperCase()}</small><b>${buddy.hits} BONKS</b>${medalLabel}</article>`;
  }).join('');
}

function shouldLaunchConfetti(match, records) {
  const hasGoldMvp = match.mostBonked.leaders.some(buddy => buddy.medal?.tier === 'gold');
  return records.some(record => record.key === 'score') || match.rankResult.rank.name === 'LEGENDARY BONK LORD' || hasGoldMvp || records.length > 1;
}

function launchPixelConfetti() {
  clearPixelConfetti();
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const layer = $('#confettiLayer');
  const colors = ['#ffd43b', '#ff7a2d', '#e73f79', '#42d7cc', '#fff2c6'];
  for (let index = 0; index < RESULTS_CONFIG.confetti.particleCount; index++) {
    const particle = document.createElement('i');
    particle.style.setProperty('--confetti-x', `${Math.random() * 100}%`);
    particle.style.setProperty('--confetti-delay', `${Math.random() * 0.22}s`);
    particle.style.setProperty('--confetti-drift', `${-55 + Math.random() * 110}px`);
    particle.style.setProperty('--confetti-color', colors[index % colors.length]);
    layer.appendChild(particle);
  }
  layer._timer = setTimeout(clearPixelConfetti, RESULTS_CONFIG.confetti.duration);
}

function clearPixelConfetti() {
  const layer = $('#confettiLayer');
  if (!layer) return;
  clearTimeout(layer._timer);
  layer._timer = null;
  layer.innerHTML = '';
}

function renderUnlockedAchievements(unlocked) {
  const panel = $('#unlockedAchievements');
  panel.classList.toggle('hidden', !unlocked.length);
  panel.innerHTML = unlocked.length ? `<small>NEW ACHIEVEMENTS</small>${unlocked.map(({ name }) => `<b>★ ${name}</b>`).join('')}` : '';
}

function renderCareer() {
  const accuracy = career.totalSwings ? Math.round((career.totalSwings - career.totalMisses) / career.totalSwings * 100) : 0;
  $('#careerStats').innerHTML = [
    ['MATCHES', career.gamesPlayed], ['TOTAL SCORE', career.totalScore.toLocaleString()], ['BONKS', career.totalHits.toLocaleString()],
    ['BEST SCORE', career.bestScore.toLocaleString()], ['BEST COMBO', `x${career.bestCombo}`], ['ACCURACY', `${accuracy}%`]
  ].map(([label, value]) => `<div><small>${label}</small><b>${value}</b></div>`).join('');
  $('#achievementList').innerHTML = ACHIEVEMENTS.map(achievement => {
    const unlocked = career.achievements.includes(achievement.id);
    return `<article class="achievement ${unlocked ? 'unlocked' : ''}"><i>${unlocked ? '★' : '◇'}</i><div><b>${achievement.name}</b><small>${achievement.detail}</small></div></article>`;
  }).join('');
}

function applyHammerStyle() {
  document.querySelector('.cabinet').dataset.hammer = selectedHammer;
  screens.menu.dataset.hammer = selectedHammer;
  screens.game.dataset.hammer = selectedHammer;
  hammer.dataset.hammer = selectedHammer;
}

function clearGameTimers() {
  clearTrackedTimeouts();
  clearInterval(clockTimer);
  clearInterval(powerTimer);
  clockTimer = null;
  powerTimer = null;
  $('.lightning-storm')?.remove();
  stopMusic();
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
}

function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function toggleSound() {
  audioOn = !audioOn;
  $('#soundBtn').textContent = audioOn ? '♫ ON' : '♫ OFF';
  if (!audioOn) stopMusic();
  else if (running) startMusic();
}

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  audioCtx.resume();
}

function tone(frequency, duration, type = 'square', volume = 0.035, when = 0) {
  if (!audioOn || !audioCtx) return;
  const scale = worldTimeScale();
  frequency *= scale;
  duration /= scale;
  when /= scale;
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + when);
  gain.gain.setValueAtTime(volume, audioCtx.currentTime + when);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + when + duration);
  oscillator.connect(gain).connect(audioCtx.destination);
  oscillator.start(audioCtx.currentTime + when);
  oscillator.stop(audioCtx.currentTime + when + duration);
}

function blip(frequency, duration) {
  initAudio();
  tone(frequency, duration);
}

function bonk() {
  initAudio();
  tone(120, 0.12, 'square', 0.09);
  tone(75, 0.2, 'sawtooth', 0.055, 0.04);
  tone(500, 0.06, 'square', 0.025, 0.06);
}

function powerSound() {
  [300, 450, 650, 900].forEach((frequency, index) => tone(frequency, 0.13, 'square', 0.04, index * 0.07));
}

function lightningSound() {
  initAudio();
  [980, 720, 1120, 540].forEach((frequency, index) => tone(frequency, 0.09, 'sawtooth', 0.055, index * 0.045));
}

function victorySound() {
  initAudio();
  [262, 330, 392, 523].forEach((frequency, index) => tone(frequency, 0.25, 'square', 0.05, index * 0.12));
}

function startMusic() {
  if (!audioOn || !running) return;
  stopMusic();
  let index = 0;
  const scale = worldTimeScale();
  const notes = [131, 165, 196, 165, 147, 185, 220, 185, 131, 165, 247, 196, 147, 185, 220, 294];
  musicTimer = setInterval(() => {
    tone(notes[index++ % notes.length], 0.11, 'square', 0.018);
    if (index % 4 === 0) tone(65, 0.08, 'triangle', 0.025);
  }, 140 / scale);
}

function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = null;
}
