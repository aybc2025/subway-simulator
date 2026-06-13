import { SEGMENT_LEN, VIEW_AHEAD, VIEW_BEHIND, STATIONS } from '../config/constants';
import { createTunnelSegment, createStationSegment, createStopMarker } from './segmentMeshes';

// Streams tunnel/station segments around the train and recycles them via pools.
export class TrackBuilder {
  constructor(scene) {
    this.scene = scene;
    this.active = new Map(); // segment index -> { group, type }
    this.pool = { tunnel: [], station: [] };

    STATIONS.forEach((s) => {
      const marker = createStopMarker(s.name);
      marker.position.z = s.pos;
      scene.add(marker);
    });
  }

  typeFor(idx) {
    const z0 = idx * SEGMENT_LEN;
    const z1 = z0 + SEGMENT_LEN;
    const isStation = STATIONS.some((s) => z1 > s.pos - 80 && z0 < s.pos + 10);
    return isStation ? 'station' : 'tunnel';
  }

  update(pos) {
    const lo = Math.max(0, Math.floor((pos - VIEW_BEHIND) / SEGMENT_LEN));
    const hi = Math.floor((pos + VIEW_AHEAD) / SEGMENT_LEN);

    for (const [idx, ent] of this.active) {
      if (idx < lo || idx > hi) {
        this.scene.remove(ent.group);
        this.pool[ent.type].push(ent.group);
        this.active.delete(idx);
      }
    }

    for (let i = lo; i <= hi; i++) {
      if (this.active.has(i)) continue;
      const type = this.typeFor(i);
      let group = this.pool[type].pop();
      if (!group) group = type === 'station' ? createStationSegment() : createTunnelSegment();
      group.position.z = i * SEGMENT_LEN;
      this.scene.add(group);
      this.active.set(i, { group, type });
    }
  }
}
