import { CampusLocation, CampusBuilding, PathNode, PathEdge, CampusEvent } from '../types';

/**
 * Campus Reference Data for Ilahia College (ICET)
 * Center: Mulavoor, Muvattupuzha (approx 10.02835°N, 76.59715°E)
 * 
 * Add your real campus buildings, locations, routing paths, tour steps,
 * and events here. Administrators can also manage these through the Admin Dashboard.
 */

export const SEED_BUILDINGS: CampusBuilding[] = [];

export const SEED_LOCATIONS: CampusLocation[] = [];

export const SEED_NODES: PathNode[] = [];

export const SEED_EDGES: PathEdge[] = [];

export const CAMPUS_TOUR_STEPS: { step: number; title: string; subtitle: string; locationId: string; description: string; tip: string }[] = [];

export const SEED_CAMPUS_EVENTS: CampusEvent[] = [];
