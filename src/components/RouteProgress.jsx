import React from 'react';
import { useGameStore } from '../store/gameStore';
import { STATIONS, ROUTE_END } from '../config/constants';

export default function RouteProgress() {
  const posRatio = useGameStore((s) => s.posRatio);
  const served = useGameStore((s) => s.served);
  const missed = useGameStore((s) => s.missed);

  return (
    <div className="relative mx-auto h-6 max-w-md">
      <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded bg-white/85" />
      <div
        className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded bg-signal"
        style={{ width: `${Math.min(100, posRatio * 100)}%` }}
      />
      {STATIONS.map((st, i) => {
        const left = (st.pos / ROUTE_END) * 100;
        const cls = served.includes(i)
          ? 'bg-signal'
          : missed.includes(i)
            ? 'bg-red-500'
            : 'bg-white';
        return (
          <div
            key={st.name}
            className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 ${cls}`}
            style={{ left: `${left}%` }}
            title={st.name}
          />
        );
      })}
      {/* train marker */}
      <div
        className="absolute top-1/2 flex h-5 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded border border-red-300 bg-white text-[9px]"
        style={{ left: `${Math.min(100, posRatio * 100)}%` }}
      >
        🚇
      </div>
    </div>
  );
}
