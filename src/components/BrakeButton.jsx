import React, { useState } from 'react';

// Hold to apply the emergency brake.
export default function BrakeButton({ onEBrake }) {
  const [active, setActive] = useState(false);

  const press = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setActive(true);
    onEBrake(true);
  };
  const release = () => {
    setActive(false);
    onEBrake(false);
  };

  return (
    <button
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      className={`brake-btn ${active ? 'active' : ''} flex h-20 w-20 touch-none flex-col items-center justify-center rounded-full`}
      aria-label="Emergency brake (hold)"
    >
      <span className="text-2xl font-black text-red-500">(!)</span>
      <span className="text-[10px] font-extrabold tracking-widest text-red-400">BRAKE</span>
    </button>
  );
}
