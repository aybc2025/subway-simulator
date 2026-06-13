export const SEGMENT_LEN = 20;     // metres per tunnel segment
export const VIEW_AHEAD = 420;     // metres of track kept ahead of the train
export const VIEW_BEHIND = 60;

export const MAX_SPEED_KMH = 80;
export const ACCEL = 1.1;          // m/s^2 at full power
export const BRAKE = 2.4;          // m/s^2 at full service brake
export const EBRAKE = 3.8;         // m/s^2 emergency brake
export const DRAG = 0.04;

export const STOP_TOLERANCE = 8;   // stop within +-8 m of the marker
export const DWELL_TIME = 5;       // seconds doors stay open

export const STATIONS = [
  { name: 'Harbor', pos: 420 },
  { name: 'Civic Center', pos: 950 },
  { name: 'Museum Mile', pos: 1480 },
  { name: 'Riverside', pos: 2010 },
  { name: 'Terminal', pos: 2540 }
];
export const ROUTE_END = 2600;

export const COINS = { perfect: 30, good: 20, ok: 10, base: 5, missed: -10 };
