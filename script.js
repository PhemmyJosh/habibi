'use strict';

/* ╔══════════════════════════════════════════════
   CONFIG
══════════════════════════════════════════════╝ */
const CFG = {
  heart: {
    intervalMin: 2000,
    intervalMax: 4000,
    emojis: ['💜', '💜', '💜', '🤍', '✨', '💜'],
  },
  sparkle: {
    max: 15,
    throttleMs: 28,
    colors: ['#C4B5FD', '#E9D5FF', '#A78BFA', '#ffffff', '#FCD34D', '#F9A8D4'],
  },
  type: {
    charMs:  { default: 13, year: 30, em: 18 },
    lineMs:  { default: 240, year: 480, em: 300, empty: 170 },
  },
  confetti: {
    count: 135,
    colors: ['#6D28D9','#7C3AED','#C4B5FD','#E9D5FF','#FFF8F0','#FCD34D','#F9A8D4','#A78BFA','#DDD6FE'],
  },
  question: {
    habibiDelay: 500,
    lineGap: 640,
    afterLines: 2400,
  },
  no: {
    texts: [
      "Hmm... no?",
      "That's suspicious 👀",
      "Habibi please 😂",
      "Nice try",
      "Five years and this?",
      "Be serious for a second 💜",
      "I don't believe you 😌",
    ],
    maxAttempts: 5,
  },
};

/* ╔══════════════════════════════════════════════
   STORY TEXT
══════════════════════════════════════════════╝ */
const STORY = [
  { t: '2021.',                                              k: 'year' },
  { t: '' },
  { t: 'Two people.' },
  { t: 'One friendship.' },
  { t: '' },
  { t: 'Five years of conversations.' },
  { t: 'Five years of checking in.' },
  { t: 'Five years of laughter.' },
  { t: 'Five years of growing.' },
  { t: '' },
  { t: 'And somewhere along the way...' },
  { t: 'You became home.',                                   k: 'em' },
  { t: '' },
  { t: 'Truth be told,' },
  { t: 'I think I knew from the very beginning' },
  { t: 'that you had a special place in my heart.' },
  { t: 'I just couldn\'t quite name it.' },
  { t: '' },
  { t: 'I thought we\'d simply become' },
  { t: 'those friends who stay close forever.' },
  { t: 'The kind who celebrate each other\'s wins,' },
  { t: 'show up for the hard days,' },
  { t: 'and grow old telling the same jokes.' },
  { t: '' },
  { t: 'And honestly,' },
  { t: 'I would have been grateful for that.' },
  { t: '' },
  { t: 'But life had a sweeter plan.',                       k: 'em' },
  { t: '' },
  { t: 'May 2026.',                                         k: 'year' },
  { t: '' },
  { t: 'We stopped wondering' },
  { t: '"What if?"' },
  { t: 'And started asking' },
  { t: '"What next?"' },
  { t: '' },
  { t: 'Who would have thought' },
  { t: 'that the girl I imagined spending life with' },
  { t: 'as my closest friend...' },
  { t: 'would also become the girl' },
  { t: 'I want to do life with as my partner?' },
  { t: '' },
  { t: 'And maybe that\'s what makes this so beautiful.' },
  { t: '' },
  { t: 'Not only did I find someone I love.' },
  { t: 'I found someone I genuinely like.',                  k: 'em' },
  { t: '' },
  { t: 'Someone I laugh with.' },
  { t: 'Someone I trust.' },
  { t: 'Someone I can be silly with.' },
  { t: 'Someone I can grow with.' },
  { t: '' },
  { t: 'My best friend.',                                    k: 'em' },
  { t: '' },
  { t: 'And now,' },
  { t: 'my favorite person to dream about the future with.', k: 'em' },
  { t: '' },
  { t: 'I\'ve been certain of one thing ever since.' },
  { t: '' },
  { t: 'I want to keep choosing you.',                       k: 'em' },
];

/* ╔══════════════════════════════════════════════
   STATE
══════════════════════════════════════════════╝ */
const S = {
  currentScreen: 1,
  musicPlaying: false,
  lofiVolume: 0,
  storyStarted: false,
  questStarted: false,
  confettiDone: false,
  // NO button
  noAttempts: 0,
  noSnapped: false,
  noInitLeft: 0,
  noInitTop: 0,
  // Sparkles
  activeSparkles: [],
  lastSparkleTime: 0,
};

