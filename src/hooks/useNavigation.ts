import { useState, useCallback, useEffect, useMemo } from 'react';
import { CampusLocation, CalculatedRoute, PathNode, PathEdge, UserLocationState } from '../types';
import { findNearestNode, findShortestPath, calculateHaversineDistance, validateGraphConnectivity } from '../services/routing';
import { CAMPUS_CONFIG } from '../config/campusConfig';

export interface UseNavigationProps {
  userLocation: UserLocationState;
  pathNodes: PathNode[];
  pathEdges: PathEdge[];
  locations: CampusLocation[];
}

export function useNavigation({ userLocation, pathNodes, pathEdges, locations }: UseNavigationProps) {
  const [destination, setDestination] = useState<CampusLocation | null>(null);
  const [startPoint, setStartPoint] = useState<CampusLocation | { name: string; latitude: number; longitude: number; nodeId?: string } | null>(null);
  const [isAccessibleOnly, setIsAccessibleOnly] = useState<boolean>(false);
  const [currentRoute, setCurrentRoute] = useState<CalculatedRoute | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [hasArrived, setHasArrived] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [routingError, setRoutingError] = useState<string | null>(null);

  // Compute route when origin or destination changes
  const calculateRoute = useCallback(() => {
    setRoutingError(null);
    if (!destination) {
      setCurrentRoute(null);
      return;
    }

    // Validate graph connectivity first (only check once per session)
    const validation = validateGraphConnectivity(pathNodes, pathEdges);
    if (!validation.connected && pathNodes.length > 0) {
      setRoutingError(
        `Campus walking network is not fully connected (${validation.components} disconnected components). ` +
        `Some locations may not be reachable. ${validation.issues.slice(0, 3).join('; ')}`
      );
    }

    // Determine destination node
    let destNodeId = destination.nearestNodeId;
    if (!destNodeId) {
      const nearest = findNearestNode(destination.latitude, destination.longitude, pathNodes);
      destNodeId = nearest ? nearest.id : undefined;
    }

    if (!destNodeId) {
      setRoutingError("Destination is not connected to the walkable network. Please contact admin to add path nodes.");
      return;
    }

    // Determine start node: from manual start point OR live user GPS position
    let startLat: number;
    let startLon: number;

    if (startPoint) {
      startLat = startPoint.latitude;
      startLon = startPoint.longitude;
    } else if (userLocation.latitude !== null && userLocation.longitude !== null) {
      startLat = userLocation.latitude;
      startLon = userLocation.longitude;
    } else {
      // Default to campus main entrance gate if GPS unavailable
      startLat = 10.02710;
      startLon = 76.59600;
    }

    const nearestStart = findNearestNode(startLat, startLon, pathNodes);
    if (!nearestStart) {
      setRoutingError("Could not find a walkable path near starting point.");
      return;
    }

    const route = findShortestPath(
      nearestStart.id,
      destNodeId,
      pathNodes,
      pathEdges,
      isAccessibleOnly,
      CAMPUS_CONFIG.walkingSpeedMps
    );

    if (!route) {
      // Check if nodes are in different components
      const startComponent = getComponentId(nearestStart.id, pathNodes, pathEdges);
      const destComponent = getComponentId(destNodeId, pathNodes, pathEdges);

      if (startComponent !== destComponent) {
        setRoutingError(
          `No connected path exists between these locations. ` +
          `The walking network has ${validation.components} disconnected areas. ` +
          `Please contact admin to connect the walking paths.`
        );
      } else {
        setRoutingError(
          isAccessibleOnly
            ? "No wheelchair-accessible route found. Try disabling wheelchair mode."
            : "No walking route could be found between these campus locations."
        );
      }
      setCurrentRoute(null);
      return;
    }

    setCurrentRoute(route);
    setActiveStepIndex(0);
    setHasArrived(false);
  }, [destination, startPoint, userLocation, pathNodes, pathEdges, isAccessibleOnly]);

// Helper to find which component a node belongs to
function getComponentId(nodeId: string, nodes: PathNode[], edges: PathEdge[]): number {
  const adjacency = new Map<string, string[]>();
  for (const node of nodes) adjacency.set(node.id, []);
  for (const edge of edges) {
    if (edge.isRestricted) continue;
    adjacency.get(edge.startNodeId)?.push(edge.endNodeId);
    adjacency.get(edge.endNodeId)?.push(edge.startNodeId);
  }

  const visited = new Set<string>();
  let component = 0;

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      component++;
      const queue = [node.id];
      visited.add(node.id);
      while (queue.length > 0) {
        const current = queue.shift()!;
        for (const neighbor of adjacency.get(current) || []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      if (visited.has(nodeId)) return component;
    }
  }
  return -1;
}

  // Recalculate route whenever destination, accessible toggle, or manual start point changes
  useEffect(() => {
    if (destination) {
      calculateRoute();
    }
  }, [destination, isAccessibleOnly, startPoint, calculateRoute]);

  // Live Navigation tracking: update active step & arrival detection
  useEffect(() => {
    if (!isNavigating || !currentRoute || !destination) return;
    if (userLocation.latitude === null || userLocation.longitude === null) return;

    // Check distance to destination
    const distanceToDest = calculateHaversineDistance(
      userLocation.latitude,
      userLocation.longitude,
      destination.latitude,
      destination.longitude
    );

    if (distanceToDest <= CAMPUS_CONFIG.arrivalToleranceMeters) {
      setHasArrived(true);
      return;
    }

    // Update active step based on proximity to step coordinates
    const steps = currentRoute.steps;
    if (steps.length > 0) {
      let closestStepIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < steps.length; i++) {
        const [sLat, sLon] = steps[i].coordinate;
        const d = calculateHaversineDistance(userLocation.latitude, userLocation.longitude, sLat, sLon);
        if (d < minDistance) {
          minDistance = d;
          closestStepIdx = i;
        }
      }

      if (closestStepIdx > activeStepIndex) {
        setActiveStepIndex(closestStepIdx);
      }
    }
  }, [isNavigating, userLocation, currentRoute, destination, activeStepIndex]);

  const startNavigation = useCallback(() => {
    if (currentRoute) {
      setIsNavigating(true);
      setHasArrived(false);
      setActiveStepIndex(0);
    }
  }, [currentRoute]);

  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    setHasArrived(false);
    setActiveStepIndex(0);
  }, []);

  const clearRoute = useCallback(() => {
    stopNavigation();
    setDestination(null);
    setCurrentRoute(null);
    setRoutingError(null);
    setStartPoint(null);
  }, [stopNavigation]);

  return {
    destination,
    setDestination,
    startPoint,
    setStartPoint,
    isAccessibleOnly,
    setIsAccessibleOnly,
    currentRoute,
    isNavigating,
    hasArrived,
    activeStepIndex,
    routingError,
    startNavigation,
    stopNavigation,
    clearRoute,
    recalculate: calculateRoute
  };
}
