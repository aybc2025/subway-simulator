import React, { useEffect, useRef } from 'react';
import { SceneManager } from '../game/SceneManager';
import { useGameStore } from '../store/gameStore';
import { unlockAudio, setMuted } from '../game/audio';
import { STATIONS } from '../config/constants';
import HUD from './HUD';

export default function GameScreen() {
  const canvasRef = useRef(null);
  const managerRef = useRef(null);
  const bannerTimer = useRef(null);

  const paused = useGameStore((s) => s.paused);
  const camera = useGameStore((s) => s.camera);
  const headlights = useGameStore((s) => s.headlights);
  const soundOn = useGameStore((s) => s.soundOn);

  useEffect(() => {
    const s = useGameStore.getState();

    const flash = (banner, ms) => {
      s.setBanner(banner);
      clearTimeout(bannerTimer.current);
      if (ms) bannerTimer.current = setTimeout(() => useGameStore.getState().setBanner(null), ms);
    };

    const manager = new SceneManager(canvasRef.current, {
      onTick: (kmh, ratio) => useGameStore.getState().setTick(Math.round(kmh), ratio),
      onArrive: (idx, coins, err) => {
        const st = useGameStore.getState();
        st.addRunCoins(coins);
        st.stationServed(idx);
        flash({
          kind: 'good',
          text: `${STATIONS[idx].name} — doors open · +${coins} coins (${err.toFixed(1)} m off the mark)`
        });
      },
      onReady: (nextName) => flash({ kind: 'info', text: `Push the lever up to depart → ${nextName}` }),
      onDepart: () => flash(null),
      onMissed: (idx, penalty) => {
        const st = useGameStore.getState();
        st.addRunCoins(penalty);
        st.stationMissed(idx);
        flash({ kind: 'warn', text: `Missed ${STATIONS[idx].name} · ${penalty} coins` }, 3500);
      },
      onComplete: () => useGameStore.getState().finishRun()
    });
    managerRef.current = manager;

    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock, { once: true });

    return () => {
      clearTimeout(bannerTimer.current);
      window.removeEventListener('pointerdown', unlock);
      manager.dispose();
      managerRef.current = null;
    };
  }, []);

  useEffect(() => { managerRef.current?.setPaused(paused); }, [paused]);
  useEffect(() => { managerRef.current?.setCamera(camera); }, [camera]);
  useEffect(() => { managerRef.current?.setHeadlights(headlights); }, [headlights]);
  useEffect(() => { setMuted(!soundOn); }, [soundOn]);

  return (
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {camera === 'cab' && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: 'inset 0 0 90px 30px rgba(0,0,0,0.85)' }}
        />
      )}
      <HUD
        onLever={(v) => managerRef.current?.setLever(v)}
        onEBrake={(b) => managerRef.current?.setEBrake(b)}
      />
    </div>
  );
}
