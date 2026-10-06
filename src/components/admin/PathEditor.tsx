import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { X, Plus, Trash2, Check, AlertCircle, CheckCircle, GitFork, RotateCcw, Eye, Edit3, Download, Upload, Link, Unlink } from 'lucide-react';
import { PathNode, PathEdge } from '../../types';
import { locationService } from '../../services/locationService';

// Fix Leaflet's default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface PathEditorProps {
  map: L.Map | null;
  isActive: boolean;
  nodes: PathNode[];
  edges: PathEdge[];
  onNodeAdded: (node: PathNode) => Promise<void>;
  onNodeUpdated: (node: PathNode) => Promise<void>;
  onNodeDeleted: (nodeId: string) => Promise<void>;
  onEdgeAdded: (edge: PathEdge) => Promise<void>;
  onEdgeUpdated: (edge: PathEdge) => Promise<void>;
  onEdgeDeleted: (edgeId: string) => Promise<void>;
  onClose: () => void;
  onValidateGraph: () => Promise<{ connected: boolean; components: number; issues: string[] }>;
}

export const PathEditor: React.FC<PathEditorProps> = ({
  map,
  isActive,
  nodes,
  edges,
  onNodeAdded,
  onNodeUpdated,
  onNodeDeleted,
  onEdgeAdded,
  onEdgeUpdated,
  onEdgeDeleted,
  onClose,
  onValidateGraph
}) => {
  const drawControlRef = useRef<any>(null);
  const drawnItemsRef = useRef<any>(null);
  const nodeMarkersRef = useRef<Map<string, any>>(new Map());
  const edgeLinesRef = useRef<Map<string, any>>(new Map());
  const [mode, setMode] = useState<'view' | 'addNode' | 'addEdge' | 'edit'>('view');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [edgeStartNode, setEdgeStartNode] = useState<PathNode | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ connected: boolean; components: number; issues: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize when map is available
  useEffect(() => {
    if (!map || drawnItemsRef.current) return;

    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);

    // Render existing nodes
    nodes.forEach(node => {
      addNodeMarker(node);
    });

    // Render existing edges
    edges.forEach(edge => {
      addEdgeLine(edge);
    });

    return () => {
      // Cleanup markers and lines
      nodeMarkersRef.current.forEach(marker => map.removeLayer(marker));
      edgeLinesRef.current.forEach(line => map.removeLayer(line));
      nodeMarkersRef.current.clear();
      edgeLinesRef.current.clear();
      if (drawnItemsRef.current) {
        map.removeLayer(drawnItemsRef.current);
        drawnItemsRef.current = null;
      }
    };
  }, [map, nodes, edges]);

  // Sync nodes when they change
  useEffect(() => {
    if (!map) return;
    const currentNodeIds = new Set(nodes.map(n => n.id));
    const markerIds = new Set(nodeMarkersRef.current.keys());

    // Remove deleted nodes
    markerIds.forEach(id => {
      if (!currentNodeIds.has(id)) {
        const marker = nodeMarkersRef.current.get(id);
        if (marker) map.removeLayer(marker);
        nodeMarkersRef.current.delete(id);
      }
    });

    // Add new nodes
    nodes.forEach(node => {
      if (!nodeMarkersRef.current.has(node.id)) {
        addNodeMarker(node);
      } else {
        // Update position if changed
        const marker = nodeMarkersRef.current.get(node.id);
        marker.setLatLng([node.latitude, node.longitude]);
      }
    });
  }, [nodes, map]);

  // Sync edges when they change
  useEffect(() => {
    if (!map) return;
    const currentEdgeIds = new Set(edges.map(e => e.id));
    const lineIds = new Set(edgeLinesRef.current.keys());

    // Remove deleted edges
    lineIds.forEach(id => {
      if (!currentEdgeIds.has(id)) {
        const line = edgeLinesRef.current.get(id);
        if (line) map.removeLayer(line);
        edgeLinesRef.current.delete(id);
      }
    });

    // Add new edges
    edges.forEach(edge => {
      if (!edgeLinesRef.current.has(edge.id)) {
        addEdgeLine(edge);
      }
    });
  }, [edges, map, nodes]);

  const addNodeMarker = (node: PathNode) => {
    if (!map) return;

    const isAccessible = node.isAccessible !== false;
    const marker = L.marker([node.latitude, node.longitude], {
      draggable: mode === 'edit',
      icon: L.divIcon({
        className: 'path-node-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-6 h-6 rounded-full border-3 shadow-lg ${
              isAccessible
                ? 'bg-emerald-500 border-white'
                : 'bg-amber-500 border-white'
            }"></div>
            <span class="absolute -top-2 -right-2 text-[8px] font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full w-5 h-5 flex items-center justify-center border border-gray-200">
              ${node.name?.charAt(0) || 'N'}
            </span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      }),
      zIndexOffset: 1000
    });

    marker.bindTooltip(`
      <div class="p-1 font-medium text-xs">
        <div class="font-bold text-gray-900 dark:text-gray-100">${node.name || `Node ${node.id.slice(0, 8)}`}</div>
        <div class="text-[10px] text-gray-500">${node.type || 'junction'} • ${isAccessible ? 'Accessible' : 'Stairs/Restricted'}</div>
      </div>
    `, { offset: [0, -14], direction: 'top', className: 'custom-leaflet-tooltip' });

    marker.on('click', () => {
      if (mode === 'addEdge') {
        handleEdgeNodeClick(node);
      } else if (mode === 'edit') {
        setSelectedNodeId(node.id);
      }
    });

    marker.on('dragend', async (e: any) => {
      const latlng = e.target.getLatLng();
      const updatedNode = { ...node, latitude: latlng.lat, longitude: latlng.lng };
      await onNodeUpdated(updatedNode);
    });

    marker.addTo(map);
    nodeMarkersRef.current.set(node.id, marker);
  };

  const addEdgeLine = (edge: PathEdge) => {
    if (!map) return;

    const startNode = nodes.find(n => n.id === edge.startNodeId);
    const endNode = nodes.find(n => n.id === edge.endNodeId);

    if (!startNode || !endNode) return;

    const isAccessible = edge.isAccessible !== false;
    const isRestricted = edge.isRestricted === true;
    const hasStairs = edge.hasStairs === true;

    let color = '#16a34a';
    let dashArray = undefined;
    if (isRestricted) color = '#ef4444';
    else if (!isAccessible || hasStairs) color = '#f59e0b';
    if (edge.isOneWay) dashArray = '8, 4';

    const line = L.polyline([
      [startNode.latitude, startNode.longitude],
      [endNode.latitude, endNode.longitude]
    ], {
      color,
      weight: 3,
      opacity: 0.9,
      dashArray,
      lineCap: 'round',
      lineJoin: 'round'
    });

    // Add arrow for one-way edges
    if (edge.isOneWay) {
      const midPoint = line.getBounds().getCenter();
      // Arrow decoration would go here
    }

    line.bindTooltip(`
      <div class="p-1 font-medium text-xs">
        <div class="font-bold text-gray-900 dark:text-gray-100">${edge.description || `${startNode.name} → ${endNode.name}`}</div>
        <div class="text-[10px] text-gray-500">${edge.distance}m • ${isAccessible ? 'Accessible' : 'Not Accessible'}${isRestricted ? ' • Restricted' : ''}${hasStairs ? ' • Stairs' : ''}${edge.isOneWay ? ' • One-way' : ''}</div>
      </div>
    `, { offset: [0, -10], direction: 'top', className: 'custom-leaflet-tooltip', sticky: true });

    line.on('click', () => {
      if (mode === 'edit') {
        // Could show edge edit dialog
      }
    });

    line.addTo(map);
    edgeLinesRef.current.set(edge.id, line);
  };

  const handleEdgeNodeClick = (node: PathNode) => {
    if (!edgeStartNode) {
      setEdgeStartNode(node);
    } else if (edgeStartNode.id === node.id) {
      // Clicked same node, cancel
      setEdgeStartNode(null);
    } else {
      // Create edge
      const distance = calculateDistance(edgeStartNode, node);
      const newEdge: PathEdge = {
        id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startNodeId: edgeStartNode.id,
        endNodeId: node.id,
        distance: Math.round(distance),
        isAccessible: true,
        isRestricted: false,
        hasStairs: false,
        surfaceType: 'paved',
        description: `${edgeStartNode.name} → ${node.name}`
      };
      onEdgeAdded(newEdge);
      setEdgeStartNode(null);
      setMode('view');
    }
  };

  const calculateDistance = (node1: PathNode, node2: PathNode): number => {
    const R = 6371000; // Earth radius in meters
    const lat1 = node1.latitude * Math.PI / 180;
    const lat2 = node2.latitude * Math.PI / 180;
    const dLat = (node2.latitude - node1.latitude) * Math.PI / 180;
    const dLon = (node2.longitude - node1.longitude) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleMapClick = (e: any) => {
    if (mode !== 'addNode') return;

    const newNode: PathNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Node ${nodes.length + 1}`,
      latitude: e.latlng.lat,
      longitude: e.latlng.lng,
      isAccessible: true,
      type: 'junction'
    };
    onNodeAdded(newNode);
    setMode('view');
  };

  const startAddNode = () => {
    setMode('addNode');
    setEdgeStartNode(null);
    setSelectedNodeId(null);
    map?.on('click', handleMapClick);
  };

  const startAddEdge = () => {
    setMode('addEdge');
    setEdgeStartNode(null);
    setSelectedNodeId(null);
    map?.off('click', handleMapClick);
  };

  const startEditMode = () => {
    setMode('edit');
    setEdgeStartNode(null);
    setSelectedNodeId(null);
    map?.off('click', handleMapClick);

    // Enable dragging on all markers
    nodeMarkersRef.current.forEach(marker => {
      marker.dragging.enable();
    });
  };

  const exitMode = () => {
    setMode('view');
    setEdgeStartNode(null);
    setSelectedNodeId(null);
    map?.off('click', handleMapClick);

    // Disable dragging on all markers
    nodeMarkersRef.current.forEach(marker => {
      marker.dragging.disable();
    });
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (confirm('Delete this node? This will also remove connected edges.')) {
      await onNodeDeleted(nodeId);
      setSelectedNodeId(null);
    }
  };

  const handleDeleteEdge = async (edgeId: string) => {
    if (confirm('Delete this path segment?')) {
      await onEdgeDeleted(edgeId);
    }
  };

  const handleValidateGraph = async () => {
    setValidating(true);
    setError(null);
    try {
      const result = await onValidateGraph();
      setValidationResult(result);
      if (result.connected) {
        setSuccess('Graph is fully connected! All nodes are reachable.');
      } else {
        setError(`Graph has ${result.components} disconnected components. ${result.issues.join('; ')}`);
      }
    } catch (err: any) {
      setError(err.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:top-20 md:w-80 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <GitFork className="w-4 h-4 text-purple-600" />
            Walking Path Editor
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Toolbar */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-700 space-y-2">
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={mode === 'view' ? exitMode : () => setMode('view')}
              disabled={mode === 'view'}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                mode === 'view'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  : 'bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5 mx-auto mb-0.5" />
              View
            </button>
            <button
              onClick={startAddNode}
              disabled={mode === 'addNode'}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                mode === 'addNode'
                  ? 'bg-campus-50 dark:bg-campus-950/40 border border-campus-500 text-campus-600'
                  : 'bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Plus className="w-3.5 h-3.5 mx-auto mb-0.5" />
              Add Node
            </button>
            <button
              onClick={startAddEdge}
              disabled={mode === 'addEdge' || nodes.length < 2}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                mode === 'addEdge'
                  ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-500 text-purple-600'
                  : nodes.length < 2
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Link className="w-3.5 h-3.5 mx-auto mb-0.5" />
              Add Edge
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1 mt-1">
            <button
              onClick={startEditMode}
              disabled={mode === 'edit'}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                mode === 'edit'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-500 text-blue-600'
                  : 'bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 mx-auto mb-0.5" />
              Edit/Move
            </button>
            <button
              onClick={handleValidateGraph}
              disabled={validating}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                validating
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Check className="w-3.5 h-3.5 mx-auto mb-0.5" />
              Validate
            </button>
          </div>
        </div>

        {/* Status & Stats */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-500 dark:text-gray-400">Mode: </span>
            <span className="font-semibold text-gray-900 dark:text-white capitalize">{mode}</span>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <GitFork className="w-3 h-3" /> {nodes.length} nodes
            </span>
            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Link className="w-3 h-3" /> {edges.length} edges
            </span>
          </div>

          {/* Edge Creation Helper */}
          {mode === 'addEdge' && edgeStartNode && (
            <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl">
              <p className="text-xs text-purple-800 dark:text-purple-300">
                Start: <span className="font-semibold">{edgeStartNode.name}</span>
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-400">Click another node to create edge</p>
            </div>
          )}

          {mode === 'addNode' && (
            <div className="mt-2 p-2 bg-campus-50 dark:bg-campus-950/40 border border-campus-200 dark:border-campus-800 rounded-xl">
              <p className="text-xs text-campus-800 dark:text-campus-300">Click on map to add new node</p>
            </div>
          )}

          {mode === 'edit' && selectedNodeId && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                Editing: <span className="font-semibold">{nodes.find(n => n.id === selectedNodeId)?.name}</span>
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">Drag node to move, click to deselect</p>
            </div>
          )}
        </div>

        {/* Validation Result */}
        {validationResult && (
          <div className={`p-3 border ${validationResult.connected ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50' : 'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/50'}`}>
            <div className="flex items-center gap-2 text-xs">
              {validationResult.connected ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              )}
              <span className="font-semibold">
                {validationResult.connected ? 'Fully Connected' : `${validationResult.components} Disconnected Components`}
              </span>
            </div>
            {validationResult.issues.length > 0 && (
              <ul className="mt-2 text-[10px] space-y-1">
                {validationResult.issues.map((issue, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {issue}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-xl text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Node List */}
        <div className="p-3 max-h-64 overflow-y-auto">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-2">Nodes ({nodes.length})</h4>
          {nodes.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">No nodes yet. Click "Add Node" to start.</p>
          ) : (
            <div className="space-y-1">
              {nodes.map(node => (
                <div key={node.id} className={`p-2 rounded-xl flex items-center justify-between gap-2 ${
                  selectedNodeId === node.id ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0 ${node.isAccessible !== false ? 'bg-emerald-500 border-white text-white' : 'bg-amber-500 border-white text-white'}`}>
                      {node.name?.charAt(0) || 'N'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-xs text-gray-900 dark:text-white truncate">{node.name}</p>
                      <p className="text-[10px] text-gray-400">{node.latitude.toFixed(5)}, {node.longitude.toFixed(5)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {mode === 'edit' && (
                      <button
                        onClick={() => setSelectedNodeId(node.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded transition-colors"
                        title="Select to edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNode(node.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                      title="Delete node"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edge List */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-700 max-h-48 overflow-y-auto">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-2">Edges ({edges.length})</h4>
          {edges.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">No edges yet. Click "Add Edge" to connect nodes.</p>
          ) : (
            <div className="space-y-1">
              {edges.map(edge => {
                const startNode = nodes.find(n => n.id === edge.startNodeId);
                const endNode = nodes.find(n => n.id === edge.endNodeId);
                return (
                  <div key={edge.id} className="p-2 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs text-gray-900 dark:text-white truncate">
                          {edge.description || `${startNode?.name} → ${endNode?.name}`}
                        </p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-2">
                          <span>{edge.distance}m</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                            edge.isAccessible ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {edge.isAccessible ? 'Accessible' : 'Stairs/No'}
                          </span>
                          {edge.isRestricted && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-100 text-red-700">Restricted</span>
                          )}
                          {edge.isOneWay && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-100 text-blue-700">One-way</span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteEdge(edge.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors shrink-0"
                        title="Delete edge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex gap-2">
          <button
            onClick={exitMode}
            className="flex-1 py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RotateCcw className="w-3.5 h-3.5 mx-auto" />
            <span className="block">Exit Editor</span>
          </button>
        </div>
      </div>
    </div>
  );
};