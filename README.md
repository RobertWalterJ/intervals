# Intervals

A run and walk interval timer that installs like an app and works offline. The design is athletic minimal: Archivo type, a monochrome base, vivid activity colours and an interval strip that draws each workout as a bar chart. Presets, a builder with steps and repeat blocks, time or distance targets, voice and beep cues, GPS distance with a pace fallback, and a history of finished sessions.

Live at https://robertwalterj.github.io/intervals/

## Install on Android

1. Open the link above in Chrome.
2. Tap Install on the card at the top of Workouts, or use the Chrome menu, then Install app.
3. Open Intervals from the home screen.

## Update

Change the files, then bump `VERSION` in `sw.js` (and `APP_VERSION` in `index.html`) so phones fetch a new shell cache. Open apps show an "Updated. Reload to use the new version" prompt.

## Files

- `index.html`: the whole app (markup, styles, script)
- `sw.js`: service worker, offline shell and font caching
- `manifest.webmanifest`: install identity (id and scope are `/intervals/`)
- `icon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`: app icons
- `.nojekyll`: tells GitHub Pages to serve files as they are
- `CLAUDE.md`: notes for Claude sessions

Data is kept in localStorage under the `intervals:` prefix.
