'use strict';

/* ╔══════════════════════════════════════════════
   CONFIG
══════════════════════════════════════════════╝ */
const CFG = {
  heart: {
    intervalMin: 2200,
    intervalMax: 4200,
    emojis: ['💜', '💜', '💜', '🤍', '✨', '💜'],
  },
  sparkle: {
    max: 15,
    throttleMs: 30,
    colors: ['#C4B5FD', '#A78BFA', '#7C3AED', '#E9D5FF', '#FCD34D', '#F9A8D4'],
  },
  story: {
    textGapMs:  2500,   // gap before each text line fades in
    emptyGapMs: 250,    // gap for empty spacer lines
    afterLastMs: 1800,  // wait after final line before showing button
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
      "Habibi jor shaanu mi 😂",
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
  storyStarted: false,
  questStarted: false,
  confettiDone: false,
  noAttempts: 0,
  noNatLeft: null,
  noNatTop: null,
  activeSparkles: [],
  lastSparkleTime: 0,
  // Story skip
  storySkipped: false,
  storySkipFn:  null,
};

/* ╔══════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════╝ */
const rand    = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const delay   = ms => new Promise(r => setTimeout(r, ms));

// Like delay() but can be short-circuited by skipStory()
function storyGap(ms) {
  return new Promise(resolve => {
    const id = setTimeout(resolve, ms);
    S.storySkipFn = () => { clearTimeout(id); resolve(); };
  });
}

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

  // Hide skip button whenever we leave the story screen
  if (n !== 2) {
    const skipBtn = document.getElementById('btn-skip-story');
    if (skipBtn) skipBtn.hidden = true;
  }
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

  const dur = rand(7, 11);
  el.style.cssText = `
    left:${rand(3,94)}%;bottom:-8%;
    font-size:${rand(0.9,1.5)}rem;
    --hdur:${dur}s;
    --hrise:-${rand(50,85)}vh;
    --hr:${rand(-18,18)}deg;
    --hre:${rand(-25,25)}deg;
  `;
  container.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000);
}

