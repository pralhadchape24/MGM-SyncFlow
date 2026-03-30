import type { LatLng, RouteOption } from "../routing/hybridRouting";
import { fetchRoutes, scoreRoute } from "../routing/hybridRouting";
import { generateCCTVNodes } from "../cctv/cctvService";
import type { EventLog } from "../../models/EventLog";
import type { CCTVNode } from "../../models/CCTVNode";

interface WaypointNode {
  index: number;
  cctvId: string;
  coordinates: LatLng;
}

interface SimulationWaypoints {
  source: WaypointNode;
  intermediate: WaypointNode[];
  destination: WaypointNode;
}

export interface SimulationResult {
  route: LatLng[];
  cctvs: CCTVNode[];
  logs: EventLog[];
  waypoints: SimulationWaypoints | null;
  violations: Array<{
    type: "VIOLATION";
    plate: string;
    timestamp: Date;
    cctvId: string;
    lat: number;
    lng: number;
  }>;
}

export async function runSimulation(
  source: LatLng,
  destination: LatLng
): Promise<SimulationResult> {
  const logs: EventLog[] = [];

  logs.push({
    id: `log-${Date.now()}-1`,
    timestamp: new Date(),
    event: "SIMULATION_START",
    message: "🚨 Request received",
  });

  // 1. Fetch routes
  const routes = await fetchRoutes(source, destination);

  logs.push({
    id: `log-${Date.now()}-2`,
    timestamp: new Date(),
    event: "ROUTE_SELECTED",
    message: `📡 Fetched ${routes.length} route alternatives`,
    data: { routeCount: routes.length },
  });

  // 2. Pick best route
  let best = routes[0];
  let bestScore = scoreRoute(best);

  for (const r of routes) {
    const score = scoreRoute(r);
    if (score < bestScore) {
      best = r;
      bestScore = score;
    }
  }

  logs.push({
    id: `log-${Date.now()}-3`,
    timestamp: new Date(),
    event: "ROUTE_SELECTED",
    message: "🧭 Best route selected",
    data: { distance: best.distance, duration: best.duration, score: bestScore },
  });

  // 3. Generate CCTV nodes
  const cctvs = generateCCTVNodes(best.path);

  // Map only the CCTV nodes that exist (cctvs.length may be < best.path.length)
  // source=cctvs[0], destination=cctvs[last], intermediates=cctvs[1..length-2]
  const waypoints: SimulationWaypoints | null =
    best.path.length > 1 && cctvs.length >= 2
      ? {
          source: {
            index: 0,
            cctvId: cctvs[0].id,
            coordinates: best.path[0],
          },
          intermediate:
            cctvs.length > 2
              ? cctvs.slice(1, -1).map((cctv, idx) => ({
                  index: idx + 1,
                  cctvId: cctv.id,
                  coordinates: best.path[idx + 1] ?? best.path[best.path.length - 1],
                }))
              : [],
          destination: {
            index: best.path.length - 1,
            cctvId: cctvs[cctvs.length - 1].id,
            coordinates: best.path[best.path.length - 1],
          },
        }
      : null;

  logs.push({
    id: `log-${Date.now()}-4`,
    timestamp: new Date(),
    event: "CCTV_ACTIVATED",
    message: "📡 CCTV nodes activated",
    data: { cctvCount: cctvs.length },
  });

  logs.push({
    id: `log-${Date.now()}-5`,
    timestamp: new Date(),
    event: "SIMULATION_END",
    message: "✅ Simulation complete",
  });

  return {
    route: best.path,
    cctvs,
    logs,
    waypoints,
    violations: [],
  };
}
