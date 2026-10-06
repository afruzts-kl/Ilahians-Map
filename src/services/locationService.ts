import { CampusLocation, CampusBuilding, PathNode, PathEdge, CampusEvent } from '../types';
import { SEED_LOCATIONS, SEED_BUILDINGS, SEED_NODES, SEED_EDGES, SEED_CAMPUS_EVENTS } from '../data/seedCampusData';
import { supabase, isSupabaseConfigured, getSupabaseClient } from './supabase';

const STORAGE_KEYS = {
  LOCATIONS: 'ilahianav_v2_locations',
  BUILDINGS: 'ilahianav_v2_buildings',
  NODES: 'ilahianav_v2_nodes',
  EDGES: 'ilahianav_v2_edges',
  SAVED: 'ilahianav_v2_saved_ids',
  EVENTS: 'ilahianav_v2_events'
};

/**
 * Service to manage campus locations, buildings, path graphs, and bookmarks.
 * Automatically synchronizes with Supabase when configured, or provides robust
 * local storage fallback with initial verified seed data.
 */
export const locationService = {
  // 1. Get all active locations
  async getLocations(): Promise<CampusLocation[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .order('name');
        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            description: item.description,
            latitude: item.latitude,
            longitude: item.longitude,
            building: item.building_id || item.building,
            floor: item.floor,
            room: item.room,
            openingHours: item.opening_hours,
            isAccessible: item.accessibility ?? true,
            facilities: item.facilities || [],
            aliases: item.aliases || [],
            image: item.image_url,
            isActive: item.is_active ?? true,
            nearestNodeId: item.nearest_node_id,
            createdAt: item.created_at,
            updatedAt: item.updated_at
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage', err);
      }
    }

    // Local Storage / Seed Fallback
    const cached = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // use seed
      }
    }
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(SEED_LOCATIONS));
    return SEED_LOCATIONS;
  },

  // 2. Get all buildings
  async getBuildings(): Promise<CampusBuilding[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('buildings')
          .select('*')
          .order('name');
        if (!error && data && data.length > 0) {
          return data.map((b: any) => ({
            id: b.id,
            name: b.name,
            code: b.code,
            description: b.description,
            latitude: b.latitude,
            longitude: b.longitude,
            category: b.category,
            floors: b.floors,
            departments: b.departments,
            polygon: b.polygon_data,
            imageUrl: b.image_url,
            blueprint_url: b.blueprint_url,
            blueprint_bounds: b.blueprint_bounds,
            blueprint_floor: b.blueprint_floor,
            blueprint_opacity: b.blueprint_opacity
          }));
        }
      } catch (err) {
        console.warn('Supabase buildings fetch failed, falling back', err);
      }
    }

    const cached = localStorage.getItem(STORAGE_KEYS.BUILDINGS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // use seed
      }
    }
    localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(SEED_BUILDINGS));
    return SEED_BUILDINGS;
  },

  // 3. Get Path Nodes and Edges for Walking Graph
  async getRoutingGraph(): Promise<{ nodes: PathNode[]; edges: PathEdge[] }> {
    if (isSupabaseConfigured) {
      try {
        const [nodesRes, edgesRes] = await Promise.all([
          supabase.from('path_nodes').select('*'),
          supabase.from('path_edges').select('*')
        ]);

        if (!nodesRes.error && !edgesRes.error && nodesRes.data && edgesRes.data) {
          const nodes: PathNode[] = nodesRes.data.map((n: any) => ({
            id: n.id,
            name: n.name,
            latitude: n.latitude,
            longitude: n.longitude,
            isAccessible: n.is_accessible ?? true,
            type: n.type
          }));

          const edges: PathEdge[] = edgesRes.data.map((e: any) => ({
            id: e.id,
            startNodeId: e.start_node_id,
            endNodeId: e.end_node_id,
            distance: e.distance,
            isAccessible: e.is_accessible ?? true,
            isRestricted: e.is_restricted ?? false,
            hasStairs: e.has_stairs ?? false,
            surfaceType: e.surface_type,
            description: e.description
          }));

          if (nodes.length > 0 && edges.length > 0) {
            return { nodes, edges };
          }
        }
      } catch (err) {
        console.warn('Failed to fetch routing graph from Supabase, falling back', err);
      }
    }

    // Local / Seed Fallback
    const cachedNodes = localStorage.getItem(STORAGE_KEYS.NODES);
    const cachedEdges = localStorage.getItem(STORAGE_KEYS.EDGES);

    let nodes = SEED_NODES;
    let edges = SEED_EDGES;

    if (cachedNodes) {
      try { nodes = JSON.parse(cachedNodes); } catch {}
    } else {
      localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(SEED_NODES));
    }

    if (cachedEdges) {
      try { edges = JSON.parse(cachedEdges); } catch {}
    } else {
      localStorage.setItem(STORAGE_KEYS.EDGES, JSON.stringify(SEED_EDGES));
    }

    return { nodes, edges };
  },

  // 4. Get all Campus Events (from Supabase or local cache/seed)
  async getEvents(): Promise<CampusEvent[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date');
        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            date: item.date,
            time: item.time,
            locationId: item.location_id,
            locationName: item.location_name,
            category: item.category,
            organizer: item.organizer,
            isUpcoming: item.is_upcoming ?? true
          }));
        }
      } catch (err) {
        console.warn('Supabase events fetch failed, falling back', err);
      }
    }

    const cached = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // fallback
      }
    }
    return SEED_CAMPUS_EVENTS;
  },

  // 5. CRUD Operations for Locations
  async saveLocation(location: CampusLocation): Promise<CampusLocation> {
    const locations = await this.getLocations();
    const index = locations.findIndex(l => l.id === location.id);

    if (index >= 0) {
      locations[index] = { ...location, updatedAt: new Date().toISOString() };
    } else {
      locations.push({ ...location, createdAt: new Date().toISOString() });
    }

    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));

    if (isSupabaseConfigured) {
      try {
        await getSupabaseClient().from('locations').upsert({
          id: location.id,
          name: location.name,
          category: location.category,
          description: location.description,
          latitude: location.latitude,
          longitude: location.longitude,
          building: location.building,
          floor: location.floor,
          room: location.room,
          opening_hours: location.openingHours,
          accessibility: location.isAccessible,
          facilities: location.facilities,
          aliases: location.aliases,
          image_url: location.image,
          is_active: location.isActive,
          nearest_node_id: location.nearestNodeId,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.error('Supabase location sync error', e);
      }
    }

    return location;
  },

  async deleteLocation(id: string): Promise<boolean> {
    const locations = await this.getLocations();
    const filtered = locations.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(filtered));

    if (isSupabaseConfigured) {
      try {
        await getSupabaseClient().from('locations').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase location delete error', e);
      }
    }

    return true;
  },

  // 5. Admin Path Nodes & Edges Management
  async savePathNode(node: PathNode): Promise<PathNode> {
    const { nodes, edges } = await this.getRoutingGraph();
    const idx = nodes.findIndex(n => n.id === node.id);
    if (idx >= 0) {
      nodes[idx] = node;
    } else {
      nodes.push(node);
    }
    localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
    return node;
  },

  async savePathEdge(edge: PathEdge): Promise<PathEdge> {
    const { edges } = await this.getRoutingGraph();
    const idx = edges.findIndex(e => e.id === edge.id);
    if (idx >= 0) {
      edges[idx] = edge;
    } else {
      edges.push(edge);
    }
    localStorage.setItem(STORAGE_KEYS.EDGES, JSON.stringify(edges));
    return edge;
  },

  // 6. Admin Building Management (for blueprints)
  async saveBuilding(building: CampusBuilding): Promise<CampusBuilding> {
    const buildings = await this.getBuildings();
    const idx = buildings.findIndex(b => b.id === building.id);
    if (idx >= 0) {
      buildings[idx] = building;
    } else {
      buildings.push(building);
    }
    localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(buildings));

    if (isSupabaseConfigured) {
      try {
        await getSupabaseClient().from('buildings').upsert({
          id: building.id,
          name: building.name,
          code: building.code,
          description: building.description,
          latitude: building.latitude,
          longitude: building.longitude,
          category: building.category,
          floors: building.floors,
          departments: building.departments,
          polygon_data: building.polygon,
          image_url: building.imageUrl,
          blueprint_url: building.blueprint_url,
          blueprint_bounds: building.blueprint_bounds,
          blueprint_floor: building.blueprint_floor,
          blueprint_opacity: building.blueprint_opacity,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.error('Supabase building sync error', e);
      }
    }

    return building;
  },

  // 7. Saved / Bookmarked Locations
  getSavedLocationIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleSavedLocation(id: string): boolean {
    const current = this.getSavedLocationIds();
    const exists = current.includes(id);
    const updated = exists ? current.filter(item => item !== id) : [...current, id];
    localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(updated));
    return !exists;
  },

  // 7. Reset to default Seed Data
  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(SEED_LOCATIONS));
    localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(SEED_BUILDINGS));
    localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(SEED_NODES));
    localStorage.setItem(STORAGE_KEYS.EDGES, JSON.stringify(SEED_EDGES));
  },

  // 8. GeoJSON Export
  exportGeoJSON(locations: CampusLocation[]): string {
    const featureCollection = {
      type: "FeatureCollection",
      features: locations.map(loc => ({
        type: "Feature",
        properties: {
          id: loc.id,
          name: loc.name,
          category: loc.category,
          description: loc.description,
          building: loc.building,
          floor: loc.floor,
          room: loc.room,
          openingHours: loc.openingHours,
          isAccessible: loc.isAccessible
        },
        geometry: {
          type: "Point",
          coordinates: [loc.longitude, loc.latitude]
        }
      }))
    };
    return JSON.stringify(featureCollection, null, 2);
  }
};