/* ╔══════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════╝ */
const rand    = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const delay   = ms => new Promise(r => setTimeout(r, ms));

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ╔══════════════════════════════════════════════
   SCREEN MANAGEMENT
══════════════════════════════════════════════╝ */
function showScreen(n) {
  const prev = document.querySelector('.screen.is-active');
  const next = document.getElementById(`s${n}`);
  if (!next || next === prev) return;

  if (prev) {
    prev.classList.remove('is-active');
    prev.setAttribute('inert', '');
  }

  next.classList.add('is-active');
  next.removeAttribute('inert');
  S.currentScreen = n;
}

/* ╔══════════════════════════════════════════════
   STARS (Screen 1)
══════════════════════════════════════════════╝ */
function initStars() {
  const container = document.getElementById('stars');
  if (!container) return;
  for (let i = 0; i < 55; i++) {
    const el = document.createElement('div');
    el.className = 'star';
    const size = rand(1.5, 4);
    el.style.cssText = `
      width:${size}px;height:${size}px;
      left:${rand(0,100)}%;top:${rand(0,100)}%;
      --sdur:${rand(2.5,6)}s;--sdel:${rand(0,4)}s;
    `;
    container.appendChild(el);
  }
}

/* ╔══════════════════════════════════════════════
   FLOATING HEARTS (global ambient)
══════════════════════════════════════════════╝ */
function spawnHeart() {
  if (reducedMotion()) return;
  const container = document.getElementById('ambient');
  const el = document.createElement('div');
  el.className = 'a-heart';
  const emojis = CFG.heart.emojis;
  el.textContent = emojis[randInt(0, emojis.length - 1)];

  const dur    = rand(7, 11);
  const rise   = rand(50, 85);
  const rot    = rand(-18, 18);
  const rotEnd = rot + rand(-15, 15);

  el.style.cssText = `
    left:${rand(3,94)}%;bottom:-8%;
    font-size:${rand(0.9,1.7)}rem;
    --hdur:${dur}s;
    --hrise:-${rise}vh;
    --hr:${rot}deg;
    --hre:${rotEnd}deg;
  `;
  container.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000);
}

function startHeartLoop() {
  function schedule() {
    const ms = rand(CFG.heart.intervalMin, CFG.heart.intervalMax);
    setTimeout(() => { spawnHeart(); schedule(); }, ms);
  }
  spawnHeart();
  schedule();
}

/* ╔══════════════════════════════════════════════
   CURSOR SPARKLES
══════════════════════════════════════════════╝ */
function initSparkles() {
  const container = document.getElementById('sparkles');

  document.addEventListener('mousemove', e => {
    if (reducedMotion()) return;
    const now = Date.now();
    if (now - S.lastSparkleTime < CFG.sparkle.throttleMs) return;
    S.lastSparkleTime = now;

    // Cull oldest
    while (S.activeSparkles.length >= CFG.sparkle.max) {
      const old = S.activeSparkles.shift();
      old.remove();
    }

    const el = document.createElement('div');
    el.className = 'sparkle';
    const color = CFG.sparkle.colors[randInt(0, CFG.sparkle.colors.length - 1)];
    const size  = rand(3, 9);
    const dx    = rand(-35, 35);
    const dy    = rand(-38, -8);

    el.style.cssText = `
      left:${e.clientX}px;top:${e.clientY}px;
      width:${size}px;height:${size}px;
      background:${color};
      --sdx:${dx}px;--sdy:${dy}px;
    `;
    container.appendChild(el);
    S.activeSparkles.push(el);

    setTimeout(() => {
      el.remove();
      const idx = S.activeSparkles.indexOf(el);
      if (idx > -1) S.activeSparkles.splice(idx, 1);
    }, 700);
  });
}

/* ╔══════════════════════════════════════════════
   QUESTION PARTICLES (Screen 4)
══════════════════════════════════════════════╝ */
function initQParticles() {
  const container = document.getElementById('q-particles');
  if (!container) return;
  const colors = ['#C4B5FD','#E9D5FF','#A78BFA','#DDD6FE','#ffffff'];
  for (let i = 0; i < 32; i++) {
    const el = document.createElement('div');
    el.className = 'q-particle';
    const size = rand(2, 6);
    el.style.cssText = `
      width:${size}px;height:${size}px;
      left:${rand(0,100)}%;top:${rand(0,100)}%;
      background:${colors[randInt(0,colors.length-1)]};
      --qd:${rand(5,10)}s;--qde:${rand(0,5)}s;
      --qtx:${rand(-60,60)}px;--qty:${rand(-50,-100)}px;
    `;
    container.appendChild(el);
  }
}

