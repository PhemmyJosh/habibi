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
    // No white — invisible on white background
    colors: ['#C4B5FD', '#A78BFA', '#7C3AED', '#E9D5FF', '#FCD34D', '#F9A8D4'],
  },
  story: {
    textLineMs:  380,  // stagger gap between text lines
    emptyLineMs: 100,  // stagger gap between empty lines
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
    maxOffset: 200,   // max px displacement from origin
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
  storyStarted: false,
  questStarted: false,
  confettiDone: false,
  noAttempts: 0,
  noSnapped: false,
  noInitLeft: 0,
  noInitTop: 0,
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
  el.textContent = CFG.heart.emojis[randInt(0, CFG.heart.emojis.length - 1)];

  const dur    = rand(7, 11);
  const rise   = rand(50, 85);
  const rot    = rand(-18, 18);
  const rotEnd = rot + rand(-15, 15);

  el.style.cssText = `
    left:${rand(3,94)}%;bottom:-8%;
    font-size:${rand(0.9,1.5)}rem;
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

    while (S.activeSparkles.length >= CFG.sparkle.max) {
      S.activeSparkles.shift().remove();
    }

    const el    = document.createElement('div');
    el.className = 'sparkle';
    const color = CFG.sparkle.colors[randInt(0, CFG.sparkle.colors.length - 1)];
    const size  = rand(3, 9);

    el.style.cssText = `
      left:${e.clientX}px;top:${e.clientY}px;
      width:${size}px;height:${size}px;
      background:${color};
      --sdx:${rand(-35,35)}px;--sdy:${rand(-38,-8)}px;
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
  const colors = ['#C4B5FD','#E9D5FF','#A78BFA','#DDD6FE','#7C3AED'];
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
   STORY — staggered fade-in (replaces typewriter)
══════════════════════════════════════════════╝ */
async function runStory() {
  if (S.storyStarted) return;
  S.storyStarted = true;

  const out     = document.getElementById('tw-out');
  const btnNext = document.getElementById('btn-things');
  if (!out) return;

  const fast = reducedMotion();

  for (const line of STORY) {
    const span = document.createElement('span');
    const k    = line.k || 'default';
    span.className = 'tw-line'
      + (line.t === '' ? ' empty' : '')
      + (k !== 'default' ? ` ${k}` : '');
    span.textContent = line.t;
    out.appendChild(span);

    if (fast) {
      span.classList.add('on');
      continue;
    }

    if (line.t === '') {
      // empty lines appear instantly as spacers
      await delay(CFG.story.emptyLineMs);
      continue;
    }

    // Staggered reveal: wait, then fade in
    await delay(CFG.story.textLineMs);
    span.classList.add('on');

    // Keep newest lines visible in the scrollable card
    const card = out.closest('.story-card');
    if (card) card.scrollTop = card.scrollHeight;
  }

  // Button appears after the last line finishes its transition
  await delay(fast ? 0 : 500 + 700);
  if (btnNext) btnNext.hidden = false;
}

/* ╔══════════════════════════════════════════════
   THING CARDS (Screen 3)
   Button revealed only after all cards are in
══════════════════════════════════════════════╝ */
function animateThingCards() {
  const cards  = document.querySelectorAll('.thing-card');
  const btnQ   = document.getElementById('btn-question');
  let maxDelay = 0;

  cards.forEach(card => {
    const delayMs = parseInt(card.dataset.delay, 10) || 0;
    const tilt    = parseFloat(card.dataset.tilt)    || 0;
    const bob     = parseFloat(card.dataset.bob)     || 6;
    const bobdur  = parseFloat(card.dataset.bobdur)  || 3;

    card.style.setProperty('--tc-tilt',   `${tilt}deg`);
    card.style.setProperty('--tc-bob',    `${bob}px`);
    card.style.setProperty('--tc-bobdur', `${bobdur}s`);

    if (delayMs > maxDelay) maxDelay = delayMs;

    setTimeout(() => {
      card.classList.add('in');
      setTimeout(() => card.classList.add('bob'), 550);
    }, delayMs);
  });

  // Show button after the last card finishes entering (transition = 550ms + 300ms buffer)
  setTimeout(() => {
    if (btnQ) btnQ.hidden = false;
  }, maxDelay + 550 + 300);
}

/* ╔══════════════════════════════════════════════
   QUESTION REVEAL SEQUENCE (Screen 4)
══════════════════════════════════════════════╝ */
async function runQuestionSequence() {
  if (S.questStarted) return;
  S.questStarted = true;

  const fast    = reducedMotion();
  const habibi  = document.getElementById('q-habibi');
  const prelude = document.getElementById('q-prelude');
  const reveal  = document.getElementById('q-reveal');
  const qLines  = prelude ? prelude.querySelectorAll('p') : [];

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
    reveal.offsetHeight; // force reflow before transition
    reveal.classList.add('on');
  }
}

