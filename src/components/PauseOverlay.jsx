import React from 'react';
import { useGameStore } from '../store/gameStore';

export default function PauseOverlay() {
  const setPaused = useGameStore((s) => s.setPaused);
  const backToMenu = useGameStore((s) => s.backToMenu);
  const soundOn = useGameStore((s) => s.soundOn);
  const toggleSound = useGameStore((s) => s.toggleSound);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-64 rounded-2xl bg-panel p-5 text-center shadow-2xl">
        <h2 className="mb-4 text-xl font-extrabold tracking-wide">PAUSED</h2>
        <div className="flex flex-col gap-2.5">
          <button
            className="rounded-xl bg-haz py-2.5 font-extrabold text-black active:scale-95"
            onClick={() => setPaused(false)}
          >
            Resume
          </button>
          <button
            className="rounded-xl bg-white/10 py-2.5 font-bold active:scale-95"
            onClick={toggleSound}
          >
            Sound: {soundOn ? 'On' : 'Off'}
          </button>
          <button
            className="rounded-xl bg-white/10 py-2.5 font-bold active:scale-95"
            onClick={backToMenu}
          >
            Quit to menu
          </button>
        </div>
      </div>
    </div>
  );
}