/* ╔══════════════════════════════════════════════
   TYPEWRITER (Screen 2)
══════════════════════════════════════════════╝ */
async function runTypewriter() {
  if (S.storyStarted) return;
  S.storyStarted = true;

  const out     = document.getElementById('tw-out');
  const btnNext = document.getElementById('btn-things');
  if (!out) return;

  // Append cursor element
  const cursor = document.createElement('span');
  cursor.className = 'tw-cursor';
  out.parentNode.appendChild(cursor);

  const fast = reducedMotion();

  for (const line of STORY) {
    const span = document.createElement('span');
    const k    = line.k || 'default';
    span.className = 'tw-line' + (line.t === '' ? ' empty' : '') + (k !== 'default' ? ` ${k}` : '');
    out.appendChild(span);

    if (line.t === '') {
      span.classList.add('on');
      await delay(fast ? 0 : CFG.type.lineMs.empty);
      continue;
    }

    span.classList.add('on');

    if (fast) {
      span.textContent = line.t;
    } else {
      const charMs = CFG.type.charMs[k] || CFG.type.charMs.default;
      for (const ch of line.t) {
        span.textContent += ch;
        // Scroll card to show new text
        const card = out.closest('.story-card');
        if (card) card.scrollTop = card.scrollHeight;
        await delay(charMs);
      }
    }

    await delay(fast ? 0 : (CFG.type.lineMs[k] || CFG.type.lineMs.default));
  }

  cursor.classList.add('done');

  // Show "Keep going" button
  await delay(fast ? 0 : 600);
  btnNext.hidden = false;
}

/* ╔══════════════════════════════════════════════
   THING CARDS (Screen 3)
══════════════════════════════════════════════╝ */
function animateThingCards() {
  const cards = document.querySelectorAll('.thing-card');
  cards.forEach(card => {
    const delayMs = parseInt(card.dataset.delay, 10) || 0;
    const tilt    = parseFloat(card.dataset.tilt)  || 0;
    const bob     = parseFloat(card.dataset.bob)   || 6;
    const bobdur  = parseFloat(card.dataset.bobdur)|| 3;

    card.style.setProperty('--tc-tilt', `${tilt}deg`);
    card.style.setProperty('--tc-bob',  `${bob}px`);
    card.style.setProperty('--tc-bobdur', `${bobdur}s`);

    setTimeout(() => {
      card.classList.add('in');
      setTimeout(() => card.classList.add('bob'), 550);
    }, delayMs);
  });
}

/* ╔══════════════════════════════════════════════
   QUESTION REVEAL SEQUENCE (Screen 4)
══════════════════════════════════════════════╝ */
async function runQuestionSequence() {
  if (S.questStarted) return;
  S.questStarted = true;

  const fast      = reducedMotion();
  const ms        = fast ? 0 : 1;
  const habibi    = document.getElementById('q-habibi');
  const prelude   = document.getElementById('q-prelude');
  const reveal    = document.getElementById('q-reveal');
  const qLines    = prelude ? prelude.querySelectorAll('p') : [];

  await delay(fast ? 0 : CFG.question.habibiDelay);
  habibi && habibi.classList.add('on');

  await delay(fast ? 0 : 900);

  for (const line of qLines) {
    line.classList.add('on');
    await delay(fast ? 0 : CFG.question.lineGap);
  }

  await delay(fast ? 0 : CFG.question.afterLines);

  if (reveal) {
    reveal.hidden = false;
    // force reflow before transition
    reveal.offsetHeight; // eslint-disable-line no-unused-expressions
    reveal.classList.add('on');
  }
}

