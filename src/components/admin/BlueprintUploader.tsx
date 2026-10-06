import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Upload, Image, MapPin, Check, Loader2, Trash2, RotateCcw, Maximize, Minimize, Download, AlertCircle } from 'lucide-react';
import { CampusBuilding } from '../../types';
import { getSupabaseClient, isSupabaseConfigured } from '../../services/supabase';

interface BlueprintUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: CampusBuilding[];
  onBlueprintSaved: (buildingId: string, blueprintData: {
    url: string;
    bounds: { north: number; south: number; east: number; west: number };
    floor: string;
    opacity: number;
  }) => Promise<void>;
}

export const BlueprintUploader: React.FC<BlueprintUploaderProps> = ({
  isOpen,
  onClose,
  buildings,
  onBlueprintSaved
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [floor, setFloor] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Map positioning state
  const [positioningMode, setPositioningMode] = useState(false);
  const [bounds, setBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [opacity, setOpacity] = useState(0.7);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const imageOverlayRef = useRef<any>(null);
  const cornerMarkersRef = useRef<any[]>([]);

  // Initialize positioning map
  useEffect(() => {
    if (!positioningMode || !mapContainerRef.current || mapInstanceRef.current) return;

    // Dynamic import of Leaflet
    import('leaflet').then(L => {
      // Fix Leaflet's default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const building = buildings.find(b => b.id === selectedBuilding);
      const center = building ? [building.latitude, building.longitude] : [10.02835, 76.59715];

      const map = L.map(mapContainerRef.current!, {
        center: center,
        zoom: 19,
        minZoom: 15,
        maxZoom: 22,
        zoomControl: false,
        attributionControl: false
      });

      mapInstanceRef.current = map;

      // Add satellite tile layer
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 22,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }).addTo(map);

      // If we have existing bounds, show the overlay
      if (bounds && imagePreview) {
        addImageOverlay(map, imagePreview, bounds);
      }

      // Add corner markers for adjustment
      addCornerMarkers(map);

      map.on('click', (e: any) => {
        if (!positioningMode) return;
        // Add first corner if no bounds yet
        if (!bounds) {
          setBounds({
            north: e.latlng.lat,
            south: e.latlng.lat,
            east: e.latlng.lng,
            west: e.latlng.lng
          });
        }
      });

      return () => {
        map.remove();
        mapInstanceRef.current = null;
      };
    });
  }, [positioningMode, selectedBuilding, bounds, imagePreview, buildings]);

  const addImageOverlay = (map: any, url: string, bounds: { north: number; south: number; east: number; west: number }) => {
    if (imageOverlayRef.current) {
      map.removeLayer(imageOverlayRef.current);
    }
    imageOverlayRef.current = L.imageOverlay(url, [
      [bounds.north, bounds.west],
      [bounds.south, bounds.east]
    ], {
      opacity: opacity,
      interactive: false
    }).addTo(map);
  };

  const addCornerMarkers = (map: any) => {
    // Clear existing markers
    cornerMarkersRef.current.forEach(m => map.removeLayer(m));
    cornerMarkersRef.current = [];

    if (!bounds) return;

    const corners = [
      { name: 'NW', lat: bounds.north, lng: bounds.west },
      { name: 'NE', lat: bounds.north, lng: bounds.east },
      { name: 'SW', lat: bounds.south, lng: bounds.west },
      { name: 'SE', lat: bounds.south, lng: bounds.east }
    ];

    corners.forEach(corner => {
      const marker = L.marker([corner.lat, corner.lng], {
        draggable: true,
        icon: L.divIcon({
          className: 'blueprint-corner-marker',
          html: `<div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">${corner.name}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(map);

      marker.on('drag', (e: any) => {
        const latlng = e.target.getLatLng();
        updateBoundsFromCorner(corner.name, latlng.lat, latlng.lng);
      });

      cornerMarkersRef.current.push(marker);
    });

    // Update overlay bounds when corners move
    if (imageOverlayRef.current && imagePreview) {
      imageOverlayRef.current.setBounds([
        [bounds.north, bounds.west],
        [bounds.south, bounds.east]
      ]);
    }
  };

  const updateBoundsFromCorner = (corner: string, lat: number, lng: number) => {
    setBounds(prev => {
      if (!prev) return null;
      const newBounds = { ...prev };
      switch (corner) {
        case 'NW':
          newBounds.north = lat;
          newBounds.west = lng;
          break;
        case 'NE':
          newBounds.north = lat;
          newBounds.east = lng;
          break;
        case 'SW':
          newBounds.south = lat;
          newBounds.west = lng;
          break;
        case 'SE':
          newBounds.south = lat;
          newBounds.east = lng;
          break;
      }
      // Ensure correct ordering
      if (newBounds.north < newBounds.south) {
        [newBounds.north, newBounds.south] = [newBounds.south, newBounds.north];
      }
      if (newBounds.east < newBounds.west) {
        [newBounds.east, newBounds.west] = [newBounds.west, newBounds.east];
      }
      return newBounds;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setError('Please select a JPEG, PNG, or WebP image');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setImageFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setBounds(null);
    setPositioningMode(false);
  };

  const startPositioning = () => {
    if (!imagePreview) {
      setError('Please select an image first');
      return;
    }
    if (!selectedBuilding) {
      setError('Please select a building');
      return;
    }
    setPositioningMode(true);
    setError(null);
  };

  const exitPositioning = () => {
    setPositioningMode(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  };

  const handleUpload = async () => {
    if (!imageFile || !selectedBuilding || !bounds || !floor) {
      setError('Please complete all fields and position the blueprint on the map');
      return;
    }

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Cannot upload blueprint.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const client = getSupabaseClient();

      // Upload to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${selectedBuilding}/${floor}/${Date.now()}.${fileExt}`;
      const filePath = `blueprints/${fileName}`;

      const { error: uploadError } = await client.storage
        .from('blueprints')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = client.storage
        .from('blueprints')
        .getPublicUrl(filePath);

      // Save blueprint data to building
      await onBlueprintSaved(selectedBuilding, {
        url: publicUrl,
        bounds,
        floor,
        opacity
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to upload blueprint');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedBuilding('');
    setFloor('');
    removeImage();
    setSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Upload Floor Plan Blueprint</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Upload and position building floor plans on the campus map</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form / Positioning View */}
        <div className="flex-1 overflow-y-auto p-5">
          {success ? (
            // Success State
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Blueprint Uploaded!</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">The floor plan has been positioned and saved to the building.</p>
              <button
                onClick={resetForm}
                className="px-6 py-2.5 bg-campus-600 hover:bg-campus-700 text-white rounded-xl font-semibold flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Upload Another</span>
              </button>
            </div>
          ) : positioningMode ? (
            // Positioning Mode - Full Screen Map
            <div className="h-[60vh] relative">
              <div className="absolute top-3 left-3 right-3 z-10 flex justify-between">
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">Position the blueprint by dragging the corner markers</p>
                  <p className="text-[10px] text-gray-500 mt-1">NW ── NE &nbsp;&nbsp;|&nbsp;&nbsp; SW ── SE</p>
                </div>
                <button
                  onClick={exitPositioning}
                  className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg p-2 border border-gray-200 dark:border-gray-700 text-gray-600 hover:text-red-600"
                  title="Exit positioning"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div ref={mapContainerRef} className="w-full h-full rounded-xl overflow-hidden" />

              {/* Controls at bottom */}
              <div className="absolute bottom-3 left-3 right-3 z-10 flex justify-center gap-3">
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Opacity</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={opacity}
                      onChange={(e) => setOpacity(parseFloat(e.target.value))}
                      className="w-32 accent-campus-600"
                    />
                    <span className="text-xs text-gray-500 w-8">{Math.round(opacity * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="absolute bottom-20 left-3 right-3 z-10 flex justify-center">
                <button
                  onClick={handleUpload}
                  disabled={uploading || !bounds}
                  className="px-6 py-3 bg-campus-600 hover:bg-campus-700 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Blueprint...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Blueprint Position</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Form Mode
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); startPositioning(); }}>
              {/* Building Select */}
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  Building / Block *
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${
                    error && !selectedBuilding ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
                  } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none`}
                >
                  <option value="">Select a building</option>
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              {/* Floor */}
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  Floor *
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${
                    error && !floor ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
                  } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none`}
                  placeholder="e.g. Ground Floor, 1st Floor, 2nd Floor"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  Floor Plan Image *
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="sr-only"
                    id="blueprint-upload"
                    disabled={uploading}
                  />
                  {imagePreview ? (
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Blueprint preview"
                        className="w-full max-h-64 object-contain rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="blueprint-upload"
                      className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-center cursor-pointer hover:border-campus-400 dark:hover:border-campus-600 transition-colors bg-gray-50 dark:bg-gray-700/40"
                    >
                      <Upload className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">Click to upload floor plan image</p>
                      <p className="text-xs text-gray-400 mt-1">JPEG, PNG, or WebP • Max 10MB</p>
                    </label>
                  )}
                </div>
                {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
              </div>

              {/* Instructions */}
              {!imagePreview && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                  <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                    <strong>Steps:</strong> 1) Select building & floor → 2) Upload floor plan image → 3) Click "Position on Map" → 4) Drag 4 corner markers to align with building footprint → 5) Save
                  </p>
                </div>
              )}

              {/* Position on Map Button */}
              {imagePreview && (
                <button
                  type="button"
                  onClick={startPositioning}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                  <span>Position on Map & Align Corners</span>
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};