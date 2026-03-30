import type { LatLng } from "../routing/hybridRouting";
import type { CCTVNode } from "../../models/CCTVNode";

const CCTV_COUNT = 10;

function randomId(): string {
  return `C${String(Math.floor(Math.random() * 900) + 100)}`;
}

export function generateCCTVNodes(path: LatLng[]): CCTVNode[] {
  if (path.length === 0) return [];

  const step = Math.max(1, Math.floor(path.length / CCTV_COUNT));
  const indices = new Set<number>();

  // Always include start and end
  indices.add(0);
  indices.add(path.length - 1);

  // Randomly fill remaining slots from the middle
  while (indices.size < CCTV_COUNT && indices.size < path.length) {
    const mid = Math.floor(Math.random() * (path.length - 2)) + 1;
    indices.add(mid);
  }

  return Array.from(indices)
    .sort((a, b) => a - b)
    .map((idx) => ({
      id: randomId(),
      lat: path[idx][0],
      lng: path[idx][1],
      status: "IDLE",
      lastUpdate: new Date(),
      assignedRouteId: undefined,
    }));
}