function startHeartLoop() {
  function schedule() {
    setTimeout(() => { spawnHeart(); schedule(); }, rand(CFG.heart.intervalMin, CFG.heart.intervalMax));
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
    const size  = rand(3, 9);
    el.style.cssText = `
      left:${e.clientX}px;top:${e.clientY}px;
      width:${size}px;height:${size}px;
      background:${CFG.sparkle.colors[randInt(0, CFG.sparkle.colors.length - 1)]};
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
   STORY — automatic slow fade-in (no user input)
   Each text line: 2.5s gap, then 1.2s CSS transition.
   skipStory() short-circuits all gaps instantly.
   Button appears only after last line's transition ends.
══════════════════════════════════════════════╝ */
async function runStory() {
  if (S.storyStarted) return;
  S.storyStarted  = true;
  S.storySkipped  = false;
  S.storySkipFn   = null;

  const out     = document.getElementById('tw-out');
  const btnNext = document.getElementById('btn-things');
  const skipBtn = document.getElementById('btn-skip-story');
  if (!out) return;

  // Reveal the skip button now that the story is actively running
  if (skipBtn) skipBtn.hidden = false;

  const fast = reducedMotion();

  for (const line of STORY) {
    const span = document.createElement('span');
    const k    = line.k || 'default';
    span.className = 'tw-line'
      + (line.t === '' ? ' empty' : '')
      + (k !== 'default' ? ` ${k}` : '');
    span.textContent = line.t;
    out.appendChild(span);

    if (fast || S.storySkipped) {
      span.classList.add('on');
      continue;
    }

    if (line.t === '') {
      await storyGap(CFG.story.emptyGapMs);
      continue;
    }

    await storyGap(CFG.story.textGapMs);
    span.classList.add('on');

    if (!S.storySkipped) {
      const card = out.closest('.story-card');
      if (card) card.scrollTop = card.scrollHeight;
    }
  }

  // Story complete — hide skip button
  if (skipBtn) skipBtn.hidden = true;
  S.storySkipFn = null;

  await delay(fast || S.storySkipped ? 0 : CFG.story.afterLastMs);
  if (btnNext) btnNext.classList.add('show');
}

/* Instantly reveals all story lines, cancels any running gap. */
function skipStory() {
  S.storySkipped = true;
  const out = document.getElementById('tw-out');
  if (out) {
    out.classList.add('skip-all');                         // disables CSS transitions
    out.querySelectorAll('.tw-line').forEach(el => el.classList.add('on'));
  }
  if (S.storySkipFn) { S.storySkipFn(); S.storySkipFn = null; }
}

/* ╔══════════════════════════════════════════════
   THING CARDS (Screen 3)
   Button fades in only after all cards finish
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

  // 550ms transition + 300ms breathing room after last card
  setTimeout(() => {
    if (btnQ) btnQ.classList.add('show');
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
   NO BUTTON — strictly inside parent .question-card
   Uses only CSS transforms. Natural position is
   snapshotted on first interaction (before any transform).
══════════════════════════════════════════════╝ */
function initNoButton() {
  const btn = document.getElementById('btn-no');
  if (!btn) return;

  const isMobile = window.matchMedia('(hover: none)').matches;

  function handleNoInteraction(e) {
    if (e.type === 'click' && !isMobile) e.preventDefault();

    // Snapshot the button's natural viewport position once, before any transforms
    if (S.noNatLeft === null) {
      const r    = btn.getBoundingClientRect();
      S.noNatLeft = r.left;
      S.noNatTop  = r.top;
    }

    S.noAttempts++;

    if (S.noAttempts >= CFG.no.maxAttempts) {
      btn.textContent    = 'Okay fine, I tried.';
      btn.style.fontSize = '0.6rem';
      btn.style.padding  = '0.3rem 0.8rem';
      btn.style.opacity  = '0.4';
      btn.style.transition = 'transform 400ms cubic-bezier(.22,1,.36,1), font-size 0.3s ease, padding 0.3s ease';
      btn.style.transform = `translate(${rand(-30, 30)}px, ${rand(20, 50)}px) rotate(${rand(-6,6)}deg) scale(0.55)`;
      btn.removeEventListener('mouseenter', handleNoInteraction);
      btn.removeEventListener('click', handleNoInteraction);
      return;
    }

    // Rotate texts
    const pool = CFG.no.texts.slice(1);
    btn.textContent = pool[randInt(0, pool.length - 1)];

    // Get parent card boundary
    const card     = document.querySelector('.question-card');
    const cardRect = card
      ? card.getBoundingClientRect()
      : { left: 0, right: window.innerWidth, top: 0, bottom: window.innerHeight };

    const bw  = btn.offsetWidth;
    const bh  = btn.offsetHeight;
    const pad = 14;

    const minDx = cardRect.left  + pad       - S.noNatLeft;
    const maxDx = cardRect.right - bw - pad  - S.noNatLeft;
    const minDy = cardRect.top   + pad       - S.noNatTop;
    const maxDy = cardRect.bottom - bh - pad - S.noNatTop;

    if (maxDx <= minDx || maxDy <= minDy) return;

    // Obstacle elements to avoid overlapping (text, headings, yes button)
    const screen4   = document.getElementById('s4');
    const obstacles = screen4
      ? Array.from(screen4.querySelectorAll('h2, .q-prelude p, .the-q, .q-emoji, #btn-yes'))
      : [];

    let dx = rand(minDx, maxDx);
    let dy = rand(minDy, maxDy);

    for (let attempt = 0; attempt < 10; attempt++) {
      const cDx = rand(minDx, maxDx);
      const cDy = rand(minDy, maxDy);
      const nl  = S.noNatLeft + cDx;
      const nt  = S.noNatTop  + cDy;
      const nr  = nl + bw;
      const nb  = nt + bh;
      const M   = 10; // clearance margin

      const blocked = obstacles.some(el => {
        const r = el.getBoundingClientRect();
        return nl < r.right + M && nr > r.left - M &&
               nt < r.bottom + M && nb > r.top - M;
      });

      dx = cDx; dy = cDy;
      if (!blocked) break; // found a clear spot
    }

    const rot = rand(-18, 18);
    const sc  = rand(0.8, 0.92);

    btn.style.transition = 'transform 400ms cubic-bezier(.22,1,.36,1)';
    btn.style.transform  = `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${sc})`;
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
    const el      = document.createElement('div');
    el.className   = 'cf';
    const isHeart  = Math.random() < 0.14;

    if (isHeart) {
      el.textContent    = '💜';
      el.style.fontSize = `${rand(10, 18)}px`;
    } else {
      const size = rand(6, 13);
      el.style.width        = `${size}px`;
      el.style.height       = `${size * (Math.random() < 0.5 ? 1 : rand(0.4, 0.8))}px`;
      el.style.borderRadius = Math.random() < 0.5 ? '50%' : '2px';
      el.style.background   = CFG.confetti.colors[randInt(0, CFG.confetti.colors.length - 1)];
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

  for (let i = 0; i < 22; i++) {
    setTimeout(() => spawnHeart(), rand(0, 1200));
  }

  setTimeout(() => {
    while (container.firstChild) container.removeChild(container.firstChild);
    S.confettiDone = false;
  }, 5500);
}

/* ╔══════════════════════════════════════════════
   AUDIO MANAGER
   - lofi plays from first button click onward
   - Music button = mute / unmute only (never stops)
   - YES click = play loml directly (autoplay-safe)
     then crossfade lofi out / loml in over 2s
══════════════════════════════════════════════╝ */
const AudioMgr = (() => {
  const lofi = document.getElementById('audio-lofi');
  const loml = document.getElementById('audio-loml');
  let lofiActive = false;
  let muted      = false;
  const VOL      = 0.5;

  if (lofi) {
    lofi.addEventListener('error', () =>
      console.error('[habibi] lofi failed to load:', lofi.src));
  }
  if (loml) {
    loml.addEventListener('error', () =>
      console.error('[habibi] loml failed to load:', loml.src));
  }

  function fadeVol(el, from, to, ms) {
    if (!el) return Promise.resolve();
    return new Promise(resolve => {
      el.volume = Math.max(0, Math.min(1, from));
      const start = performance.now();
      (function tick(now) {
        const t = Math.min((now - start) / ms, 1);
        el.volume = Math.max(0, Math.min(1, from + (to - from) * t));
        t < 1 ? requestAnimationFrame(tick) : (el.volume = to, resolve());
      })(start);
    });
  }

  function updateBtn(active) {
    const btn = document.getElementById('music-btn');
    if (!btn) return;
    btn.setAttribute('aria-pressed', active.toString());
    btn.classList.toggle('is-playing', active);
  }

  function startLofi() {
    if (lofiActive) return;
    lofiActive = true;
    if (!lofi) return;
    lofi.volume = 0;
    lofi.loop   = true;
    lofi.play()
      .then(() => {
        if (!muted) fadeVol(lofi, 0, VOL, 1500);
        updateBtn(true);
      })
      .catch(err => console.error('[habibi] lofi play error:', err));
  }

  function toggleMute() {
    if (!lofiActive) {
      // First time: just start, don't toggle to muted
      startLofi();
      return;
    }
    muted = !muted;
    if (muted) {
      fadeVol(lofi, lofi ? lofi.volume : VOL, 0, 400);
      updateBtn(false);
    } else {
      fadeVol(lofi, 0, VOL, 600);
      updateBtn(true);
    }
  }

  function crossfadeToLOML() {
    // loml.play() is called by the caller synchronously in the click handler
    if (lofi) fadeVol(lofi, lofi.volume || VOL, 0, 2000);
    if (loml) fadeVol(loml, 0, 0.65, 2000);
  }

  return { startLofi, toggleMute, crossfadeToLOML };
})();

/* ╔══════════════════════════════════════════════
   NOW-PLAYING TOAST
══════════════════════════════════════════════╝ */
function showNowPlaying() {
  const pill = document.getElementById('now-playing');
  if (!pill) return;
  pill.classList.add('show');
  setTimeout(() => pill.classList.remove('show'), 4000);
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
  // Start lofi on first button click that isn't the music toggle
  document.addEventListener('click', function onFirstClick(e) {
    if (!e.target.closest('button')) return;
    if (e.target.closest('#music-btn')) return; // music btn manages its own start
    AudioMgr.startLofi();
    document.removeEventListener('click', onFirstClick, true);
  }, true);

  // Screen 1 → 2
  document.getElementById('btn-story')?.addEventListener('click', () => {
    showScreen(2);
    setTimeout(runStory, 500);
  });

  // Story skip button
  document.getElementById('btn-skip-story')?.addEventListener('click', skipStory);

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

  // YES button → Screen 5 (loml called directly in click handler)
  document.getElementById('btn-yes')?.addEventListener('click', () => {
    const loml = document.getElementById('audio-loml');
    if (loml) {
      loml.volume = 0;
      loml.loop   = true;
      // Direct play call inside click handler — satisfies autoplay policy
      loml.play().catch(err => console.error('[habibi] loml play error:', err));
    }
    AudioMgr.crossfadeToLOML();

    showScreen(5);
    launchConfetti();

    // Toast appears after the 2s crossfade
    setTimeout(showNowPlaying, 2200);
  });

  // Screen 5 — celebratory burst, stays on celebration screen
  document.getElementById('btn-end')?.addEventListener('click', function() {
    burstFromButton(this);
  });
}

/* ╔══════════════════════════════════════════════
   MUSIC BUTTON — mute / unmute toggle
══════════════════════════════════════════════╝ */
function wireMusicBtn() {
  const btn = document.getElementById('music-btn');
  if (!btn) return;
  btn.addEventListener('click', () => AudioMgr.toggleMute());
}

/* ╔══════════════════════════════════════════════
   CONFETTI BURST — 600 particles, 5 simultaneous
   origins. rAF physics, GPU-composited transforms
   only (no left/top per frame, no offsetWidth reads).
══════════════════════════════════════════════╝ */
function burstFromButton(btn) {
  if (reducedMotion()) return;

  const W = window.innerWidth;
  const H = window.innerHeight;
  const br = btn.getBoundingClientRect();
  const bx = br.left + br.width  / 2;
  const by = br.top  + br.height / 2;

  const COLORS = [
    '#6D28D9','#7C3AED','#C4B5FD','#E9D5FF','#A78BFA','#DDD6FE',
    '#FCD34D','#FBBF24','#F472B6','#FB923C','#34D399','#60A5FA',
    '#ffffff','#F9A8D4','#E879F9','#4ADE80','#38BDF8',
  ];

  // 5 origins × 120 = 600 particles, all launched simultaneously.
  // y = -20 for top origins places the popper just above the viewport.
  // minA / maxA in radians (0 = right, π/2 = down in screen coords).
  const ORIGINS = [
    { x: W * 0.08, y: -20,    minA: 0,               maxA: Math.PI * 0.80, n: 120 }, // top-left  → right+down
    { x: W * 0.92, y: -20,    minA: Math.PI * 0.20,  maxA: Math.PI,        n: 120 }, // top-right → left+down
    { x: W * 0.50, y: -20,    minA: Math.PI * 0.10,  maxA: Math.PI * 0.90, n: 120 }, // top-center → wide down fan
    { x: W * 0.50, y: H * 0.50, minA: 0,             maxA: Math.PI * 2,    n: 120 }, // screen center → all dirs
    { x: bx,       y: by,     minA: 0,               maxA: Math.PI * 2,    n: 120 }, // button center → all dirs
  ];

  const particles = [];

  for (const o of ORIGINS) {
    for (let i = 0; i < o.n; i++) {
      const el = document.createElement('div');
      el.style.cssText =
        'position:fixed;left:0;top:0;z-index:9998;pointer-events:none;will-change:transform,opacity;';

      const r     = Math.random();
      const angle = rand(o.minA, o.maxA);
      const speed = rand(3, 22);       // wildly varied speed
      let   cw = 7, ch = 7;            // half-dims for centering (no offsetWidth)

      if (r < 0.15) {
        const fs = rand(14, 30);
        el.textContent    = '🎉';
        el.style.fontSize = `${fs}px`;
        cw = fs * 0.55; ch = fs * 0.55;
      } else if (r < 0.30) {
        const fs = rand(12, 26);
        el.textContent    = '❤️';
        el.style.fontSize = `${fs}px`;
        cw = fs * 0.55; ch = fs * 0.55;
      } else {
        const w = rand(4, 20);         // wildly varied widths
        const h = rand(2, 12);         // wildly varied heights
        el.style.width        = `${w}px`;
        el.style.height       = `${h}px`;
        el.style.background   = COLORS[randInt(0, COLORS.length - 1)];
        el.style.borderRadius = Math.random() < 0.35 ? '50%' : '2px';
        cw = w / 2; ch = h / 2;
      }

      document.body.appendChild(el);

      particles.push({
        el, cw, ch,
        x:   o.x,
        y:   o.y,
        vx:  Math.cos(angle) * speed,
        vy:  Math.sin(angle) * speed,
        g:   rand(0.14, 0.42),         // wildly varied gravity
        op:  1,
        rot: Math.random() * 360,
        rv:  rand(-25, 25),            // wild spin
      });
    }
  }

  function step() {
    let alive = false;
    for (const p of particles) {
      if (p.op <= 0) continue;
      alive   = true;
      p.x    += p.vx;
      p.y    += p.vy;
      p.vy   += p.g;
      p.vx   *= 0.987;
      p.op   -= 0.006;                 // ~2.8 s lifetime at 60 fps
      p.rot  += p.rv;
      // GPU-composited: only transform + opacity change per frame
      p.el.style.opacity   = Math.max(0, p.op);
      p.el.style.transform =
        `translate(${p.x - p.cw}px,${p.y - p.ch}px) rotate(${p.rot}deg)`;
      if (p.op <= 0) p.el.remove();
    }
    if (alive) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* ╔══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════╝ */
function init() {
  try {
    initStars();
    startHeartLoop();
    initSparkles();
    initQParticles();
    initNoButton();
    initModal();
    wireNavigation();
    wireMusicBtn();
  } catch (err) {
    console.error('[habibi] init error:', err);
  }
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
