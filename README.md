# Habibi 💜

A personal, interactive love letter website built for Favour.

## Setup

Add the audio files before deploying:

```
assets/audio/lofi.mp3   — gentle lo-fi piano (background ambience)
assets/audio/loml.mp3   — LOML by Savy Henry (plays on YES)
```

The site works immediately without audio, but the music experience completes it.

## Deploy

Static site — no build step required.

Push to GitHub, then import the repo in [Vercel](https://vercel.com). It will detect a static project and deploy instantly.

## Structure

```
habibi/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── audio/
│   │   ├── lofi.mp3
│   │   └── loml.mp3
│   └── icons/
```
