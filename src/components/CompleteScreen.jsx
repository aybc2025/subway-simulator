import React from 'react';
import { useGameStore } from '../store/gameStore';
import { STATIONS } from '../config/constants';

export default function CompleteScreen() {
  const runCoins = useGameStore((s) => s.runCoins);
  const coins = useGameStore((s) => s.coins);
  const bestRun = useGameStore((s) => s.bestRun);
  const served = useGameStore((s) => s.served);
  const startGame = useGameStore((s) => s.startGame);
  const backToMenu = useGameStore((s) => s.backToMenu);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="hazard-stripe w-64 rounded" />
      <h1 className="text-3xl font-black tracking-wide">END OF THE LINE</h1>
      <p className="text-white/70">
        Stations served: {served.length} / {STATIONS.length}
      </p>
      <div className="flex gap-6 text-lg font-bold">
        <span>Run: +{runCoins} 🪙</span>
        <span>Total: {coins} 🪙</span>
      </div>
      <p className="text-sm text-white/60">Best run: {bestRun} coins</p>
      <div className="mt-2 flex gap-3">
        <button
          className="rounded-xl bg-haz px-6 py-3 font-extrabold text-black active:scale-95"
          onClick={startGame}
        >
          Drive again
        </button>
        <button
          className="rounded-xl bg-white/10 px-6 py-3 font-bold active:scale-95"
          onClick={backToMenu}
        >
          Menu
        </button>
      </div>
      <div className="hazard-stripe w-64 rounded" />
    </div>
  );
}
