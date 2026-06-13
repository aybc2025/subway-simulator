import * as THREE from 'three';

// Simple silver subway car, visible in the exterior chase camera.
export function createTrainModel() {
  const g = new THREE.Group();
  const silver = new THREE.MeshLambertMaterial({ color: 0xb9bec4 });
  const dark = new THREE.MeshLambertMaterial({ color: 0x23262b });
  const red = new THREE.MeshBasicMaterial({ color: 0xc23b3b });
  const glass = new THREE.MeshBasicMaterial({ color: 0x101820 });
  const lamp = new THREE.MeshBasicMaterial({ color: 0xeaf6ff });

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.6, 14), silver);
  body.position.set(0, 1.65, -7);
  g.add(body);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.25, 14), dark);
  roof.position.set(0, 3.05, -7);
  g.add(roof);

  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.54, 0.3, 14), red);
  stripe.position.set(0, 1.5, -7);
  g.add(stripe);

  const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.9), glass);
  windshield.position.set(0, 2.45, 0.01);
  g.add(windshield);

  [-0.85, 0.85].forEach((x) => {
    const h = new THREE.Mesh(new THREE.CircleGeometry(0.14, 12), lamp);
    h.position.set(x, 1.0, 0.02);
    g.add(h);
  });

  const bogie = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 12), dark);
  bogie.position.set(0, 0.35, -7);
  g.add(bogie);
  return g;
}
