import { PathNode, PathEdge, CalculatedRoute, DirectionStep } from '../types';
import { CAMPUS_CONFIG } from '../config/campusConfig';

/**
 * Calculates Haversine distance in meters between two [latitude, longitude] points
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates initial compass bearing in degrees (0 - 360) from point 1 to point 2
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Find nearest node in path graph to a given coordinate
 */
export function findNearestNode(
  latitude: number,
  longitude: number,
  nodes: PathNode[]
): PathNode | null {
  if (!nodes || nodes.length === 0) return null;

  let closestNode: PathNode | null = null;
  let minDistance = Infinity;

  for (const node of nodes) {
    const dist = calculateHaversineDistance(
      latitude,
      longitude,
      node.latitude,
      node.longitude
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestNode = node;
    }
  }

  return closestNode;
}

/**
 * Dijkstra / A* Routing Algorithm on the Campus Walking Graph
 */
export function findShortestPath(
  startNodeId: string,
  targetNodeId: string,
  nodes: PathNode[],
  edges: PathEdge[],
  accessibleOnly: boolean = false,
  walkingSpeed: number = CAMPUS_CONFIG.walkingSpeedMps
): CalculatedRoute | null {
  if (startNodeId === targetNodeId) {
    const node = nodes.find(n => n.id === startNodeId);
    if (!node) return null;
    return {
      pathNodes: [node],
      coordinates: [[node.latitude, node.longitude]],
      totalDistanceMeters: 0,
      estimatedTimeSeconds: 0,
      steps: [
        {
          instruction: `You have arrived at ${node.name}.`,
          distanceMeters: 0,
          action: 'arrive',
          targetLocationName: node.name,
          coordinate: [node.latitude, node.longitude]
        }
      ]
    };
  }

  // Build bidirectional adjacency graph
  const adjacency = new Map<string, { targetId: string; distance: number; edge: PathEdge }[]>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    if (accessibleOnly && !edge.isAccessible) continue;
    if (edge.isRestricted) continue;

    // Both directions for walkable paths
    adjacency.get(edge.startNodeId)?.push({
      targetId: edge.endNodeId,
      distance: edge.distance,
      edge
    });
    adjacency.get(edge.endNodeId)?.push({
      targetId: edge.startNodeId,
      distance: edge.distance,
      edge
    });
  }

  // Priority queue tracking
  const distances = new Map<string, number>();
  const previous = new Map<string, { prevNodeId: string; edge: PathEdge } | null>();
  const unvisited = new Set<string>();

  for (const node of nodes) {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
    unvisited.add(node.id);
  }

  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    // Find unvisited node with lowest distance
    let currentId: string | null = null;
    let lowestDist = Infinity;

    for (const id of unvisited) {
      const d = distances.get(id) ?? Infinity;
      if (d < lowestDist) {
        lowestDist = d;
        currentId = id;
      }
    }

    if (!currentId || lowestDist === Infinity) break;
    if (currentId === targetNodeId) break;

    unvisited.delete(currentId);

    const neighbors = adjacency.get(currentId) || [];
    for (const { targetId, distance, edge } of neighbors) {
      if (!unvisited.has(targetId)) continue;

      const alt = lowestDist + distance;
      if (alt < (distances.get(targetId) ?? Infinity)) {
        distances.set(targetId, alt);
        previous.set(targetId, { prevNodeId: currentId, edge });
      }
    }
  }

  // Backtrack path
  const pathNodeIds: string[] = [];
  let curr: string | null = targetNodeId;

  if (distances.get(targetNodeId) === Infinity) {
    return null; // No route found
  }

  while (curr) {
    pathNodeIds.unshift(curr);
    const prevInfo = previous.get(curr);
    curr = prevInfo ? prevInfo.prevNodeId : null;
  }

  const pathNodes: PathNode[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  for (const id of pathNodeIds) {
    const node = nodeMap.get(id);
    if (node) pathNodes.push(node);
  }

  const coordinates: [number, number][] = pathNodes.map(n => [n.latitude, n.longitude]);
  const totalDistance = Math.round(distances.get(targetNodeId) || 0);
  const estimatedSeconds = Math.round(totalDistance / walkingSpeed);

  // Generate step-by-step turn instructions
  const steps: DirectionStep[] = generateDirectionSteps(pathNodes);

  return {
    pathNodes,
    coordinates,
    totalDistanceMeters: totalDistance,
    estimatedTimeSeconds: estimatedSeconds,
    steps
  };
}

/**
 * Generate human-friendly turn-by-turn guidance from path nodes
 */
function generateDirectionSteps(nodes: PathNode[]): DirectionStep[] {
  if (nodes.length === 0) return [];
  if (nodes.length === 1) {
    return [
      {
        instruction: `You are at ${nodes[0].name}.`,
        distanceMeters: 0,
        action: 'arrive',
        coordinate: [nodes[0].latitude, nodes[0].longitude]
      }
    ];
  }

  const steps: DirectionStep[] = [];

  // Initial step
  const firstDist = Math.round(
    calculateHaversineDistance(
      nodes[0].latitude,
      nodes[0].longitude,
      nodes[1].latitude,
      nodes[1].longitude
    )
  );

  steps.push({
    instruction: `Start from ${nodes[0].name} and head towards ${nodes[1].name}.`,
    distanceMeters: firstDist,
    action: 'start',
    targetLocationName: nodes[1].name,
    coordinate: [nodes[0].latitude, nodes[0].longitude]
  });

  // Intermediate turns
  for (let i = 1; i < nodes.length - 1; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    const next = nodes[i + 1];

    const bearing1 = calculateBearing(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
    const bearing2 = calculateBearing(curr.latitude, curr.longitude, next.latitude, next.longitude);

    let diff = bearing2 - bearing1;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;

    let action: DirectionStep['action'] = 'straight';
    let maneuverText = 'Continue straight';

    if (diff > 45 && diff <= 135) {
      action = 'turn-right';
      maneuverText = 'Turn right';
    } else if (diff > 135) {
      action = 'turn-right';
      maneuverText = 'Make a sharp right';
    } else if (diff < -45 && diff >= -135) {
      action = 'turn-left';
      maneuverText = 'Turn left';
    } else if (diff < -135) {
      action = 'turn-left';
      maneuverText = 'Make a sharp left';
    } else if (diff > 15) {
      action = 'slight-right';
      maneuverText = 'Bear slightly right';
    } else if (diff < -15) {
      action = 'slight-left';
      maneuverText = 'Bear slightly left';
    }

    const distToNext = Math.round(
      calculateHaversineDistance(curr.latitude, curr.longitude, next.latitude, next.longitude)
    );

    steps.push({
      instruction: `${maneuverText} past ${curr.name} toward ${next.name} (${distToNext}m).`,
      distanceMeters: distToNext,
      action,
      targetLocationName: next.name,
      coordinate: [curr.latitude, curr.longitude]
    });
  }

  // Arrival step
  const destNode = nodes[nodes.length - 1];
  steps.push({
    instruction: `Arrive at ${destNode.name}. Destination will be ahead.`,
    distanceMeters: 0,
    action: 'arrive',
    targetLocationName: destNode.name,
    coordinate: [destNode.latitude, destNode.longitude]
  });

  return steps;
}
