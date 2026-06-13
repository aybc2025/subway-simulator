import React from 'react';

export default function RotateOverlay() {
  return (
    <div className="rotate-overlay fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-panel text-center">
      <div className="text-5xl">📱↻</div>
      <p className="max-w-xs text-lg font-semibold text-white/90">
        Rotate your phone to landscape to drive
      </p>
    </div>
  );
}
