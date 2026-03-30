import type { CCTV, CCTVStatus, EventLog, AmbulancePath, DashboardStats } from '../types/dashboard';

export const mockCCTVs: CCTV[] = [
  { id: 'S1', name: 'Main Gate', location: 'Building A - Main Entrance', status: 'NORMAL', hasAmbulance: false, confidence: 0, position: { x: 20, y: 15 } },
  { id: 'S2', name: 'Parking Lot', location: 'North Parking Area', status: 'NORMAL', hasAmbulance: false, confidence: 0, position: { x: 50, y: 10 } },
  { id: 'S3', name: 'Crosswalk', location: 'Main Street Crossing', status: 'HIGH_TRAFFIC', hasAmbulance: false, confidence: 0.78, position: { x: 80, y: 20 } },
  { id: 'S4', name: 'Plaza', location: 'Central Plaza', status: 'NORMAL', hasAmbulance: false, confidence: 0, position: { x: 15, y: 45 } },
  { id: 'S5', name: 'Metro Exit', location: 'Underground Metro Station', status: 'NORMAL', hasAmbulance: false, confidence: 0, position: { x: 45, y: 40 } },
  { id: 'S6', name: 'Hospital Road', location: 'Emergency Wing Access', status: 'EMERGENCY', hasAmbulance: true, confidence: 0.94, position: { x: 85, y: 50 } },
  { id: 'S7', name: 'Shopping Mall', location: 'Mall Main Entrance', status: 'HIGH_TRAFFIC', hasAmbulance: false, confidence: 0.65, position: { x: 10, y: 75 } },
  { id: 'S8', name: 'School Zone', location: 'Primary School Area', status: 'NORMAL', hasAmbulance: false, confidence: 0, position: { x: 55, y: 70 } },
  { id: 'S9', name: 'Traffic Light', location: 'Intersection Main/Second', status: 'NORMAL', hasAmbulance: false, confidence: 0, position: { x: 75, y: 80 } },
  { id: 'S10', name: 'Fire Station', location: 'City Fire Station #3', status: 'NORMAL', hasAmbulance: false, confidence: 0, position: { x: 30, y: 90 } },
  { id: 'S11', name: 'Residential', location: 'Green Valley Apartments', status: 'NORMAL', hasAmbulance: false, confidence: 0, position: { x: 60, y: 25 } },
  { id: 'S12', name: 'Industrial', location: 'Factory District', status: 'NORMAL', hasAmbulance: false, confidence: 0, position: { x: 90, y: 35 } },
];

export const mockEventLogs: EventLog[] = [
  { id: '1', timestamp: new Date(Date.now() - 120000), cctvId: 'S3', message: 'CCTV S3 → HIGH TRAFFIC', type: 'HIGH_TRAFFIC' },
  { id: '2', timestamp: new Date(Date.now() - 60000), cctvId: 'S7', message: 'CCTV S7 → AMBULANCE DETECTED', type: 'EMERGENCY' },
  { id: '3', timestamp: new Date(Date.now() - 55000), cctvId: 'ALL', message: 'PRIORITY MODE ACTIVATED', type: 'PRIORITY' },
  { id: '4', timestamp: new Date(Date.now() - 30000), cctvId: 'S6', message: 'CCTV S6 → EMERGENCY - Ambulance Route', type: 'EMERGENCY' },
  { id: '5', timestamp: new Date(Date.now() - 15000), cctvId: 'S6', message: 'CCTV S6 → Ambulance entering hospital zone', type: 'EMERGENCY' },
];

export const mockAmbulancePath: AmbulancePath = {
  id: 'AMB-001',
  path: [
    { x: 75, y: 80 },
    { x: 55, y: 70 },
    { x: 45, y: 40 },
    { x: 85, y: 50 },
  ],
  currentIndex: 2,
  timestamp: new Date(),
};

export const getDashboardStats = (cctvs: CCTV[]): DashboardStats => {
  const emergencyCCTVs = cctvs.filter(c => c.status === 'EMERGENCY');
  const highTrafficCCTVs = cctvs.filter(c => c.status === 'HIGH_TRAFFIC');
  const normalCCTVs = cctvs.filter(c => c.status === 'NORMAL');
  const ambulances = cctvs.filter(c => c.hasAmbulance);

  return {
    totalCCTVs: cctvs.length,
    normalCount: normalCCTVs.length,
    highTrafficCount: highTrafficCCTVs.length,
    emergencyCount: emergencyCCTVs.length,
    activeAmbulances: ambulances.length,
    priorityFeedsActive: emergencyCCTVs.length > 0,
  };
};

export const getStatusColor = (status: CCTVStatus): string => {
  switch (status) {
    case 'NORMAL':
      return '#22c55e';
    case 'HIGH_TRAFFIC':
      return '#eab308';
    case 'EMERGENCY':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

export const getStatusLabel = (status: CCTVStatus): string => {
  switch (status) {
    case 'NORMAL':
      return 'NORMAL';
    case 'HIGH_TRAFFIC':
      return 'HIGH TRAFFIC';
    case 'EMERGENCY':
      return 'EMERGENCY';
    default:
      return 'UNKNOWN';
  }
};
