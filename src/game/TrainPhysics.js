import { ACCEL, BRAKE, EBRAKE, DRAG, MAX_SPEED_KMH } from '../config/constants';

const MAX_MS = MAX_SPEED_KMH / 3.6;

export class TrainPhysics {
  constructor() {
    this.pos = 0;      // metres along the line
    this.speed = 0;    // m/s
    this.lever = 0;    // -1 (full brake) .. 0 (coast) .. +1 (full power)
    this.eBrake = false;
  }

  step(dt) {
    let a = 0;
    if (this.eBrake) a = -EBRAKE;
    else if (this.lever > 0) a = this.lever * ACCEL;
    else if (this.lever < 0) a = this.lever * BRAKE;
    if (this.speed > 0) a -= DRAG;
    this.speed = Math.min(MAX_MS, Math.max(0, this.speed + a * dt));
    this.pos += this.speed * dt;
  }

  get kmh() {
    return this.speed * 3.6;
  }
}
