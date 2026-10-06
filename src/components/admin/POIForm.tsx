import React, { useState, useEffect } from 'react';
import { X, MapPin, Building, Save, Loader2, AlertCircle, CheckCircle, Globe, FileText, Layers } from 'lucide-react';
import { CampusLocation, LocationCategory, CampusBuilding } from '../../types';
import { CATEGORY_INFO } from '../../config/campusConfig';

interface POIFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingLocation: Partial<CampusLocation> | null;
  buildings: CampusBuilding[];
  onSave: (location: Partial<CampusLocation>) => Promise<void>;
  drawnArea?: {
    coordinates: any[];
    centroid: [number, number];
  } | null;
  existingLocations: CampusLocation[];
}

export const POIForm: React.FC<POIFormProps> = ({
  isOpen,
  onClose,
  editingLocation,
  buildings,
  onSave,
  drawnArea,
  existingLocations
}) => {
  const [formData, setFormData] = useState<Partial<CampusLocation>>({
    id: '',
    name: '',
    name_ml: '',
    category: 'academic',
    description: '',
    description_ml: '',
    latitude: 10.02835,
    longitude: 76.59715,
    building: '',
    floor: '',
    room: '',
    openingHours: '8:30 AM - 4:30 PM',
    isAccessible: true,
    isActive: true,
    facilities: [],
    aliases: [],
    area_geojson: undefined,
    entrance_node_id: undefined
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize form when editing location or drawn area changes
  useEffect(() => {
    if (editingLocation) {
      setFormData({
        ...formData,
        ...editingLocation,
        // Ensure arrays are properly initialized
        facilities: editingLocation.facilities || [],
        aliases: editingLocation.aliases || [],
        area_geojson: editingLocation.area_geojson,
        entrance_node_id: editingLocation.entrance_node_id
      });
    } else if (drawnArea) {
      // Auto-fill from drawn area
      setFormData(prev => ({
        ...prev,
        id: `loc-${Date.now()}`,
        latitude: drawnArea.centroid[0],
        longitude: drawnArea.centroid[1],
        area_geojson: {
          type: 'Feature',
          geometry: {
            type: drawnArea.coordinates.length === 2 ? 'Polygon' : 'Polygon',
            coordinates: [drawnArea.coordinates]
          },
          properties: {}
        },
        name: '',
        name_ml: '',
        category: 'academic',
        description: '',
        description_ml: '',
        building: '',
        floor: '',
        room: '',
        openingHours: '8:30 AM - 4:30 PM',
        isAccessible: true,
        isActive: true,
        facilities: [],
        aliases: []
      }));
    } else {
      // Reset to defaults
      setFormData({
        id: `loc-${Date.now()}`,
        name: '',
        name_ml: '',
        category: 'academic',
        description: '',
        description_ml: '',
        latitude: 10.02835,
        longitude: 76.59715,
        building: '',
        floor: '',
        room: '',
        openingHours: '8:30 AM - 4:30 PM',
        isAccessible: true,
        isActive: true,
        facilities: [],
        aliases: [],
        area_geojson: undefined,
        entrance_node_id: undefined
      });
    }
    setErrors({});
    setSaveSuccess(false);
  }, [editingLocation, drawnArea]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Place name is required';
    }
    if (!formData.name_ml?.trim()) {
      newErrors.name_ml = 'Malayalam name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (formData.latitude === undefined || formData.longitude === undefined) {
      newErrors.coords = 'Coordinates are required';
    }
    if (!formData.building?.trim()) {
      newErrors.building = 'Building/Block is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to save location' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const handleArrayChange = (field: 'facilities' | 'aliases', value: string) => {
    const items = value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-campus-100 dark:bg-campus-950/60 text-campus-600 dark:text-campus-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {editingLocation?.name ? `Edit: ${editingLocation.name}` : drawnArea ? 'New POI from Drawn Area' : 'Add New Campus Location'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {editingLocation ? 'Modify existing location details' : 'Create a new point of interest'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
          {/* Success Message */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 animate-fade-in">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span className="font-semibold">Location saved successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-red-800 dark:text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{errors.submit}</span>
            </div>
          )}

          {/* Drawn Area Indicator */}
          {drawnArea && !editingLocation && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="text-xs text-blue-800 dark:text-blue-300">
                <span className="font-semibold">Area captured from map drawing:</span> {drawnArea.coordinates.length} vertices, centroid at {drawnArea.centroid[0].toFixed(5)}, {drawnArea.centroid[1].toFixed(5)}
              </div>
            </div>
          )}

          {/* Basic Info Section */}
          <fieldset className="space-y-4">
            <legend className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-campus-600" />
              Basic Information
            </legend>

            {/* Name (English) */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                Place Name (English) *
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full p-2.5 rounded-xl border ${
                  errors.name ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
                } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-campus-500 focus:outline-none`}
                placeholder="e.g. CSE Project Lab"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
            </div>

            {/* Name (Malayalam) */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                Place Name (മലയാളം) *
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name_ml || ''}
                onChange={(e) => handleChange('name_ml', e.target.value)}
                className={`w-full p-2.5 rounded-xl border ${
                  errors.name_ml ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
                } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-campus-500 focus:outline-none font-[\"Noto_Sans_Malayalam\"]`}
                placeholder="e.g. സിഎസ്ഇ പ്രോജക്റ്റ് ല্যാബ്"
              />
              {errors.name_ml && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name_ml}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Required for bilingual search and voice guidance</p>
            </div>

            {/* Category */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                Category *
                <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category || 'academic'}
                onChange={(e) => handleChange('category', e.target.value as LocationCategory)}
                className={`w-full p-2.5 rounded-xl border ${
                  errors.category ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
                } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none`}
              >
                {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label} ({info.icon})
                  </option>
                ))}
              </select>
            </div>

            {/* Building */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                Building / Block *
                <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.building || ''}
                onChange={(e) => handleChange('building', e.target.value)}
                className={`w-full p-2.5 rounded-xl border ${
                  errors.building ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
                } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none`}
              >
                <option value="">Select a building</option>
                {buildings.map(b => (
                  <option key={b.id} value={b.name}>{b.name} ({b.code})</option>
                ))}
              </select>
              {errors.building && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.building}</p>}
            </div>

            {/* Floor & Room */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Floor</label>
                <input
                  type="text"
                  value={formData.floor || ''}
                  onChange={(e) => handleChange('floor', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                  placeholder="e.g. 1st Floor"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Room Number</label>
                <input
                  type="text"
                  value={formData.room || ''}
                  onChange={(e) => handleChange('room', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                  placeholder="e.g. Room 210"
                />
              </div>
            </div>
          </fieldset>

          {/* Coordinates Section */}
          <fieldset className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <legend className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Coordinates (Auto-filled from map)
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  readOnly
                  value={formData.latitude ?? 10.02835}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  readOnly
                  value={formData.longitude ?? 76.59715}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-xs"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Coordinates are automatically set from the drawn area centroid or map click.
            </p>
          </fieldset>

          {/* Description Section */}
          <fieldset className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <legend className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-600" />
              Descriptions (Bilingual)
            </legend>

            {/* Description (English) */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Description (English)</label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                placeholder="Short summary of this facility, office, or point of interest..."
              />
            </div>

            {/* Description (Malayalam) */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                Description (മലയാളം)
              </label>
              <textarea
                rows={3}
                value={formData.description_ml || ''}
                onChange={(e) => handleChange('description_ml', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none font-[\"Noto_Sans_Malayalam\"]"
                placeholder="ഈ സൗകര്യം, ഓഫീസ്, അല്ലെങ്കിൽ പോയിന്റ് ഓഫ് ഇന്ററസ്റ്റ് എന്നീവയുടെ ലഘു വിവരണം..."
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Used for Malayalam voice guidance and search</p>
            </div>
          </fieldset>

          {/* Additional Details Section */}
          <fieldset className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <legend className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              Additional Details
            </legend>

            {/* Opening Hours */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Opening Hours</label>
              <input
                type="text"
                value={formData.openingHours || '8:30 AM - 4:30 PM'}
                onChange={(e) => handleChange('openingHours', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                placeholder="e.g. 8:30 AM - 4:30 PM, Mon-Fri"
              />
            </div>

            {/* Facilities */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Facilities (comma-separated)</label>
              <input
                type="text"
                value={formData.facilities?.join(', ') || ''}
                onChange={(e) => handleArrayChange('facilities', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                placeholder="e.g. WiFi, AC, Projector, Whiteboard"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Separate multiple facilities with commas</p>
            </div>

            {/* Aliases for Search */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Search Aliases (comma-separated)</label>
              <input
                type="text"
                value={formData.aliases?.join(', ') || ''}
                onChange={(e) => handleArrayChange('aliases', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                placeholder="e.g. cse lab, computer lab, project room"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Alternative names users might search for (English)</p>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAccessible ?? true}
                  onChange={(e) => handleChange('isAccessible', e.target.checked)}
                  className="w-4 h-4 text-campus-600 rounded"
                />
                <span className="font-medium text-gray-700 dark:text-gray-300">Wheelchair Accessible</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-campus-600 rounded"
                />
                <span className="font-medium text-gray-700 dark:text-gray-300">Active on Map</span>
              </label>
            </div>
          </fieldset>

          {/* Area GeoJSON Info */}
          {formData.area_geojson && (
            <fieldset className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-4">
              <legend className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                Area Geometry (from map drawing)
              </legend>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-700">
                <pre className="text-[10px] text-gray-600 dark:text-gray-400 overflow-x-auto max-h-32">
                  {JSON.stringify(formData.area_geojson, null, 2)}
                </pre>
              </div>
            </fieldset>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="py-2.5 px-5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-campus-600 hover:bg-campus-700 text-white font-semibold shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editingLocation ? 'Update Location' : 'Create Location'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};