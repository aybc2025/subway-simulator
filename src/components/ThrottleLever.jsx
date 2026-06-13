import React, { useRef, useState, useCallback } from 'react';

// Vertical master controller. Top = full power, middle = coast, bottom = full brake.
// The handle stays where you leave it, like a real notch controller.
export default function ThrottleLever({ onChange }) {
  const trackRef = useRef(null);
  const [value, setValue] = useState(0); // -1 .. +1

  const apply = useCallback(
    (clientY) => {
      const rect = trackRef.current.getBoundingClientRect();
      const t = (clientY - rect.top) / rect.height; // 0 top .. 1 bottom
      let v = 1 - t * 2;
      v = Math.max(-1, Math.min(1, v));
      if (Math.abs(v) < 0.08) v = 0; // coast detent
      setValue(v);
      onChange(v);
    },
    [onChange]
  );

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    apply(e.clientY);
  };
  const onPointerMove = (e) => {
    if (e.buttons || e.pointerType === 'touch') apply(e.clientY);
  };

  const topPct = ((1 - value) / 2) * 100;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex h-[46vh] min-h-44 flex-col justify-between py-1 text-[10px] font-bold text-white/60">
        <span>PWR</span>
        <span>N</span>
        <span>BRK</span>
      </div>
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className="lever-track relative h-[46vh] min-h-44 w-9 touch-none rounded-full"
        role="slider"
        aria-label="Throttle and brake lever"
        aria-valuemin={-1}
        aria-valuemax={1}
        aria-valuenow={Number(value.toFixed(2))}
      >
        <div className="absolute left-1/2 top-2 bottom-2 w-1.5 -translate-x-1/2 rounded bg-black/55" />
        <div className="absolute left-1/2 top-1/2 h-0.5 w-6 -translate-x-1/2 bg-black/40" />
        <div
          className="lever-handle absolute left-1/2 h-7 w-16 -translate-x-1/2 -translate-y-1/2 rounded-md"
          style={{ top: `${topPct}%` }}
        />
      </div>
    </div>
  );
}
