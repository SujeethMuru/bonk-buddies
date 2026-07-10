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
    golden: { label: 'GOLDEN HAMMER', icon: '✨', duration: 9000, scoreMultiplier: 2 }
  }
};

const HAMMER_IMPACT_DELAY = 90;
const GIANT_HAMMER_IMPACT_DELAY = 100;
const BUDDY_HIT_RADIUS = 18;
const GIANT_BUDDY_HIT_RADIUS = 40;

const BUDDIES = [
  { id: 'charan', sprite: 'charan-clean.png' },
  { id: 'yesh', sprite: 'yesh-clean.png' },
  { id: 'kiran', sprite: 'kiran.png' }
];

const GOLDEN_BUDDY_SPAWN_CHANCE = GAME_CONFIG.goldenBuddy.spawnChance;
const GOLDEN_BUDDY_SCORE_VALUE = GAME_CONFIG.goldenBuddy.scoreValue;
const GOLDEN_BUDDY_VISIBLE_DURATION = GAME_CONFIG.goldenBuddy.visibleDuration;

const screens = { menu: $('#menu'), game: $('#game'), results: $('#results') };
const field = $('#field');
const hammer = $('#hammer');
const toast = $('#toast');
const trackedTimeouts = new Set();

let level = 'normal';
let running = false;
let paused = false;
let score = 0;
let hits = 0;
let misses = 0;
let combo = 0;
let bestCombo = 0;
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

$('#startBtn').addEventListener('click', startGame);
$('#againBtn').addEventListener('click', startGame);
$('#menuBtn').addEventListener('click', () => showScreen('menu'));
$('#quitBtn').addEventListener('click', () => $('#quitModal').classList.remove('hidden'));
$('#pauseBtn').addEventListener('click', pauseGame);
$('#resumeBtn').addEventListener('click', resumeGame);
$('#keepPlaying').addEventListener('click', () => $('#quitModal').classList.add('hidden'));
$('#confirmQuit').addEventListener('click', quitGame);
$('#soundBtn').addEventListener('click', toggleSound);

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
  const impactDelay = activePower?.id === 'giant' ? GIANT_HAMMER_IMPACT_DELAY : HAMMER_IMPACT_DELAY;
  scheduleTimeout(() => performHammerStrike(strikeX, strikeY), impactDelay);
});

function performHammerStrike(strikeX, strikeY) {
  if (!running) return;
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
    return buddy && distanceToRect(strikeX, strikeY, buddy.getBoundingClientRect()) <= hitRadius;
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
}

function startGame() {
  initAudio();
  clearGameTimers();
  clearActivePower();
  removePowerupCollectible();
  score = 0;
  hits = 0;
  misses = 0;
  combo = 0;
  bestCombo = 0;
  lastSpecialPattern = '';
  pausedPower = null;
  timeLeft = GAME_CONFIG.duration;
  paused = false;
  running = true;
  $('#pauseModal').classList.add('hidden');
  $('#quitModal').classList.add('hidden');
  $$('.hole').forEach(clearHole);
  showScreen('game');
  lastTick = performance.now();
  updateHud();
  scheduleNextPattern(350);
  clockTimer = setInterval(tick, 100);
  powerTimer = setInterval(trySpawnPowerup, GAME_CONFIG.powerups.checkInterval);
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
  const delay = extraDelay + settings.spawnGap * (0.78 + Math.random() * 0.42);
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
  hole._buddy = { who, isGolden, isFakeOut: Boolean(options.fakeOut) };

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
  hole._timer = scheduleTimeout(() => expireBuddy(hole), visibleDuration);
  return true;
}

function expireBuddy(hole) {
  if (!hole.classList.contains('up')) return;
  if (hole.dataset.hit === '0' && !hole._buddy?.isFakeOut) {
    combo = 0;
    misses++;
    updateHud();
  }
  clearHole(hole);
}

function hitBuddy(hole) {
  const buddy = hole._buddy;
  if (!buddy || buddy.isFakeOut || hole.dataset.hit === '1') return;

  hole.dataset.hit = '1';
  cancelTimeout(hole._timer);
  hits++;
  combo++;
  bestCombo = Math.max(bestCombo, combo);

  const comboMultiplier = 1 + Math.floor(combo / 5);
  const basePoints = buddy.isGolden ? GOLDEN_BUDDY_SCORE_VALUE : 100 * comboMultiplier;
  const powerMultiplier = activePower?.id === 'golden'
    ? GAME_CONFIG.powerups.golden.scoreMultiplier
    : 1;
  const pointsAwarded = basePoints * powerMultiplier;
  score += pointsAwarded;

  hole.classList.add('hit');
  playHitReaction(hole);
  addSpeechBubble(hole, buddy.isGolden ? `JACKPOT +${pointsAwarded}!` : randomChoice(['OUCH!', 'OW!', 'BONK!']));
  bonk();
  showToast(`${buddy.isGolden ? 'GOLDEN ' : ''}${buddy.who.toUpperCase()} +${pointsAwarded}`);
  updateHud();
  scheduleTimeout(() => clearHole(hole), GAME_CONFIG.reactionDuration);
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
  timeLeft -= now - lastTick;
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
  const powerId = Math.random() < 0.5 ? 'giant' : 'golden';
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
  clearActivePower();
  const config = GAME_CONFIG.powerups[powerId];
  activePower = { id: powerId, expiresAt: performance.now() + config.duration };
  screens.game.classList.toggle('giant-hammer-active', powerId === 'giant');
  powerSound();
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
  activePower = null;
  screens.game.classList.remove('giant-hammer-active');
  $('#powerStatus').textContent = 'NONE';
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
  showScreen('results');
  $('#finalScore').textContent = String(score).padStart(4, '0');
  $('#finalHits').textContent = hits;
  $('#finalCombo').textContent = `x${bestCombo}`;
  const accuracy = hits + misses ? Math.round((hits / (hits + misses)) * 100) : 0;
  $('#finalAccuracy').textContent = `${accuracy}%`;
  $('#rank').textContent = score > 12000 ? 'LEGENDARY BONK LORD' : score > 7000 ? 'HAMMER HERO' : score > 3500 ? 'BONK APPRENTICE' : 'ROOKIE BONKER';
  victorySound();
}

function clearGameTimers() {
  clearTrackedTimeouts();
  clearInterval(clockTimer);
  clearInterval(powerTimer);
  clockTimer = null;
  powerTimer = null;
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

function victorySound() {
  initAudio();
  [262, 330, 392, 523].forEach((frequency, index) => tone(frequency, 0.25, 'square', 0.05, index * 0.12));
}

function startMusic() {
  if (!audioOn || !running) return;
  stopMusic();
  let index = 0;
  const notes = [131, 165, 196, 165, 147, 185, 220, 185, 131, 165, 247, 196, 147, 185, 220, 294];
  musicTimer = setInterval(() => {
    tone(notes[index++ % notes.length], 0.11, 'square', 0.018);
    if (index % 4 === 0) tone(65, 0.08, 'triangle', 0.025);
  }, 140);
}

function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = null;
}