/* ╔══════════════════════════════════════════════
   NO BUTTON BEHAVIOR
══════════════════════════════════════════════╝ */
function initNoButton() {
  const btn = document.getElementById('btn-no');
  if (!btn) return;

  const isMobile = window.matchMedia('(hover: none)').matches;

  function handleNoInteraction(e) {
    if (e.type === 'click' && !isMobile) e.preventDefault();

    if (!S.noSnapped) {
      const rect     = btn.getBoundingClientRect();
      S.noInitLeft   = rect.left;
      S.noInitTop    = rect.top;
      btn.style.cssText = `
        position:fixed;
        left:${S.noInitLeft}px;
        top:${S.noInitTop}px;
        width:${rect.width}px;
        margin:0;
        z-index:500;
        transition:transform 400ms cubic-bezier(.22,1,.36,1),font-size 0.3s ease,padding 0.3s ease;
      `;
      S.noSnapped = true;
    }

    S.noAttempts++;

    if (S.noAttempts >= CFG.no.maxAttempts) {
      btn.textContent = 'Okay fine, I tried.';
      btn.style.fontSize   = '0.6rem';
      btn.style.padding    = '0.3rem 0.8rem';
      btn.style.opacity    = '0.55';
      // Move to a quiet corner
      const dx = (window.innerWidth - S.noInitLeft - 120) * (Math.random() > 0.5 ? 0.9 : -0.9);
      const dy = (window.innerHeight - S.noInitTop - 40) * 0.85;
      btn.style.transform  = `translate(${dx}px,${dy}px) rotate(${rand(-8,8)}deg) scale(0.6)`;
      btn.removeEventListener('mouseenter', handleNoInteraction);
      btn.removeEventListener('click', handleNoInteraction);
      return;
    }

    // Rotate through texts (skip index 0 "Hmm... no?" after first)
    const pool = CFG.no.texts.slice(1);
    btn.textContent = pool[randInt(0, pool.length - 1)];

    // Compute random viewport target
    const bw = btn.offsetWidth  || 140;
    const bh = btn.offsetHeight || 44;
    const margin = 80;
    const tL = rand(margin, window.innerWidth  - bw - margin);
    const tT = rand(margin, window.innerHeight - bh - margin);

    const dx  = tL - S.noInitLeft;
    const dy  = tT - S.noInitTop;
    const rot = rand(-20, 20);
    const sc  = rand(0.75, 0.88);

    btn.style.transform = `translate(${dx}px,${dy}px) rotate(${rot}deg) scale(${sc})`;
  }

  if (!isMobile) {
    btn.addEventListener('mouseenter', handleNoInteraction);
  }
  btn.addEventListener('click', handleNoInteraction);
}

/* ╔══════════════════════════════════════════════
   CONFETTI
══════════════════════════════════════════════╝ */
function launchConfetti() {
  if (S.confettiDone || reducedMotion()) return;
  S.confettiDone = true;

  const container = document.getElementById('confetti');
  if (!container) return;

  for (let i = 0; i < CFG.confetti.count; i++) {
    const el    = document.createElement('div');
    el.className = 'cf';
    const color = CFG.confetti.colors[randInt(0, CFG.confetti.colors.length - 1)];
    const isHeart = Math.random() < 0.14;

    if (isHeart) {
      el.textContent = '💜';
      el.style.fontSize = `${rand(10, 18)}px`;
    } else {
      const size = rand(6, 13);
      const h    = size * (Math.random() < 0.5 ? 1 : rand(0.4, 0.8));
      el.style.width        = `${size}px`;
      el.style.height       = `${h}px`;
      el.style.borderRadius = Math.random() < 0.5 ? '50%' : '2px';
      el.style.background   = color;
    }

    const x   = rand(0, window.innerWidth);
    const dur = rand(2.4, 4.2);
    const del = rand(0, 1.1);

    el.style.setProperty('--cx',   `${x}px`);
    el.style.setProperty('--cdr',  `${rand(-90, 90)}px`);
    el.style.setProperty('--cs',   rand(0.5, 1.1).toFixed(2));
    el.style.setProperty('--crot', `${rand(180, 540)}deg`);
    el.style.left      = '0';
    el.style.top       = '0';
    el.style.animation = `cfFall ${dur}s cubic-bezier(.22,1,.36,1) ${del}s forwards`;

    container.appendChild(el);
  }

  // Extra burst of celebration hearts from ambient
  for (let i = 0; i < 22; i++) {
    setTimeout(() => spawnHeart(), rand(0, 1200));
  }

  // Clean up confetti after animation ends
  setTimeout(() => {
    while (container.firstChild) container.removeChild(container.firstChild);
    S.confettiDone = false;
  }, 5500);
}

