import * as THREE from 'three';
import { SEGMENT_LEN } from '../config/constants';

const HALF = SEGMENT_LEN / 2;
let M = null;
const signCache = new Map();

function mats() {
  if (M) return M;
  M = {
    wall: new THREE.MeshLambertMaterial({ color: 0x8a8270 }),
    ceil: new THREE.MeshLambertMaterial({ color: 0x6e6a5e }),
    ballast: new THREE.MeshLambertMaterial({ color: 0x4a443c }),
    rail: new THREE.MeshLambertMaterial({ color: 0xa8aeb4 }),
    tie: new THREE.MeshLambertMaterial({ color: 0x3a322a }),
    hazard: new THREE.MeshBasicMaterial({ map: hazardTexture() }),
    lamp: new THREE.MeshBasicMaterial({ color: 0xffe9b0 }),
    platform: new THREE.MeshLambertMaterial({ color: 0xb59a6a }),
    pEdge: new THREE.MeshBasicMaterial({ color: 0xe7c63a }),
    tile: new THREE.MeshLambertMaterial({ color: 0xd9d5c9 }),
    strip: new THREE.MeshBasicMaterial({ color: 0xf4f1e7 }),
    skin: new THREE.MeshLambertMaterial({ color: 0xc9a07c }),
    legs: new THREE.MeshLambertMaterial({ color: 0x2b2f38 })
  };
  return M;
}

function hazardTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 16;
  const g = c.getContext('2d');
  g.fillStyle = '#c8a72c';
  g.fillRect(0, 0, 128, 16);
  g.fillStyle = '#181510';
  for (let x = -16; x < 144; x += 32) {
    g.beginPath();
    g.moveTo(x, 16);
    g.lineTo(x + 16, 0);
    g.lineTo(x + 32, 0);
    g.lineTo(x + 16, 16);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(4, 1);
  return t;
}

function textTexture(text, bg, fg) {
  const key = `${text}|${bg}`;
  if (signCache.has(key)) return signCache.get(key);
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 96;
  const g = c.getContext('2d');
  g.fillStyle = bg;
  g.fillRect(0, 0, 512, 96);
  g.strokeStyle = fg;
  g.lineWidth = 6;
  g.strokeRect(6, 6, 500, 84);
  g.fillStyle = fg;
  g.font = 'bold 52px system-ui, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 256, 52);
  const t = new THREE.CanvasTexture(c);
  signCache.set(key, t);
  return t;
}

function box(w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}

// Rails, ties and ballast - shared by every segment type. Local z spans 0..SEGMENT_LEN.
function addTrackBed(g) {
  const m = mats();
  g.add(box(3.2, 0.18, SEGMENT_LEN, m.ballast, 0, 0.09, HALF));
  g.add(box(0.12, 0.16, SEGMENT_LEN, m.rail, -0.72, 0.27, HALF));
  g.add(box(0.12, 0.16, SEGMENT_LEN, m.rail, 0.72, 0.27, HALF));
  for (let i = 0; i < 6; i++) {
    g.add(box(2.2, 0.1, 0.45, m.tie, 0, 0.2, i * (SEGMENT_LEN / 6) + 1.6));
  }
}

export function createTunnelSegment() {
  const m = mats();
  const g = new THREE.Group();
  addTrackBed(g);
  g.add(box(0.4, 3.8, SEGMENT_LEN, m.wall, -2.5, 1.9, HALF)); // left wall
  g.add(box(0.4, 3.8, SEGMENT_LEN, m.wall, 2.5, 1.9, HALF));  // right wall
  g.add(box(5.4, 0.4, SEGMENT_LEN, m.ceil, 0, 3.9, HALF));    // ceiling

  // hazard stripes on both walls
  const stripeGeo = new THREE.PlaneGeometry(SEGMENT_LEN, 0.35);
  const left = new THREE.Mesh(stripeGeo, m.hazard);
  left.position.set(-2.29, 2.1, HALF);
  left.rotation.y = Math.PI / 2;
  g.add(left);
  const right = new THREE.Mesh(stripeGeo, m.hazard);
  right.position.set(2.29, 2.1, HALF);
  right.rotation.y = -Math.PI / 2;
  g.add(right);

  // small wall lamp fixture (the moving point lights do the real lighting)
  g.add(box(0.5, 0.18, 0.18, m.lamp, 2.2, 3.2, HALF));
  return g;
}

