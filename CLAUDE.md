# Habibi — Project Guide for Claude

## What this project is

A single-page interactive love letter website built for a girl named Favour (nickname: Habibi). It walks through a five-year friendship, asks her to make things official, and celebrates with confetti if she says yes. It is personal, intimate, and not a template — every line of copy is intentional.

**Live URL:** https://oluwafavour.vercel.app  
**GitHub:** https://github.com/PhemmyJosh/habibi  
**Owner:** Oluwafemi

---

## Tech stack

| Layer | Choice |
|-------|--------|
| HTML | Vanilla, single `index.html` |
| CSS | Vanilla, `style.css` |
| JavaScript | Vanilla, `script.js` — no frameworks, no build step |
| Fonts | Quicksand (Google Fonts) |
| Deployment | Vercel (static), `vercel --prod` |
| Repo | GitHub — `PhemmyJosh/habibi` |

There is no package.json, no bundler, no transpiler. Everything runs directly in the browser as-is.

---

## File structure

```
habibi/
├── index.html          # All five screens + global UI
├── style.css           # All styles
├── script.js           # All interactivity
├── vercel.json         # Static deployment config
├── CLAUDE.md           # This file
├── README.md
├── .gitignore
└── assets/
    ├── audio/
    │   ├── lofi.mp3    # Original ambient download (unused in code, kept for reference)
    │   ├── lofi2.mp3   # Active background ambient (referenced in HTML)
    │   └── loml.mp3    # "LOML" by Savy Henry — plays on YES click
    └── icons/          # Empty, reserved
```

---

## Screens

| ID | Screen | Purpose |
|----|--------|---------|
| `#s1` | Introduction | "Hola, Favour 💜 / Habibi ✨" — opening card with animated stars |
| `#s2` | Our Story | Staggered line-by-line story reveal (2.5s per line). Has a Skip button. |
| `#s3` | Little Things | Seven floating glassmorphism cards about Favour |
| `#s4` | The Question | "Will you make this official with me?" — YES/NO buttons |
| `#s5` | Celebration | Confetti, pulsing red heart, "Our story officially begins" button |

Screens are `position: fixed; inset: 0`. Only the active screen has `.is-active`. Transitions use `opacity` + `translateY` + CSS `visibility` delay trick.

---

## Key design decisions

### White background
All screens use `background: #ffffff`. Purple (`#6D28D9`, `#7C3AED`) appears only as accents — headings, buttons, card borders, sparkles. No dark gradients on body text.

### Glass cards
`background: rgba(196, 181, 253, 0.15)` with `border: 1px solid rgba(109, 40, 217, 0.22)` and `backdrop-filter: blur(18px)`.

### No frameworks rule
Do not introduce React, Vue, Tailwind, GSAP, Canvas libraries, or SVG libraries. The constraint is intentional.

---

## Audio

| File | Role | Behaviour |
|------|------|-----------|
| `lofi2.mp3` | Background ambient | Starts on first button click (satisfies browser autoplay policy). Music button toggles mute/unmute only — it never stops the track. |
| `loml.mp3` | "LOML" by Savy Henry | Played via `loml.play()` called synchronously inside the YES click handler. Loops. Crossfades with lofi over 2s. |

**Mobile crossfade rule:** After fading lofi volume to 0, call `lofi.pause()` explicitly. Mobile browsers (iOS Safari, Android Chrome) do not stop playback on volume=0 alone.

The `AudioMgr` module (IIFE in `script.js`) owns the lofi lifecycle. The YES button handler owns the loml play call and the inline crossfade rAF loops — do not move these into a helper function.

---

## Animations

- **Floating hearts** — global ambient, generated every 2–4s, CSS keyframe `heartRise`
- **Cursor sparkles** — throttled `mousemove`, max 15 active, CSS `sparkleOut`
- **Story lines** — `opacity 0→1, translateY 10px→0`, 1.2s CSS transition, 2.5s stagger via async loop
- **Thing cards** — staggered entrance + continuous `cardBob` CSS animation
- **Question reveal** — async sequence: "Habibi..." → prelude lines → question → YES/NO
- **Confetti burst (btn-end)** — 600 rAF-physics particles from 5 simultaneous origins. No CSS animation — pure `requestAnimationFrame`. GPU-composited: only `transform` + `opacity` change per tick.
- **CSS confetti (YES)** — `cfFall` keyframe, 135 particles via the `#confetti` container

---

## NO button behaviour

On hover (desktop) or click (mobile), the NO button:
1. Snaps to `position: fixed` at its natural viewport coordinates (snapshotted once on first interaction)
2. Translates to a new random position using `transform: translate()` only
3. Checks up to 10 candidate positions for overlap against `h2`, prelude `p`, `.the-q`, `.q-emoji`, `#btn-yes` via `getBoundingClientRect()`
4. Picks the first non-overlapping position, or falls back to the last attempt
5. After 5 attempts: becomes tiny, reads "Okay fine, I tried."

Random texts cycle through: `"That's suspicious 👀"`, `"Habibi please 😂"`, `"Nice try"`, `"Habibi jor shaanu mi 😂"`, `"Be serious for a second 💜"`, `"I don't believe you 😌"`.

---

## Skip button (Screen 2)

`#btn-skip-story` lives inside `.story-card` as its first child. The card has `position: relative`; the button is `position: absolute; top: 1rem; right: 1rem`.

Clicking it:
1. Sets `S.storySkipped = true`
2. Adds `.skip-all` to `#tw-out` → disables all CSS transitions via `.tw-out.skip-all .tw-line { transition: none !important }`
3. Adds `.on` to all existing `.tw-line` elements
4. Calls `S.storySkipFn()` to resolve the current `storyGap()` Promise early
5. The async loop races through remaining lines synchronously

---

## Deployment

```bash
# Deploy to production
vercel --prod --yes
```

`vercel.json` uses `handle: filesystem` first (serves static assets directly), then falls back to `index.html` for any unknown path.

Audio files (`lofi2.mp3`, `loml.mp3`) are committed to the repo and served with `Cache-Control: public, max-age=31536000, immutable`.

When deploying, Vercel skips re-uploading unchanged binary files from the previous deployment.

---

## CSS z-index map

| Element | z-index | Notes |
|---------|---------|-------|
| `.screen` | 10 | All screens; active one is on top via stacking order |
| `#ambient` | 1 | Floating hearts layer |
| `.confetti-layer` | 4 | CSS confetti on screen 5 |
| `.celebrate-card` | 6 | Above confetti |
| `.capsule-btn` | 700 | Easter egg button |
| `.music-btn` | 800 | Music toggle |
| `#sparkles` | 9000 | Cursor sparkles |
| `.site-footer` | 9999 | Always on top |
| `.modal-overlay` | 2000 | Time capsule modal |
| burst particles | 9998 | rAF confetti from btn-end |

---

## Known details

- `lofi.mp3` in `assets/audio/` is the original CC0 download (Loyalty Freak Music via archive.org). It is not referenced in the code — `lofi2.mp3` is the active file.
- The `inert` attribute is used on inactive screens for accessibility. Supported in Safari 15.5+.
- `body: overflow: hidden` is intentional — all content lives in `position: fixed` screens.
- The `.gitignore` has `.env*` and `.vercel` entries added automatically by `vercel link`.