/* ╔══════════════════════════════════════════════
   NO BUTTON — constrained to ±200px of origin
══════════════════════════════════════════════╝ */
function initNoButton() {
  const btn = document.getElementById('btn-no');
  if (!btn) return;

  const isMobile = window.matchMedia('(hover: none)').matches;

  function handleNoInteraction(e) {
    if (e.type === 'click' && !isMobile) e.preventDefault();

    if (!S.noSnapped) {
      const rect    = btn.getBoundingClientRect();
      S.noInitLeft  = rect.left;
      S.noInitTop   = rect.top;
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
      btn.textContent    = 'Okay fine, I tried.';
      btn.style.fontSize = '0.6rem';
      btn.style.padding  = '0.3rem 0.8rem';
      btn.style.opacity  = '0.45';
      // Drift to a small corner position, still within the 200px box
      const dx = rand(-60, 60);
      const dy = rand(60, 120);
      btn.style.transform = `translate(${dx}px,${dy}px) rotate(${rand(-8,8)}deg) scale(0.55)`;
      btn.removeEventListener('mouseenter', handleNoInteraction);
      btn.removeEventListener('click', handleNoInteraction);
      return;
    }

    // Cycle through alternative texts
    const pool = CFG.no.texts.slice(1);
    btn.textContent = pool[randInt(0, pool.length - 1)];

    const bw = btn.offsetWidth  || 140;
    const bh = btn.offsetHeight || 44;
    const maxOff = CFG.no.maxOffset;

    // Random offset clamped to ±maxOffset AND within viewport
    const rawDx = rand(-maxOff, maxOff);
    const rawDy = rand(-maxOff, maxOff);

    const newLeft = S.noInitLeft + rawDx;
    const newTop  = S.noInitTop  + rawDy;

    const clampedLeft = Math.max(20, Math.min(window.innerWidth  - bw - 20, newLeft));
    const clampedTop  = Math.max(20, Math.min(window.innerHeight - bh - 20, newTop));

    const dx  = clampedLeft - S.noInitLeft;
    const dy  = clampedTop  - S.noInitTop;
    const rot = rand(-20, 20);
    const sc  = rand(0.78, 0.9);

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
    const el     = document.createElement('div');
    el.className  = 'cf';
    const color   = CFG.confetti.colors[randInt(0, CFG.confetti.colors.length - 1)];
    const isHeart = Math.random() < 0.14;

    if (isHeart) {
      el.textContent    = '💜';
      el.style.fontSize = `${rand(10, 18)}px`;
    } else {
      const size = rand(6, 13);
      const h    = size * (Math.random() < 0.5 ? 1 : rand(0.4, 0.8));
      el.style.width        = `${size}px`;
      el.style.height       = `${h}px`;
      el.style.borderRadius = Math.random() < 0.5 ? '50%' : '2px';
      el.style.background   = color;
    }

    el.style.setProperty('--cx',   `${rand(0, window.innerWidth)}px`);
    el.style.setProperty('--cdr',  `${rand(-90, 90)}px`);
    el.style.setProperty('--cs',   rand(0.5, 1.1).toFixed(2));
    el.style.setProperty('--crot', `${rand(180, 540)}deg`);
    el.style.left      = '0';
    el.style.top       = '0';
    el.style.animation = `cfFall ${rand(2.4, 4.2)}s cubic-bezier(.22,1,.36,1) ${rand(0, 1.1)}s forwards`;

    container.appendChild(el);
  }

  // Extra celebratory hearts
  for (let i = 0; i < 22; i++) {
    setTimeout(() => spawnHeart(), rand(0, 1200));
  }

  setTimeout(() => {
    while (container.firstChild) container.removeChild(container.firstChild);
    S.confettiDone = false;
  }, 5500);
}

