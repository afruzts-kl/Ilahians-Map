import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { X, MapPin, Edit3, Trash2, Check, Minus, Plus, RotateCcw } from 'lucide-react';

// Fix Leaflet's default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface DrawnArea {
  id: string;
  type: 'polygon' | 'rectangle';
  coordinates: L.LatLngExpression[];
  centroid: L.LatLngExpression;
  name?: string;
}

interface MapDrawToolProps {
  map: L.Map | null;
  isActive: boolean;
  onAreaDrawn: (area: DrawnArea) => void;
  onAreaDeleted: (areaId: string) => void;
  existingAreas: DrawnArea[];
  onClose: () => void;
}

export const MapDrawTool: React.FC<MapDrawToolProps> = ({
  map,
  isActive,
  onAreaDrawn,
  onAreaDeleted,
  existingAreas,
  onClose
}) => {
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const [drawMode, setDrawMode] = useState<'polygon' | 'rectangle' | null>(null);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);

  // Initialize draw control when map is available
  useEffect(() => {
    if (!map || drawControlRef.current) return;

    // Create feature group for drawn items
    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);

    // Add existing areas to the map
    existingAreas.forEach(area => {
      const layer = createAreaLayer(area);
      drawnItems.addLayer(layer);
    });

    // Initialize Leaflet Draw control
    const drawControl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: '#16a34a',
            weight: 2,
            opacity: 0.8,
            fillColor: '#22c55e',
            fillOpacity: 0.2
          },
          metric: true,
          feet: false
        },
        rectangle: {
          shapeOptions: {
            color: '#16a34a',
            weight: 2,
            opacity: 0.8,
            fillColor: '#22c55e',
            fillOpacity: 0.2
          },
          metric: true
        },
        circle: false,
        marker: false,
        circlemarker: false,
        polyline: false
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
        edit: {
          selectedPathOptions: {
            color: '#2563eb',
            weight: 2,
            opacity: 0.9,
            fillColor: '#3b82f6',
            fillOpacity: 0.3
          }
        }
      }
    });

    map.addControl(drawControl);
    drawControlRef.current = drawControl;

    // Event handlers
    const handleDrawCreated = (e: L.DrawEvents.Created) => {
      const layer = e.layer;
      const area = layerToArea(layer);
      if (area) {
        drawnItems.addLayer(layer);
        onAreaDrawn(area);
      }
      // Exit draw mode after creation
      setDrawMode(null);
    };

    const handleDrawEdited = (e: L.DrawEvents.Edited) => {
      const layers = e.layers;
      layers.eachLayer((layer: any) => {
        if (layer._areaId) {
          const area = layerToArea(layer);
          if (area) {
            area.id = layer._areaId;
            onAreaDrawn(area); // Re-use onAreaDrawn for updates
          }
        }
      });
    };

    const handleDrawDeleted = (e: L.DrawEvents.Deleted) => {
      const layers = e.layers;
      layers.eachLayer((layer: any) => {
        if (layer._areaId) {
          onAreaDeleted(layer._areaId);
        }
      });
    };

    map.on(L.Draw.Event.CREATED, handleDrawCreated);
    map.on(L.Draw.Event.EDITED, handleDrawEdited);
    map.on(L.Draw.Event.DELETED, handleDrawDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, handleDrawCreated);
      map.off(L.Draw.Event.EDITED, handleDrawEdited);
      map.off(L.Draw.Event.DELETED, handleDrawDeleted);
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }
      if (drawnItemsRef.current) {
        map.removeLayer(drawnItemsRef.current);
        drawnItemsRef.current = null;
      }
    };
  }, [map, existingAreas, onAreaDrawn, onAreaDeleted]);

  // Sync existing areas when they change
  useEffect(() => {
    if (!drawnItemsRef.current || !map) return;
    drawnItemsRef.current.clearLayers();
    existingAreas.forEach(area => {
      const layer = createAreaLayer(area);
      drawnItemsRef.current?.addLayer(layer);
    });
  }, [existingAreas, map]);

  const createAreaLayer = (area: DrawnArea): L.Layer => {
    let layer: L.Polygon | L.Rectangle;
    if (area.type === 'rectangle' && area.coordinates.length === 2) {
      layer = L.rectangle(area.coordinates as L.LatLngBoundsExpression, {
        color: '#16a34a',
        weight: 2,
        opacity: 0.8,
        fillColor: '#22c55e',
        fillOpacity: 0.2
      });
    } else {
      layer = L.polygon(area.coordinates as L.LatLngExpression[], {
        color: '#16a34a',
        weight: 2,
        opacity: 0.8,
        fillColor: '#22c55e',
        fillOpacity: 0.2
      });
    }
    // Store area ID on layer for identification
    (layer as any)._areaId = area.id;
    return layer;
  };

  const layerToArea = (layer: L.Layer): DrawnArea | null => {
    let coordinates: L.LatLngExpression[] = [];
    let type: 'polygon' | 'rectangle' = 'polygon';

    if (layer instanceof L.Polygon) {
      const latLngs = layer.getLatLngs();
      if (latLngs.length > 0 && Array.isArray(latLngs[0])) {
        // Polygon with holes - take outer ring
        coordinates = latLngs[0] as L.LatLngExpression[];
      } else {
        coordinates = latLngs as L.LatLngExpression[];
      }
      type = 'polygon';
    } else if (layer instanceof L.Rectangle) {
      const bounds = layer.getBounds();
      coordinates = [
        [bounds.getNorthWest().lat, bounds.getNorthWest().lng],
        [bounds.getSouthEast().lat, bounds.getSouthEast().lng]
      ];
      type = 'rectangle';
    } else {
      return null;
    }

    // Calculate centroid
    const centroid = calculateCentroid(coordinates);

    return {
      id: `area-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      coordinates,
      centroid
    };
  };

  const calculateCentroid = (coords: L.LatLngExpression[]): L.LatLngExpression => {
    if (coords.length === 0) return [0, 0];
    if (coords.length === 1) return coords[0];

    let latSum = 0, lngSum = 0;
    coords.forEach(([lat, lng]) => {
      latSum += lat;
      lngSum += lng;
    });
    return [latSum / coords.length, lngSum / coords.length];
  };

  const startDrawing = (mode: 'polygon' | 'rectangle') => {
    if (!map || !drawControlRef.current) return;

    setDrawMode(mode);

    // Activate the appropriate draw tool
    if (mode === 'polygon') {
      (drawControlRef.current as any)._toolbars.draw._modes.polygon.handler.enable();
    } else if (mode === 'rectangle') {
      (drawControlRef.current as any)._toolbars.draw._modes.rectangle.handler.enable();
    }
  };

  const cancelDrawing = () => {
    if (!map || !drawControlRef.current) return;

    // Disable all draw handlers
    const drawToolbar = (drawControlRef.current as any)._toolbars.draw;
    if (drawToolbar) {
      Object.values(drawToolbar._modes).forEach((mode: any) => {
        if (mode.handler && mode.handler.disable) {
          mode.handler.disable();
        }
      });
    }
    setDrawMode(null);
  };

  const deleteArea = (areaId: string) => {
    if (!drawnItemsRef.current) return;
    drawnItemsRef.current.eachLayer((layer: any) => {
      if (layer._areaId === areaId) {
        drawnItemsRef.current?.removeLayer(layer);
        onAreaDeleted(areaId);
      }
    });
  };

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:top-20 md:w-72 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-campus-600" />
            Draw POI Area
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawing Tools */}
        <div className="p-4 space-y-3">
          {/* Polygon Tool */}
          <button
            onClick={() => startDrawing('polygon')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              drawMode === 'polygon'
                ? 'bg-campus-50 dark:bg-campus-950/40 border-campus-500'
                : 'bg-gray-50 dark:bg-gray-700/40 border-gray-200 dark:border-gray-700 hover:border-campus-300 dark:hover:border-campus-700'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-campus-100 dark:bg-campus-950/60 flex items-center justify-center">
              <svg className="w-5 h-5 text-campus-600 dark:text-campus-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm text-gray-900 dark:text-white">Draw Polygon</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Click to add vertices, click first point to close</p>
            </div>
            {drawMode === 'polygon' && <Check className="w-5 h-5 text-campus-600" />}
          </button>

          {/* Rectangle Tool */}
          <button
            onClick={() => startDrawing('rectangle')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              drawMode === 'rectangle'
                ? 'bg-campus-50 dark:bg-campus-950/40 border-campus-500'
                : 'bg-gray-50 dark:bg-gray-700/40 border-gray-200 dark:border-gray-700 hover:border-campus-300 dark:hover:border-campus-700'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm text-gray-900 dark:text-white">Draw Rectangle</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Click and drag to create rectangular area</p>
            </div>
            {drawMode === 'rectangle' && <Check className="w-5 h-5 text-blue-600" />}
          </button>

          {/* Cancel Button */}
          {drawMode && (
            <button
              onClick={cancelDrawing}
              className="w-full py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Cancel Drawing</span>
            </button>
          )}

          {/* Existing Areas List */}
          {existingAreas.length > 0 && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Drawn Areas ({existingAreas.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {existingAreas.map((area, index) => (
                  <div key={area.id} className="p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-campus-100 dark:bg-campus-950/60 flex items-center justify-center text-campus-600 dark:text-campus-400 text-xs font-bold shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-xs text-gray-900 dark:text-white truncate">
                          {area.name || `${area.type.charAt(0).toUpperCase() + area.type.slice(1)} Area`}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {area.type} • {area.coordinates.length} pts • Centroid: {area.centroid[0].toFixed(5)}, {area.centroid[1].toFixed(5)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteArea(area.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Delete area"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!drawMode && existingAreas.length === 0 && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border-blue-100 dark:border-blue-900/50">
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                Select a drawing tool above, then click on the map to draw a POI area.
                Polygon: click multiple points to create a custom shape.
                Rectangle: click and drag to create a rectangular area.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};