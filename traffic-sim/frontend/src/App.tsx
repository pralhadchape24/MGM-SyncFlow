import { useRef, useState, useEffect } from "react";
import MapView from "./components/MapView.jsx";
import ControlPanel from "./components/ControlPanel.jsx";
import LogsPanel from "./components/LogsPanel.jsx";
import {
  getHospitals,
  startSimulation,
  type Hospital,
  type EventLog,
  type SimulationWaypoints,
  type ViolationEvent,
} from "./services/api";

type LatLng = [number, number];

function App() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [allRoutes, setAllRoutes] = useState<any[]>([]);
  const [shortestRouteIndex, setShortestRouteIndex] = useState<number | null>(null);
  const [ambulancePos, setAmbulancePos] = useState<LatLng | null>(null);
  const [violations, setViolations] = useState<ViolationEvent[]>([]);
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [waypoints, setWaypoints] = useState<SimulationWaypoints | null>(null);
  const [loading, setLoading] = useState(false);

  const animationRef = useRef<number | null>(null);

  // Fetch hospitals from backend on mount
  useEffect(() => {
    getHospitals()
      .then(setHospitals)
      .catch((err) => console.error("Failed to fetch hospitals:", err));
  }, []);

  const simulate = async () => {
    if (hospitals.length < 3) {
      console.error("Not enough hospitals available");
      return;
    }

    const source = hospitals[2];
    const destination = hospitals[1];

    setLoading(true);

    try {
      if (animationRef.current !== null) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }

      const result = await startSimulation(source, destination);

      // Use backend's best route for ambulance animation
      setRoute(result.route);
      setAllRoutes([]); // Backend returns best route only for now
      setViolations(result.violations || []);
      setLogs(result.logs || []);
      setWaypoints(result.waypoints || null);
      setAmbulancePos(result.route[0]);

      // Ambulance animation along the route
      let i = 0;
      animationRef.current = window.setInterval(() => {
        setAmbulancePos(result.route[i]);
        i++;

        if (i >= result.route.length && animationRef.current !== null) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
      }, 30);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrganDispatch = (result: any) => {
    if (animationRef.current !== null) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    const logs: EventLog[] = [
      {
        id: `log-${Date.now()}-1`,
        timestamp: new Date(),
        event: "AMBULANCE_DISPATCHED",
        message: `🚑 Organ dispatch: ${result.organType} to ${result.destinationHospital}`,
        data: { trackingId: result.trackingId, urgency: result.urgencyLevel },
      },
      {
        id: `log-${Date.now()}-2`,
        timestamp: new Date(),
        event: "HOSPITAL_ALERTED",
        message: `🏥 Destination: ${result.destinationHospital}`,
      },
      {
        id: `log-${Date.now()}-3`,
        timestamp: new Date(),
        event: "SIMULATION_END",
        message: "✅ Organ delivery dispatched",
      },
    ];

    setRoute(result.route || []);
    setAllRoutes([]);
    setViolations([]);
    setLogs(logs);
    setWaypoints(null);
    setAmbulancePos((result.route && result.route[0]) || null);

    // Ambulance animation along the route
    if (result.route && result.route.length > 0) {
      let i = 0;
      animationRef.current = window.setInterval(() => {
        setAmbulancePos(result.route[i]);
        i++;
        if (i >= result.route.length && animationRef.current !== null) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
      }, 30);
    }
  };

  const handlePatientDispatch = (result: any) => {
    if (animationRef.current !== null) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    const logs: EventLog[] = [
      {
        id: `log-${Date.now()}-1`,
        timestamp: new Date(),
        event: "AMBULANCE_DISPATCHED",
        message: `🚑 Patient dispatch: ${result.patientName} to ${result.destinationHospital}`,
        data: { trackingId: result.trackingId, ambulanceId: result.ambulanceId },
      },
      {
        id: `log-${Date.now()}-2`,
        timestamp: new Date(),
        event: "HOSPITAL_ALERTED",
        message: `🏥 Destination: ${result.destinationHospital} | Dept: ${result.requiredDepartment}`,
      },
      {
        id: `log-${Date.now()}-3`,
        timestamp: new Date(),
        event: "SIMULATION_END",
        message: "✅ Patient transport dispatched",
      },
    ];

    setRoute(result.route || []);
    setAllRoutes([]);
    setViolations([]);
    setLogs(logs);
    setWaypoints(null);
    setAmbulancePos((result.route && result.route[0]) || null);

    // Ambulance animation along the route
    if (result.route && result.route.length > 0) {
      let i = 0;
      animationRef.current = window.setInterval(() => {
        setAmbulancePos(result.route[i]);
        i++;
        if (i >= result.route.length && animationRef.current !== null) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
      }, 30);
    }
  };

  return (
    <div className="app-shell">
      <section className="map-pane">
        <ControlPanel onSimulate={simulate} onOrganDispatch={handleOrganDispatch} onPatientDispatch={handlePatientDispatch} loading={loading} />

        <MapView
          hospitals={hospitals}
          route={route}
          allRoutes={allRoutes}
          shortestRouteIndex={shortestRouteIndex}
          ambulancePos={ambulancePos}
        />
      </section>

      <section className="logs-pane">
        <LogsPanel logs={logs} waypoints={waypoints} loading={loading} />
      </section>
    </div>
  );
}

export default App;
