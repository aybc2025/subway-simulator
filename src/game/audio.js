// Tiny synthesized audio engine - no audio files, works offline.
let ctx = null;
let rumbleGain = null;
let muted = false;

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();

  // Looped filtered noise = wheel/track rumble
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 220;
  rumbleGain = ctx.createGain();
  rumbleGain.gain.value = 0;
  src.connect(lp).connect(rumbleGain).connect(ctx.destination);
  src.start();
  return ctx;
}

export function unlockAudio() {
  const c = ensure();
  if (c && c.state === 'suspended') c.resume();
}

export function setMuted(m) {
  muted = m;
  if (m && rumbleGain) rumbleGain.gain.value = 0;
}

export function setRumble(speedRatio) {
  if (!ctx || !rumbleGain || muted) return;
  const target = Math.min(0.16, speedRatio * 0.18);
  rumbleGain.gain.setTargetAtTime(target, ctx.currentTime, 0.12);
}

export function horn() {
  const c = ensure();
  if (!c || muted) return;
  const g = c.createGain();
  g.gain.value = 0.0001;
  g.connect(c.destination);
  [311, 415].forEach((f) => {
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = f;
    o.connect(g);
    o.start();
    o.stop(c.currentTime + 0.9);
  });
  g.gain.exponentialRampToValueAtTime(0.12, c.currentTime + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.9);
}

export function chime() {
  const c = ensure();
  if (!c || muted) return;
  [659, 523].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    o.connect(g);
    g.connect(c.destination);
    const t = c.currentTime + i * 0.28;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    o.start(t);
    o.stop(t + 0.6);
  });
}
