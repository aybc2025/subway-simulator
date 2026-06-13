import React from 'react';
import { useGameStore } from '../store/gameStore';
import ThrottleLever from './ThrottleLever';
import RouteProgress from './RouteProgress';
import BrakeButton from './BrakeButton';
import SideControls from './SideControls';
import PauseOverlay from './PauseOverlay';

export default function HUD({ onLever, onEBrake }) {
  const coins = useGameStore((s) => s.coins);
  const runCoins = useGameStore((s) => s.runCoins);
  const gems = useGameStore((s) => s.gems);
  const speedKmh = useGameStore((s) => s.speedKmh);
  const maxSpeedKmh = useGameStore((s) => s.maxSpeedKmh);
  const distToStop = useGameStore((s) => s.distToStop);
  const upcomingLight = useGameStore((s) => s.upcomingLight);
  const banner = useGameStore((s) => s.banner);
  const paused = useGameStore((s) => s.paused);
  const setPaused = useGameStore((s) => s.setPaused);

  return (
    <div className="absolute inset-0">
      {/* top bar */}
      <div className="absolute left-3 right-3 top-2 flex items-start gap-3">
        <div className="flex gap-2">
          <div className="hud-chip">
            <span className="inline-block h-4 w-4 rounded-full bg-yellow-400 ring-2 ring-yellow-600" />
            {coins + runCoins}
          </div>
          <div className="hud-chip">
            <span className="inline-block h-4 w-4 rotate-45 rounded-sm bg-sky-400 ring-2 ring-sky-600" />
            {gems}
          </div>
        </div>

        <div className="flex-1 px-2 pt-1">
          <RouteProgress />

          {/* speed + max speed */}
          <div className="mt-1 flex items-baseline justify-center gap-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]">
            <span className="text-xl font-extrabold tracking-wide">{speedKmh}</span>
            <span className="text-sm opacity-60">km/h</span>
            <span className={`text-sm font-bold ${maxSpeedKmh < 80 ? 'text-red-400' : 'text-white/50'}`}>
              / MAX {maxSpeedKmh}
            </span>
          </div>

          {/* distance to next stop */}
          {distToStop !== null && (
            <p className="text-center text-xs font-bold text-yellow-300 drop-shadow">
              ▼ {distToStop} m to stop
            </p>
          )}

          {/* upcoming traffic light */}
          {upcomingLight && (
            <div className="mt-0.5 flex justify-center">
              <span className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold ${
                upcomingLight.isRed ? 'bg-red-900/80 text-red-200' : 'bg-green-900/80 text-green-200'
              }`}>
                <span className={`inline-block h-2 w-2 rounded-full ${upcomingLight.isRed ? 'bg-red-400' : 'bg-green-400'}`} />
                {upcomingLight.isRed ? `LIMIT ${upcomingLight.speedLimit} km/h` : 'SIGNAL CLEAR'}
                {' · '}{upcomingLight.dist} m
              </span>
            </div>
          )}
        </div>

        <button
          className="side-btn bg-black/55"
          aria-label={paused ? 'Resume' : 'Pause'}
          onPointerDown={() => setPaused(!paused)}
        >
          {paused ? '▶' : '❚❚'}
        </button>
      </div>

      {/* throttle lever, left */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <ThrottleLever onChange={onLever} />
      </div>

      {/* camera / lights / horn, right column */}
      <div className="absolute right-3 top-20">
        <SideControls />
      </div>

      {/* emergency brake, bottom right */}
      <div className="absolute bottom-4 right-4">
        <BrakeButton onEBrake={onEBrake} />
      </div>

      {/* station / event banner */}
      {banner && (
        <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2">
          <div
            className={
              'rounded-xl px-4 py-2 text-center text-sm font-bold shadow-lg backdrop-blur-sm ' +
              (banner.kind === 'good'
                ? 'bg-green-700/85'
                : banner.kind === 'warn'
                  ? 'bg-red-700/85'
                  : 'bg-black/65')
            }
          >
            {banner.text}
          </div>
        </div>
      )}

      {paused && <PauseOverlay />}
    </div>
  );
}