/* ╔══════════════════════════════════════════════
   AUDIO MANAGER
══════════════════════════════════════════════╝ */
const Audio = (() => {
  const lofi = document.getElementById('audio-lofi');
  const loml = document.getElementById('audio-loml');
  let playing = false;

  function fadeVolume(el, from, to, durationMs) {
    return new Promise(resolve => {
      el.volume = Math.max(0, Math.min(1, from));
      const start = performance.now();
      function tick(now) {
        const t = Math.min((now - start) / durationMs, 1);
        el.volume = Math.max(0, Math.min(1, from + (to - from) * t));
        if (t < 1) { requestAnimationFrame(tick); }
        else       { el.volume = to; resolve(); }
      }
      requestAnimationFrame(tick);
    });
  }

  function toggle(btn) {
    if (!playing) {
      lofi.volume = 0;
      lofi.play().then(() => {
        fadeVolume(lofi, 0, 0.55, 1200);
        playing = true;
        btn.setAttribute('aria-pressed', 'true');
        btn.classList.add('is-playing');
      }).catch(() => {});
    } else {
      fadeVolume(lofi, lofi.volume, 0, 800).then(() => {
        lofi.pause();
        playing = false;
        btn.setAttribute('aria-pressed', 'false');
        btn.classList.remove('is-playing');
      });
    }
  }

  async function transitionToLOML() {
    const wasPlaying = playing;

    if (wasPlaying) {
      await fadeVolume(lofi, lofi.volume, 0, 2000);
      lofi.pause();
    }

    loml.volume = 0;
    loml.play().then(() => {
      fadeVolume(loml, 0, 0.65, 2000);
      playing = true;
    }).catch(() => {});
  }

  return { toggle, transitionToLOML, isPlaying: () => playing };
})();

function showNowPlaying() {
  const pill = document.getElementById('now-playing');
  if (!pill) return;
  pill.classList.add('show');
  setTimeout(() => pill.classList.remove('show'), 5000);
}

/* ╔══════════════════════════════════════════════
   MODAL (Easter egg)
══════════════════════════════════════════════╝ */
function initModal() {
  const modal   = document.getElementById('capsule-modal');
  const openBtn = document.getElementById('capsule-btn');
  const closeBtn = document.getElementById('modal-close');
  const backdrop = document.getElementById('modal-backdrop');
  if (!modal) return;

  function open() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn && closeBtn.focus();
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = '';
    openBtn && openBtn.focus();
  }

  openBtn  && openBtn.addEventListener('click', open);
  closeBtn && closeBtn.addEventListener('click', close);
  backdrop && backdrop.addEventListener('click', close);

  modal.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
}

/* ╔══════════════════════════════════════════════
   NAVIGATION WIRING
══════════════════════════════════════════════╝ */
function wireNavigation() {
  // Screen 1 → 2
  document.getElementById('btn-story')?.addEventListener('click', () => {
    showScreen(2);
    setTimeout(runTypewriter, 500);
  });

  // Screen 2 → 3
  document.getElementById('btn-things')?.addEventListener('click', () => {
    showScreen(3);
    setTimeout(animateThingCards, 300);
  });

  // Screen 3 → 4
  document.getElementById('btn-question')?.addEventListener('click', () => {
    showScreen(4);
    setTimeout(runQuestionSequence, 400);
  });

  // YES button → Screen 5
  document.getElementById('btn-yes')?.addEventListener('click', () => {
    showScreen(5);
    launchConfetti();
    Audio.transitionToLOML();
    setTimeout(showNowPlaying, 1200);
  });

  // Screen 5 → back to 1 (loop)
  document.getElementById('btn-end')?.addEventListener('click', () => {
    showScreen(1);
  });
}

/* ╔══════════════════════════════════════════════
   MUSIC BUTTON
══════════════════════════════════════════════╝ */
function wireMusicBtn() {
  const btn = document.getElementById('music-btn');
  if (!btn) return;
  btn.addEventListener('click', () => Audio.toggle(btn));
}

/* ╔══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════╝ */
function init() {
  initStars();
  startHeartLoop();
  initSparkles();
  initQParticles();
  initNoButton();
  initModal();
  wireNavigation();
  wireMusicBtn();
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