function person(x, z) {
  const m = mats();
  const palette = [0x3f6db5, 0xb53f3f, 0x3fa05a, 0x8a5fb0, 0xd9a13b, 0x4a4a4a];
  const color = palette[Math.floor(Math.random() * palette.length)];
  const body = new THREE.MeshLambertMaterial({ color });
  const p = new THREE.Group();
  p.add(box(0.3, 0.5, 0.2, m.legs, 0, 0.25, 0));
  p.add(box(0.34, 0.78, 0.22, body, 0, 0.89, 0));
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), m.skin);
  head.position.set(0, 1.42, 0);
  p.add(head);
  p.position.set(x, 1.05, z); // standing on the platform surface
  p.rotation.y = Math.PI + (Math.random() - 0.5) * 0.8;
  return p;
}

export function createStationSegment() {
  const m = mats();
  const g = new THREE.Group();
  addTrackBed(g);

  g.add(box(0.4, 3.8, SEGMENT_LEN, m.wall, -2.5, 1.9, HALF));   // left wall stays
  g.add(box(8.4, 0.4, SEGMENT_LEN, m.ceil, 1.0, 3.9, HALF));    // wider ceiling over platform
  g.add(box(2.9, 1.05, SEGMENT_LEN, m.platform, 2.85, 0.525, HALF)); // platform, right side
  g.add(box(0.3, 0.06, SEGMENT_LEN, m.pEdge, 1.55, 1.085, HALF));    // yellow safety edge
  g.add(box(0.4, 3.8, SEGMENT_LEN, m.tile, 4.5, 1.9, HALF));    // tiled back wall

  // bright ceiling light strip - emissive, lights the platform visually
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.8, SEGMENT_LEN), m.strip);
  strip.rotation.x = Math.PI / 2;
  strip.position.set(2.6, 3.68, HALF);
  g.add(strip);

  // waiting passengers
  const count = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    g.add(person(2.2 + Math.random() * 1.8, 2 + Math.random() * (SEGMENT_LEN - 4)));
  }
  return g;
}

// Traffic signal mounted on the left tunnel wall.
// Returns { group, setRed(bool) } so the caller can cycle the state at runtime.
export function createTrafficLight() {
  const g = new THREE.Group();

  const poleMat = new THREE.MeshLambertMaterial({ color: 0x252525 });
  g.add(box(0.08, 2.4, 0.08, poleMat, 0, 1.2, 0));

  const housingMat = new THREE.MeshLambertMaterial({ color: 0x181818 });
  g.add(box(0.34, 0.82, 0.24, housingMat, 0, 2.78, 0));

  // Bulbs sit on the FRONT face of the housing (z = −0.13) and face −z toward the driver.
  const redMat = new THREE.MeshBasicMaterial({ color: 0x3a0808 });
  const redBulb = new THREE.Mesh(new THREE.CircleGeometry(0.11, 14), redMat);
  redBulb.position.set(0, 3.0, -0.13);
  redBulb.rotation.y = Math.PI;
  g.add(redBulb);

  const greenMat = new THREE.MeshBasicMaterial({ color: 0x22ee44 });
  const greenBulb = new THREE.Mesh(new THREE.CircleGeometry(0.11, 14), greenMat);
  greenBulb.position.set(0, 2.56, -0.13);
  greenBulb.rotation.y = Math.PI;
  g.add(greenBulb);

  // Glow light positioned in front of the housing so it illuminates the approach.
  const glow = new THREE.PointLight(0x22ee44, 22, 20, 2);
  glow.position.set(0, 2.56, -0.2);
  g.add(glow);

  function setRed(isRed) {
    redMat.color.set(isRed ? 0xff2020 : 0x3a0808);
    greenMat.color.set(isRed ? 0x083a08 : 0x22ee44);
    glow.color.set(isRed ? 0xff2020 : 0x22ee44);
    glow.position.y = isRed ? 3.0 : 2.56;
  }

  return { group: g, setRed };
}

// Sign + chevron board placed exactly at a station's stop position.
export function createStopMarker(name) {
  const m = mats();
  const g = new THREE.Group();

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 0.95),
    new THREE.MeshBasicMaterial({ map: textTexture(name.toUpperCase(), '#10316b', '#ffffff') })
  );
  sign.position.set(3.0, 2.7, 0);
  sign.rotation.y = Math.PI; // readable from the approaching train
  g.add(sign);

  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 1.2),
    new THREE.MeshBasicMaterial({ map: textTexture('STOP', '#181510', '#f5c518') })
  );
  board.position.set(1.9, 1.8, -0.4);
  board.rotation.y = Math.PI;
  g.add(board);

  g.add(box(0.12, 1.8, 0.12, m.wall, 1.9, 0.9, -0.35));
  return g;
}
