# Subway Simulator 🚇

A browser-based subway driving game. Push the lever to power, pull to brake,
and stop on the mark at every station — the closer you stop, the more coins
you earn. Built as an installable PWA: no backend, no accounts, progress saved
in localStorage, auto-updates on every deploy.

**Stack:** React 18 · Vite · Three.js · Zustand · Tailwind CSS · vite-plugin-pwa
**Hosting:** GitHub Pages via GitHub Actions

## One-time setup (important)

The CI workflow uses `npm ci`, which **requires `package-lock.json`**. Generate
and commit it once before the first push (locally or via Claude Code):

```bash
npm install          # creates package-lock.json
git add -A
git commit -m "Initial commit"
git push origin main
```

Then in the GitHub repo: **Settings → Pages → Source: GitHub Actions** (one time).

Every push to `main` builds and deploys automatically. The live URL is:
`https://<your-username>.github.io/subway-simulator/`

## Local development

```bash
npm install
npm run dev       # dev server
npm run build     # production build into dist/
npm run preview   # preview the production build (service worker active)
```

## How to play

- **Lever (left):** drag up for power, down for brake. It stays where you leave it.
- **BRAKE (bottom right):** hold for the emergency brake.
- **Stop zone:** halt within ±8 m of the station STOP board.
  Within 2 m = +30 bonus, 5 m = +20, 8 m = +10, plus +5 base per station.
  Blowing through a station costs 10 coins.
- **Side buttons:** camera (cab / exterior chase), headlights, horn.
- Doors open for 5 seconds at each stop; push the lever up to depart.

## Project structure

```
src/
├── config/constants.js      # tuning: speeds, stations, coin values
├── store/
│   ├── gameStore.js         # Zustand: progression, coins, UI state
│   └── persistence.js       # localStorage save/load
├── game/
│   ├── SceneManager.js      # renderer, cameras, game loop, station logic
│   ├── TrackBuilder.js      # streams & pools tunnel/station segments
│   ├── segmentMeshes.js     # Three.js geometry for tunnel, platforms, people
│   ├── TrainModel.js        # exterior train model (chase camera)
│   ├── TrainPhysics.js      # acceleration / braking model
│   └── audio.js             # synthesized rumble, horn, door chime
└── components/              # HUD: lever, route bar, brake, menus
```

## Privacy & data

Everything runs in the browser. The only stored data is the game save
(coins, best run, sound setting) in this device's localStorage. No analytics,
no network calls after the app is cached.

## Tuning the game

All gameplay numbers live in `src/config/constants.js` — station names and
positions, max speed, acceleration/brake rates, stop tolerance, dwell time,
and coin rewards.
