import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Building, 
  GitFork, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Upload, 
  Check, 
  AlertCircle,
  Eye,
  LogOut,
  Crosshair
} from 'lucide-react';
import { CampusLocation, CampusBuilding, PathNode, PathEdge, LocationCategory } from '../../types';
import { locationService } from '../../services/locationService';
import { CATEGORY_INFO } from '../../config/campusConfig';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  locations: CampusLocation[];
  buildings: CampusBuilding[];
  pathNodes: PathNode[];
  pathEdges: PathEdge[];
  onRefreshData: () => void;
  onLogout: () => void;
  onOpenMapEditor: (initialCoords?: { lat: number; lng: number }) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  locations,
  buildings,
  pathNodes,
  pathEdges,
  onRefreshData,
  onLogout,
  onOpenMapEditor
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'paths' | 'export'>('overview');

  // Location form state
  const [editingLocation, setEditingLocation] = useState<Partial<CampusLocation> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEditClick = (loc: CampusLocation) => {
    setEditingLocation({ ...loc });
    setIsFormOpen(true);
  };

  const handleCreateNewClick = () => {
    setEditingLocation({
      id: `loc-${Date.now()}`,
      name: '',
      category: 'academic',
      description: '',
      latitude: 10.02835,
      longitude: 76.59715,
      building: '',
      floor: '',
      room: '',
      openingHours: '8:30 AM - 4:30 PM',
      isAccessible: true,
      isActive: true,
      facilities: [],
      aliases: []
    });
    setIsFormOpen(true);
  };

  const handleDeleteLocation = async (id: string) => {
    if (confirm('Are you sure you want to delete this campus location?')) {
      await locationService.deleteLocation(id);
      onRefreshData();
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation || !editingLocation.name) return;

    await locationService.saveLocation(editingLocation as CampusLocation);
    setIsFormOpen(false);
    setEditingLocation(null);
    setSaveSuccess('Location successfully saved!');
    setTimeout(() => setSaveSuccess(null), 3000);
    onRefreshData();
  };

  // GeoJSON Download
  const handleExportGeoJSON = () => {
    const geoJsonStr = locationService.exportGeoJSON(locations);
    const blob = new Blob([geoJsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ilahianav-campus-data-${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-campus-600 text-white shadow-md">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                ILahiaNav Admin Portal
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage Campus Locations, Buildings, Walking Paths & GIS Data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-5 gap-4 overflow-x-auto text-sm font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-campus-600 text-campus-600 dark:text-campus-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'locations'
                ? 'border-campus-600 text-campus-600 dark:text-campus-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            <span>Campus Locations</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
              {locations.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('paths')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'paths'
                ? 'border-campus-600 text-campus-600 dark:text-campus-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            <span>Walking Paths Graph</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
              {pathNodes.length} nodes
            </span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'export'
                ? 'border-campus-600 text-campus-600 dark:text-campus-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            Import / Export GeoJSON
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="p-6 overflow-y-auto space-y-6">
            {saveSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-xs font-semibold">Active</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{locations.length}</div>
                <div className="text-xs text-gray-500">Locations & POIs</div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
                  <Building className="w-5 h-5" />
                  <span className="text-xs font-semibold">Blocks</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{buildings.length}</div>
                <div className="text-xs text-gray-500">Campus Buildings</div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50">
                <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-2">
                  <GitFork className="w-5 h-5" />
                  <span className="text-xs font-semibold">Routing</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{pathEdges.length}</div>
                <div className="text-xs text-gray-500">Walkable Segments</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
                  <Layers className="w-5 h-5" />
                  <span className="text-xs font-semibold">Categories</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.keys(CATEGORY_INFO).length}
                </div>
                <div className="text-xs text-gray-500">POI Categories</div>
              </div>
            </div>

            {/* Quick Action Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">Interactive Map Editor</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Click anywhere on the satellite map to position a new location or drag existing coordinates.
                  </p>
                </div>
                <button
                  onClick={() => onOpenMapEditor()}
                  className="mt-4 py-2.5 px-4 bg-campus-600 hover:bg-campus-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Crosshair className="w-4 h-4" />
                  <span>Launch Map Click Editor</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">Add New Location</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Manually add a classroom, lab, office, or amenity with specific floor and opening hours.
                  </p>
                </div>
                <button
                  onClick={handleCreateNewClick}
                  className="mt-4 py-2.5 px-4 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Location</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Locations List & Editor */}
        {activeTab === 'locations' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                All Locations ({locations.length})
              </h3>
              <button
                onClick={handleCreateNewClick}
                className="py-2 px-3.5 bg-campus-600 hover:bg-campus-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Place</span>
              </button>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
              {locations.map(loc => (
                <div key={loc.id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {loc.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {loc.category}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {loc.building || 'No building specified'} • {loc.latitude.toFixed(5)}°N, {loc.longitude.toFixed(5)}°E
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEditClick(loc)}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(loc.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Paths Graph */}
        {activeTab === 'paths' && (
          <div className="p-6 overflow-y-auto space-y-6">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">
                Walking Network Graph
              </h3>
              <p className="text-xs text-gray-500">
                The Dijkstra routing engine computes routes using {pathNodes.length} graph junction nodes and {pathEdges.length} connected walkable paths.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nodes List */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">
                  Graph Nodes ({pathNodes.length})
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {pathNodes.map(node => (
                    <div key={node.id} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-xs flex justify-between">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{node.name}</span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {node.latitude.toFixed(5)}, {node.longitude.toFixed(5)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edges List */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">
                  Walkable Edges ({pathEdges.length})
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {pathEdges.map(edge => (
                    <div key={edge.id} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-xs flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300 truncate">
                        {edge.description || `${edge.startNodeId} → ${edge.endNodeId}`}
                      </span>
                      <span className="font-bold text-campus-600 dark:text-campus-400 ml-2 shrink-0">
                        {edge.distance}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: GeoJSON Export */}
        {activeTab === 'export' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="max-w-xl">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Export / Import Campus Spatial Data
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Export all Ilahia College campus locations, coordinates, and metadata in industry-standard GeoJSON format for backup or GIS processing in QGIS, ArcGIS, or OpenStreetMap.
              </p>
            </div>

            <div className="pt-3 flex gap-3">
              <button
                onClick={handleExportGeoJSON}
                className="py-3 px-5 bg-campus-600 hover:bg-campus-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export GeoJSON File</span>
              </button>
            </div>
          </div>
        )}

        {/* Location Edit / Create Modal Form */}
        {isFormOpen && editingLocation && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {editingLocation.name ? `Edit: ${editingLocation.name}` : 'New Campus Location'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLocation} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Place Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLocation.name || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-campus-500 focus:outline-none"
                    placeholder="e.g. CSE Project Lab"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={editingLocation.category || 'academic'}
                      onChange={(e) => setEditingLocation({ ...editingLocation, category: e.target.value as LocationCategory })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                    >
                      {Object.keys(CATEGORY_INFO).map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_INFO[c].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Building / Block
                    </label>
                    <input
                      type="text"
                      value={editingLocation.building || ''}
                      onChange={(e) => setEditingLocation({ ...editingLocation, building: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                      placeholder="e.g. ICET Main Block"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Floor
                    </label>
                    <input
                      type="text"
                      value={editingLocation.floor || ''}
                      onChange={(e) => setEditingLocation({ ...editingLocation, floor: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                      placeholder="e.g. 1st Floor"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Room Number
                    </label>
                    <input
                      type="text"
                      value={editingLocation.room || ''}
                      onChange={(e) => setEditingLocation({ ...editingLocation, room: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                      placeholder="e.g. Room 210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={editingLocation.latitude ?? 10.02835}
                      onChange={(e) => setEditingLocation({ ...editingLocation, latitude: parseFloat(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Longitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={editingLocation.longitude ?? 76.59715}
                      onChange={(e) => setEditingLocation({ ...editingLocation, longitude: parseFloat(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={editingLocation.description || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                    placeholder="Short summary of this facility or office..."
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingLocation.isAccessible ?? true}
                      onChange={(e) => setEditingLocation({ ...editingLocation, isAccessible: e.target.checked })}
                      className="w-4 h-4 text-campus-600 rounded"
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Wheelchair Accessible</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingLocation.isActive ?? true}
                      onChange={(e) => setEditingLocation({ ...editingLocation, isActive: e.target.checked })}
                      className="w-4 h-4 text-campus-600 rounded"
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Active on Map</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="py-2 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-5 rounded-xl bg-campus-600 hover:bg-campus-700 text-white font-semibold shadow-sm"
                  >
                    Save Location
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
