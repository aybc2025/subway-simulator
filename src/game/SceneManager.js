import * as THREE from 'three';
import { TrackBuilder } from './TrackBuilder';
import { TrainPhysics } from './TrainPhysics';
import { createTrainModel } from './TrainModel';
import { setRumble, chime } from './audio';
import { createTrafficLight } from './segmentMeshes';
import {
  STATIONS, ROUTE_END, STOP_TOLERANCE, DWELL_TIME, COINS, MAX_SPEED_KMH,
  TRAFFIC_LIGHT_POSITIONS, TRAFFIC_LIGHT_SPEED_KMH, TRAFFIC_LIGHT_ZONE
} from '../config/constants';

const MAX_MS = MAX_SPEED_KMH / 3.6;

export class SceneManager {
  // events: { onTick, onArrive, onReady, onDepart, onMissed, onComplete }
  constructor(canvas, events) {
    this.events = events;
    this.physics = new TrainPhysics();
    this.phase = 'driving'; // 'driving' | 'dwell' | 'ready' | 'done'
    this.nextIdx = 0;
    this.dwell = 0;
    this.paused = false;
    this.cameraMode = 'cab';
    this.tickAcc = 0;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05060a);
    this.scene.fog = new THREE.Fog(0x05060a, 25, 240);
    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 500);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    this.scene.add(new THREE.HemisphereLight(0x8b8576, 0x1c1812, 0.5));

    this.head = new THREE.SpotLight(0xd8ecff, 400, 150, 0.5, 0.6, 1.2);
    this.scene.add(this.head);
    this.scene.add(this.head.target);

    // A short convoy of point lights that rolls along with the train.
    this.rollLights = [];
    for (let i = 0; i < 8; i++) {
      const p = new THREE.PointLight(0xffd9a0, 30, 30, 1.6);
      this.scene.add(p);
      this.rollLights.push(p);
    }

    this.track = new TrackBuilder(this.scene);

    // Spawn traffic lights at fixed positions, randomly red or green each run
    this.trafficLights = TRAFFIC_LIGHT_POSITIONS.map(pos => {
      const isRed = Math.random() < 0.5;
      const obj = createTrafficLight(isRed);
      obj.position.set(-2.15, 0, pos); // left wall, facing the approaching train
      this.scene.add(obj);
      return { pos, isRed };
    });

    this.train = createTrainModel();
    this.scene.add(this.train);

    this.clock = new THREE.Clock();
    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
    this.resize();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (!this.paused && this.phase !== 'done') this.update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  update(dt) {
    const p = this.physics;

    // Speed limit: enforced whenever the train is within TRAFFIC_LIGHT_ZONE of a red light
    const inRedZone = this.trafficLights.some(
      l => l.isRed && l.pos - p.pos > -15 && l.pos - p.pos < TRAFFIC_LIGHT_ZONE
    );
    p.maxSpeed = inRedZone ? TRAFFIC_LIGHT_SPEED_KMH / 3.6 : MAX_MS;
    const speedLimitKmh = inRedZone ? TRAFFIC_LIGHT_SPEED_KMH : MAX_SPEED_KMH;

    if (this.phase === 'dwell') {
      p.speed = 0;
      this.dwell -= dt;
      if (this.dwell <= 0) {
        if (this.nextIdx === STATIONS.length - 1) {
          this.phase = 'done';
          this.events.onComplete();
          return;
        }
        this.phase = 'ready';
        this.events.onReady(STATIONS[this.nextIdx + 1].name);
      }
    } else if (this.phase === 'ready') {
      if (p.lever > 0.05) {
        chime();
        this.nextIdx += 1;
        this.phase = 'driving';
        this.events.onDepart();
      }
    } else {
      p.step(dt);
      if (p.pos >= ROUTE_END) {
        p.pos = ROUTE_END;
        p.speed = 0;
      }
      this.checkStations();
    }

    // Nearest upcoming traffic light within 400 m
    const nextLight = this.trafficLights
      .filter(l => l.pos > p.pos && l.pos - p.pos <= 400)
      .sort((a, b) => a.pos - b.pos)[0] ?? null;
    const upcomingLight = nextLight
      ? { isRed: nextLight.isRed, dist: Math.round(nextLight.pos - p.pos), speedLimit: nextLight.isRed ? TRAFFIC_LIGHT_SPEED_KMH : MAX_SPEED_KMH }
      : null;

    // Distance to the next station's stop marker
    const st = STATIONS[this.nextIdx];
    const rawDist = this.phase === 'driving' && st ? Math.max(0, st.pos - p.pos) : null;
    const distToStop = rawDist !== null && rawDist < 400 ? Math.round(rawDist) : null;

    this.track.update(p.pos);
    this.placeLights(p.pos);
    this.placeCamera(p.pos);
    setRumble(p.speed / MAX_MS);

    this.tickAcc += dt;
    if (this.tickAcc >= 0.1) {
      this.tickAcc = 0;
      this.events.onTick(p.kmh, p.pos / ROUTE_END, speedLimitKmh, distToStop, upcomingLight);
    }
  }

  checkStations() {
    const st = STATIONS[this.nextIdx];
    if (!st) return;
    const p = this.physics;
    const d = st.pos - p.pos;

    if (Math.abs(d) <= STOP_TOLERANCE && p.speed < 0.15) {
      const err = Math.abs(d);
      const bonus = err < 2 ? COINS.perfect : err < 5 ? COINS.good : COINS.ok;
      this.phase = 'dwell';
      this.dwell = DWELL_TIME;
      p.lever = 0;
      chime();
      this.events.onArrive(this.nextIdx, COINS.base + bonus, err);
    } else if (d < -STOP_TOLERANCE) {
      const missedIdx = this.nextIdx;
      this.nextIdx += 1;
      this.events.onMissed(missedIdx, COINS.missed);
    }
  }

  placeLights(pos) {
    const spacing = 40;
    const base = Math.floor((pos - spacing) / spacing);
    this.rollLights.forEach((l, i) => {
      l.position.set(2.05, 3.1, (base + i) * spacing);
    });
  }

  placeCamera(pos) {
    if (this.cameraMode === 'cab') {
      this.train.visible = false;
      this.camera.position.set(0, 2.55, pos - 1);
      this.camera.lookAt(0, 2.1, pos + 60);
    } else {
      this.train.visible = true;
      this.train.position.z = pos;
      this.camera.position.set(0, 4.6, pos - 17);
      this.camera.lookAt(0, 2.2, pos + 40);
    }
    this.head.position.set(0, 2.4, pos + 0.5);
    this.head.target.position.set(0, 0.8, pos + 70);
  }

  setLever(v) { this.physics.lever = v; }
  setEBrake(b) { this.physics.eBrake = b; }
  setHeadlights(on) { this.head.visible = on; }
  setCamera(mode) { this.cameraMode = mode; }
  setPaused(b) { this.paused = b; }

  dispose() {
    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
  }
}
