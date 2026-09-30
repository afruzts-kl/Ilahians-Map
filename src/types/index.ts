// Core domain types for ILahiaNav

export type LocationCategory =
  | 'academic'
  | 'lab'
  | 'library'
  | 'food'
  | 'facility'
  | 'sports'
  | 'parking'
  | 'gate'
  | 'medical'
  | 'admin'
  | 'emergency';

export interface CampusCoordinates {
  latitude: number;
  longitude: number;
}

export interface CampusLocation {
  id: string;
  name: string;
  category: LocationCategory;
  description: string;
  latitude: number;
  longitude: number;
  building?: string;
  floor?: string;
  room?: string;
  openingHours?: string;
  image?: string;
  facilities?: string[];
  isAccessible: boolean;
  isActive: boolean;
  aliases?: string[]; // for fuzzy search like "CSE", "civil", "mess"
  nearestNodeId?: string; // routing graph snap node
  createdAt?: string;
  updatedAt?: string;
}

export interface CampusBuilding {
  id: string;
  name: string;
  code?: string;
  description: string;
  latitude: number;
  longitude: number;
  polygon?: [number, number][]; // footprint coordinates [lat, lng]
  category: string;
  floors?: number;
  departments?: string[];
  imageUrl?: string;
}

// Graph for Dijkstra/A* routing
export interface PathNode {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isAccessible: boolean;
  type?: 'junction' | 'building_entrance' | 'gate' | 'poi';
}

export interface PathEdge {
  id: string;
  startNodeId: string;
  endNodeId: string;
  distance: number; // in meters
  isAccessible: boolean; // wheelchair / ramp friendly
  isRestricted?: boolean;
  hasStairs?: boolean;
  surfaceType?: 'paved' | 'road' | 'stairs' | 'corridor' | 'grass';
  description?: string;
}

export interface DirectionStep {
  instruction: string;
  distanceMeters: number;
  action: 'start' | 'straight' | 'turn-left' | 'turn-right' | 'slight-left' | 'slight-right' | 'arrive';
  targetLocationName?: string;
  coordinate: [number, number];
}

export interface CalculatedRoute {
  pathNodes: PathNode[];
  coordinates: [number, number][]; // [lat, lng][]
  totalDistanceMeters: number;
  estimatedTimeSeconds: number;
  steps: DirectionStep[];
}

export interface UserLocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null; // meters
  heading: number | null;
  speed: number | null;
  error: string | null;
  isPermissionGranted: boolean;
  isTracking: boolean;
  isSimulated?: boolean;
  timestamp?: number;
}

export interface CampusBoundary {
  name: string;
  coordinates: [number, number][];
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'superadmin' | 'editor';
}
