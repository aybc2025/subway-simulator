import React from 'react';
import { useGameStore } from '../store/gameStore';
import { horn } from '../game/audio';

export default function SideControls() {
  const camera = useGameStore((s) => s.camera);
  const setCamera = useGameStore((s) => s.setCamera);
  const headlights = useGameStore((s) => s.headlights);
  const toggleHeadlights = useGameStore((s) => s.toggleHeadlights);

  return (
    <div className="flex flex-col gap-2.5">
      <button
        className="side-btn"
        aria-label="Switch camera"
        onPointerDown={() => setCamera(camera === 'cab' ? 'chase' : 'cab')}
      >
        🎥
      </button>
      <button
        className={`side-btn ${headlights ? '' : 'opacity-50'}`}
        aria-label="Toggle headlights"
        onPointerDown={toggleHeadlights}
      >
        💡
      </button>
      <button className="side-btn" aria-label="Horn" onPointerDown={() => horn()}>
        📯
      </button>
    </div>
  );
}