/* ╔══════════════════════════════════════════════
   AUDIO — lofi only; loml replaced by Spotify embed
══════════════════════════════════════════════╝ */
const Audio = (() => {
  const lofi = document.getElementById('audio-lofi');
  let playing = false;
  let musicBtn = null;

  function fadeVolume(el, from, to, durationMs) {
    return new Promise(resolve => {
      if (!el) { resolve(); return; }
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
    musicBtn = btn;
    if (!playing) {
      if (!lofi) return;
      lofi.volume = 0;
      lofi.play()
        .then(() => {
          fadeVolume(lofi, 0, 0.55, 1200);
          playing = true;
          btn.setAttribute('aria-pressed', 'true');
          btn.classList.add('is-playing');
        })
        .catch(() => {
          // Autoplay blocked — will try again on next user interaction
        });
    } else {
      fadeVolume(lofi, lofi ? lofi.volume : 0, 0, 800).then(() => {
        if (lofi) lofi.pause();
        playing = false;
        btn.setAttribute('aria-pressed', 'false');
        btn.classList.remove('is-playing');
      });
    }
  }

  function fadeOutLofi() {
    if (!playing || !lofi) return Promise.resolve();
    return fadeVolume(lofi, lofi.volume, 0, 2000).then(() => {
      lofi.pause();
      playing = false;
      if (musicBtn) {
        musicBtn.setAttribute('aria-pressed', 'false');
        musicBtn.classList.remove('is-playing');
      }
    });
  }

  function isPlaying() { return playing; }

  return { toggle, fadeOutLofi, isPlaying };
})();

/* ╔══════════════════════════════════════════════
   SPOTIFY PLAYER
══════════════════════════════════════════════╝ */
function showSpotifyPlayer() {
  const pill = document.getElementById('spotify-pill');
  if (!pill) return;
  pill.hidden = false;
  pill.offsetHeight; // force reflow
  pill.classList.add('show');
}

/* ╔══════════════════════════════════════════════
   NOW-PLAYING TOAST
══════════════════════════════════════════════╝ */
function showNowPlaying() {
  const pill = document.getElementById('now-playing');
  if (!pill) return;
  pill.classList.add('show');
  setTimeout(() => pill.classList.remove('show'), 4500);
}

/* ╔══════════════════════════════════════════════
   MODAL (Easter egg)
══════════════════════════════════════════════╝ */
function initModal() {
  const modal    = document.getElementById('capsule-modal');
  const openBtn  = document.getElementById('capsule-btn');
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
  modal.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ╔══════════════════════════════════════════════
   NAVIGATION WIRING
══════════════════════════════════════════════╝ */
function wireNavigation() {
  // Screen 1 → 2
  document.getElementById('btn-story')?.addEventListener('click', () => {
    showScreen(2);
    setTimeout(runStory, 500);
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
    Audio.fadeOutLofi();
    setTimeout(showSpotifyPlayer, 800);
    setTimeout(showNowPlaying, 1400);
  });

  // Screen 5 → back to 1
  document.getElementById('btn-end')?.addEventListener('click', () => {
    showScreen(1);
  });
}

/* ╔══════════════════════════════════════════════
   MUSIC BUTTON
   Plays only on explicit user interaction — no autoplay
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
