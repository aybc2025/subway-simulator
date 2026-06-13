import React from 'react';
import { useGameStore } from '../store/gameStore';
import { STATIONS } from '../config/constants';

export default function MainMenu() {
  const coins = useGameStore((s) => s.coins);
  const gems = useGameStore((s) => s.gems);
  const bestRun = useGameStore((s) => s.bestRun);
  const startGame = useGameStore((s) => s.startGame);
  const soundOn = useGameStore((s) => s.soundOn);
  const toggleSound = useGameStore((s) => s.toggleSound);

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-5 overflow-hidden p-6 text-center">
      {/* headlights glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(220px 140px at 38% 62%, rgba(140,190,255,0.16), transparent 70%),' +
            'radial-gradient(220px 140px at 62% 62%, rgba(140,190,255,0.16), transparent 70%)'
        }}
      />

      <div className="absolute right-4 top-4 flex gap-2">
        <div className="hud-chip">
          <span className="inline-block h-4 w-4 rounded-full bg-yellow-400 ring-2 ring-yellow-600" />
          {coins}
        </div>
        <div className="hud-chip">
          <span className="inline-block h-4 w-4 rotate-45 rounded-sm bg-sky-400 ring-2 ring-sky-600" />
          {gems}
        </div>
      </div>

      <div>
        <h1 className="text-4xl font-black tracking-widest sm:text-5xl">SUBWAY</h1>
        <h2 className="text-2xl font-black tracking-[0.4em] text-haz">SIMULATOR</h2>
        <div className="hazard-stripe mx-auto mt-3 w-56 rounded" />
      </div>

      <p className="max-w-sm text-sm leading-relaxed text-white/70">
        Push the lever up to power, pull it down to brake. Stop on the mark at all{' '}
        {STATIONS.length} stations — the closer you stop, the more coins you earn.
      </p>

      <button
        className="rounded-2xl bg-haz px-12 py-4 text-xl font-black tracking-widest text-black shadow-[0_6px_0_#9a7c0d] active:translate-y-1 active:shadow-none"
        onClick={startGame}
      >
        DRIVE
      </button>

      <div className="flex items-center gap-4 text-sm text-white/60">
        <span>Best run: {bestRun} 🪙</span>
        <button className="underline underline-offset-2" onClick={toggleSound}>
          Sound: {soundOn ? 'On' : 'Off'}
        </button>
      </div>

      <p className="absolute bottom-3 text-xs text-white/40">
        Works offline · progress saved on this device · install from your browser menu
      </p>
    </div>
  );
}
