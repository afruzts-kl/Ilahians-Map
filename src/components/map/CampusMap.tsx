import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { CampusLocation, CampusBuilding, CalculatedRoute, UserLocationState } from '../../types';
import { CAMPUS_CONFIG, CATEGORY_INFO } from '../../config/campusConfig';
import { Layers, Navigation, Plus, Minus, Compass, MapPin } from 'lucide-react';

// Fix Leaflet's default marker icons path issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface CampusMapProps {
  locations: CampusLocation[];
  buildings: CampusBuilding[];
  selectedLocation: CampusLocation | null;
  userLocation: UserLocationState;
  route: CalculatedRoute | null;
  onSelectLocation: (location: CampusLocation) => void;
  isDark?: boolean;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  locations,
  buildings,
  selectedLocation,
  userLocation,
  route,
  onSelectLocation,
  isDark = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Layers
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const buildingsLayerRef = useRef<L.LayerGroup | null>(null);
  const blueprintsLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  // Map state
  const [activeTileMode, setActiveTileMode] = useState<'street' | 'satellite'>('satellite');

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CAMPUS_CONFIG.center,
      zoom: CAMPUS_CONFIG.defaultZoom,
      minZoom: CAMPUS_CONFIG.minZoom,
      maxZoom: CAMPUS_CONFIG.maxZoom,
      maxBounds: CAMPUS_CONFIG.bounds,
      maxBoundsViscosity: 0.8,
      zoomControl: false, // custom controls
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Layer groups
    buildingsLayerRef.current = L.layerGroup().addTo(map);
    blueprintsLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Initial tile layer: satellite or dark or street
    const initialConfig = activeTileMode === 'satellite'
      ? CAMPUS_CONFIG.tileLayers.satellite
      : isDark
      ? CAMPUS_CONFIG.tileLayers.dark
      : CAMPUS_CONFIG.tileLayers.street;

    const tileLayer = L.tileLayer(initialConfig.url, {
      maxZoom: initialConfig.maxZoom,
      attribution: initialConfig.attribution
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Cleanup on unmount
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle Tile Layer Switch
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const config = activeTileMode === 'satellite'
      ? CAMPUS_CONFIG.tileLayers.satellite
      : isDark
      ? CAMPUS_CONFIG.tileLayers.dark
      : CAMPUS_CONFIG.tileLayers.street;

    const newLayer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      attribution: config.attribution
    }).addTo(mapInstanceRef.current);

    // Ensure it sits at bottom
    newLayer.bringToBack();
    tileLayerRef.current = newLayer;
  }, [activeTileMode, isDark]);

  // 3. Render Building Footprints
  useEffect(() => {
    if (!buildingsLayerRef.current) return;
    buildingsLayerRef.current.clearLayers();

    buildings.forEach(b => {
      if (b.polygon && b.polygon.length > 2) {
        const poly = L.polygon(b.polygon as L.LatLngExpression[], {
          color: '#16a34a',
          weight: 2,
          opacity: 0.8,
          fillColor: '#22c55e',
          fillOpacity: 0.18,
          dashArray: '3, 6'
        });

        poly.bindTooltip(`
          <div class="px-2 py-1 font-semibold text-xs text-gray-900">
            ${b.name}
          </div>
        `, { sticky: true, className: 'custom-leaflet-tooltip' });

        buildingsLayerRef.current?.addLayer(poly);
      }
    });
  }, [buildings]);

  // 3b. Render Blueprint Overlays
  useEffect(() => {
    if (!blueprintsLayerRef.current || !mapInstanceRef.current) return;
    blueprintsLayerRef.current.clearLayers();

    buildings.forEach(b => {
      if (b.blueprint_url && b.blueprint_bounds) {
        const bounds = b.blueprint_bounds;
        const opacity = b.blueprint_opacity ?? 0.7;

        const imageOverlay = L.imageOverlay(b.blueprint_url, [
          [bounds.north, bounds.west],
          [bounds.south, bounds.east]
        ], {
          opacity,
          interactive: false,
          attribution: `${b.name} Floor Plan`
        });

        imageOverlay.bindTooltip(`
          <div class="px-2 py-1 font-semibold text-xs text-gray-900">
            ${b.name} - ${b.blueprint_floor || 'Floor Plan'}
          </div>
        `, { sticky: true, className: 'custom-leaflet-tooltip' });

        blueprintsLayerRef.current?.addLayer(imageOverlay);
      }
    });
  }, [buildings]);

  // 4. Render POI Markers
  useEffect(() => {
    if (!markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    locations.forEach(loc => {
      if (!loc.isActive) return;

      const isSelected = selectedLocation?.id === loc.id;
      const cat = CATEGORY_INFO[loc.category] || CATEGORY_INFO.academic;

      // Icon emoji based on category
      const emojiMap: Record<string, string> = {
        academic: '🏫',
        lab: '🧪',
        library: '📚',
        food: '🍔',
        facility: '🚻',
        sports: '🏟️',
        parking: '🅿️',
        gate: '🚪',
        medical: '🏥',
        admin: '🏢',
        emergency: '🆘'
      };

      const emoji = emojiMap[loc.category] || '📍';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative flex items-center justify-center transition-transform duration-200 ${
            isSelected ? 'scale-125 z-50' : 'hover:scale-110'
          }">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md border-2 ${
              isSelected
                ? 'bg-amber-400 border-white ring-4 ring-amber-400/50'
                : 'bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700'
            }">
              <span>${emoji}</span>
            </div>
            ${
              isSelected
                ? `<div class="absolute -bottom-1 w-2 h-2 bg-amber-500 rotate-45"></div>`
                : ''
            }
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon });

      marker.bindTooltip(`
        <div class="p-1 font-medium text-xs">
          <div class="font-bold text-gray-900 dark:text-gray-100">${loc.name}</div>
          <div class="text-[10px] text-gray-500">${cat.label}</div>
        </div>
      `, { offset: [0, -14], direction: 'top' });

      marker.on('click', () => {
        onSelectLocation(loc);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [locations, selectedLocation, onSelectLocation]);

  // 5. Render User Location & Accuracy Ring
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userLocation.latitude !== null && userLocation.longitude !== null) {
      const userLatLng: L.LatLngExpression = [userLocation.latitude, userLocation.longitude];

      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-60 animate-ping"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-lg"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker(userLatLng, { icon: userIcon, zIndexOffset: 1000 }).addTo(mapInstanceRef.current);
      } else {
        userMarkerRef.current.setLatLng(userLatLng);
      }

      // Accuracy circle
      const accuracy = userLocation.accuracy || 15;
      if (!userCircleRef.current) {
        userCircleRef.current = L.circle(userLatLng, {
          radius: Math.min(accuracy, 40),
          color: '#3b82f6',
          weight: 1,
          opacity: 0.4,
          fillColor: '#60a5fa',
          fillOpacity: 0.12
        }).addTo(mapInstanceRef.current);
      } else {
        userCircleRef.current.setLatLng(userLatLng);
        userCircleRef.current.setRadius(Math.min(accuracy, 40));
      }
    } else {
      if (userMarkerRef.current) {
        mapInstanceRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      if (userCircleRef.current) {
        mapInstanceRef.current.removeLayer(userCircleRef.current);
        userCircleRef.current = null;
      }
    }
  }, [userLocation]);

  // 6. Render Walking Route Polyline
  useEffect(() => {
    if (!routeLayerRef.current) return;
    routeLayerRef.current.clearLayers();

    if (route && route.coordinates && route.coordinates.length > 1) {
      // Background glow polyline
      const glowLine = L.polyline(route.coordinates as L.LatLngExpression[], {
        color: '#16a34a',
        weight: 9,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      });

      // Vibrant foreground dashed route line
      const activeLine = L.polyline(route.coordinates as L.LatLngExpression[], {
        color: '#22c55e',
        weight: 5,
        opacity: 0.95,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round'
      });

      routeLayerRef.current.addLayer(glowLine);
      routeLayerRef.current.addLayer(activeLine);

      // Fit map bounds to show complete route nicely
      if (mapInstanceRef.current) {
        const bounds = L.latLngBounds(route.coordinates as L.LatLngExpression[]);
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [60, 60],
          maxZoom: 19
        });
      }
    }
  }, [route]);

  // 7. Pan to Selected Location
  useEffect(() => {
    if (selectedLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedLocation.latitude, selectedLocation.longitude],
        19,
        { duration: 0.8 }
      );
    }
  }, [selectedLocation]);

  // Map Controls Callbacks
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleRecenter = useCallback(() => {
    if (!mapInstanceRef.current) return;

    if (userLocation.latitude !== null && userLocation.longitude !== null) {
      mapInstanceRef.current.flyTo(
        [userLocation.latitude, userLocation.longitude],
        19,
        { duration: 0.8 }
      );
    } else {
      mapInstanceRef.current.flyTo(CAMPUS_CONFIG.center, CAMPUS_CONFIG.defaultZoom, { duration: 0.8 });
    }
  }, [userLocation]);

  const handleResetNorth = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(CAMPUS_CONFIG.center, CAMPUS_CONFIG.defaultZoom);
  };

  const toggleTileMode = () => {
    setActiveTileMode(prev => (prev === 'satellite' ? 'street' : 'satellite'));
  };

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden">
      {/* Leaflet map container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls - Right Side */}
      <div className="absolute right-3 top-20 z-20 flex flex-col gap-2">
        {/* Layer Switcher (Satellite vs Street) */}
        <button
          onClick={toggleTileMode}
          aria-label="Toggle map view"
          className="p-2.5 rounded-xl bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-200 shadow-floating hover:bg-gray-50 active:scale-95 transition-all border border-gray-200 dark:border-gray-700 flex items-center justify-center"
          title={`Switch to ${activeTileMode === 'satellite' ? 'Street' : 'Satellite'} view`}
        >
          <Layers className="w-5 h-5 text-campus-600 dark:text-campus-400" />
        </button>

        {/* Recenter on User Position */}
        <button
          onClick={handleRecenter}
          aria-label="Center on my location"
          className="p-2.5 rounded-xl bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-200 shadow-floating hover:bg-gray-50 active:scale-95 transition-all border border-gray-200 dark:border-gray-700 flex items-center justify-center"
          title="Center on my location"
        >
          <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </button>

        {/* Reset View / North */}
        <button
          onClick={handleResetNorth}
          aria-label="Reset campus view"
          className="p-2.5 rounded-xl bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-200 shadow-floating hover:bg-gray-50 active:scale-95 transition-all border border-gray-200 dark:border-gray-700 flex items-center justify-center"
          title="Reset to Campus View"
        >
          <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </button>

        {/* Zoom In & Out */}
        <div className="flex flex-col rounded-xl bg-white/95 dark:bg-gray-800/95 shadow-floating border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 active:scale-95 transition-colors border-b border-gray-100 dark:border-gray-700 flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 active:scale-95 transition-colors flex items-center justify-center"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Satellite badge overlay */}
      <div className="absolute left-3 top-20 z-10 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-sm shadow-sm border border-white/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          {activeTileMode === 'satellite' ? 'Satellite View' : 'Map View'}
        </span>
      </div>
    </div>
  );
};
