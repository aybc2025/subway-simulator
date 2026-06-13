import { create } from 'zustand';
import { loadSave, writeSave } from './persistence';

const saved = loadSave() || {};

export const useGameStore = create((set, get) => ({
  // persistent
  coins: saved.coins ?? 0,
  gems: saved.gems ?? 5,
  bestRun: saved.bestRun ?? 0,
  soundOn: saved.soundOn ?? true,

  // session
  screen: 'menu',          // 'menu' | 'game' | 'complete'
  paused: false,
  runCoins: 0,
  speedKmh: 0,
  posRatio: 0,
  nextStation: 0,
  served: [],
  missed: [],
  banner: null,            // { kind: 'info'|'good'|'warn', text }
  camera: 'cab',           // 'cab' | 'chase'
  headlights: true,

  startGame: () =>
    set({
      screen: 'game',
      paused: false,
      runCoins: 0,
      speedKmh: 0,
      posRatio: 0,
      nextStation: 0,
      served: [],
      missed: [],
      banner: null
    }),

  setPaused: (paused) => set({ paused }),
  setTick: (speedKmh, posRatio) => set({ speedKmh, posRatio }),
  setBanner: (banner) => set({ banner }),
  setCamera: (camera) => set({ camera }),
  toggleHeadlights: () => set((s) => ({ headlights: !s.headlights })),

  toggleSound: () => {
    const soundOn = !get().soundOn;
    set({ soundOn });
    persist(get(), { soundOn });
  },

  addRunCoins: (n) => set((s) => ({ runCoins: Math.max(0, s.runCoins + n) })),

  stationServed: (idx) =>
    set((s) => ({ served: [...s.served, idx], nextStation: idx + 1 })),

  stationMissed: (idx) =>
    set((s) => ({ missed: [...s.missed, idx], nextStation: idx + 1 })),

  finishRun: () => {
    const s = get();
    const coins = s.coins + s.runCoins;
    const bestRun = Math.max(s.bestRun, s.runCoins);
    set({ screen: 'complete', coins, bestRun });
    persist(get(), { coins, bestRun });
  },

  backToMenu: () => set({ screen: 'menu', paused: false, banner: null })
}));

function persist(state, patch = {}) {
  writeSave({
    coins: patch.coins ?? state.coins,
    gems: state.gems,
    bestRun: patch.bestRun ?? state.bestRun,
    soundOn: patch.soundOn ?? state.soundOn
  });
}
