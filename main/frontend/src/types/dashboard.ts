export type CCTVStatus = 'NORMAL' | 'HIGH_TRAFFIC' | 'EMERGENCY';

export interface CCTV {
  id: string;
  name: string;
  location: string;
  status: CCTVStatus;
  hasAmbulance: boolean;
  confidence: number;
  position: { x: number; y: number };
  timestamp?: Date;
}

export interface EventLog {
  id: string;
  timestamp: Date;
  cctvId: string;
  message: string;
  type: 'NORMAL' | 'HIGH_TRAFFIC' | 'EMERGENCY' | 'PRIORITY';
}

export interface AmbulancePath {
  id: string;
  path: { x: number; y: number }[];
  currentIndex: number;
  timestamp: Date;
}

export interface DashboardStats {
  totalCCTVs: number;
  normalCount: number;
  highTrafficCount: number;
  emergencyCount: number;
  activeAmbulances: number;
  priorityFeedsActive: boolean;
}
