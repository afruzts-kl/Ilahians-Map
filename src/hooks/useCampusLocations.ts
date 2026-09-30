import { useState, useEffect, useCallback, useMemo } from 'react';
import { CampusLocation, CampusBuilding, PathNode, PathEdge, LocationCategory } from '../types';
import { locationService } from '../services/locationService';

export function useCampusLocations() {
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [buildings, setBuildings] = useState<CampusBuilding[]>([]);
  const [pathNodes, setPathNodes] = useState<PathNode[]>([]);
  const [pathEdges, setPathEdges] = useState<PathEdge[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load all campus data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [locs, blds, graph] = await Promise.all([
        locationService.getLocations(),
        locationService.getBuildings(),
        locationService.getRoutingGraph()
      ]);
      setLocations(locs);
      setBuildings(blds);
      setPathNodes(graph.nodes);
      setPathEdges(graph.edges);
      setSavedIds(locationService.getSavedLocationIds());
    } catch (err: any) {
      setError('Unable to load campus data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle bookmark
  const toggleSave = useCallback((id: string) => {
    locationService.toggleSavedLocation(id);
    setSavedIds(locationService.getSavedLocationIds());
  }, []);

  // Quick lookup maps
  const locationMap = useMemo(() => {
    return new Map(locations.map(l => [l.id, l]));
  }, [locations]);

  const savedLocations = useMemo(() => {
    return locations.filter(l => savedIds.includes(l.id));
  }, [locations, savedIds]);

  // Search logic supporting name, alias, category, building
  const searchLocations = useCallback(
    (query: string, selectedCategory?: LocationCategory | null) => {
      const q = query.toLowerCase().trim();

      return locations.filter(loc => {
        if (!loc.isActive) return false;

        // Category filter
        if (selectedCategory && loc.category !== selectedCategory) {
          return false;
        }

        if (!q) return true;

        // Name match
        if (loc.name.toLowerCase().includes(q)) return true;
        // Description match
        if (loc.description.toLowerCase().includes(q)) return true;
        // Building match
        if (loc.building && loc.building.toLowerCase().includes(q)) return true;
        // Room/Floor match
        if (loc.room && loc.room.toLowerCase().includes(q)) return true;
        if (loc.floor && loc.floor.toLowerCase().includes(q)) return true;
        // Aliases match (e.g. "CSE", "canteen", "ground")
        if (loc.aliases && loc.aliases.some(alias => alias.toLowerCase().includes(q))) {
          return true;
        }

        return false;
      });
    },
    [locations]
  );

  return {
    locations,
    buildings,
    pathNodes,
    pathEdges,
    savedIds,
    savedLocations,
    locationMap,
    isLoading,
    error,
    refresh: loadData,
    toggleSave,
    searchLocations
  };
}
