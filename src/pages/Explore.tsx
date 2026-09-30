import React, { useState } from 'react';
import { CampusLocation, LocationCategory } from '../types';
import { CATEGORY_INFO } from '../config/campusConfig';
import { 
  Navigation, 
  MapPin, 
  Search, 
  ChevronRight, 
  Building2, 
  Accessibility,
  Bookmark
} from 'lucide-react';

interface ExploreProps {
  locations: CampusLocation[];
  onSelectLocation: (location: CampusLocation) => void;
  onNavigateToLocation: (location: CampusLocation) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
}

export const Explore: React.FC<ExploreProps> = ({
  locations,
  onSelectLocation,
  onNavigateToLocation,
  savedIds,
  onToggleSave
}) => {
  const [activeCategory, setActiveCategory] = useState<LocationCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Count locations per category
  const counts = React.useMemo(() => {
    const map: Record<string, number> = {};
    locations.forEach(loc => {
      map[loc.category] = (map[loc.category] || 0) + 1;
    });
    return map;
  }, [locations]);

  // Filtered locations
  const filtered = React.useMemo(() => {
    return locations.filter(loc => {
      if (!loc.isActive) return false;
      if (activeCategory && loc.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          loc.name.toLowerCase().includes(q) ||
          loc.description.toLowerCase().includes(q) ||
          (loc.building && loc.building.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [locations, activeCategory, searchQuery]);

  const categories = Object.keys(CATEGORY_INFO) as LocationCategory[];

  return (
    <div className="w-full h-full overflow-y-auto pb-24 md:pb-12 bg-gray-50 dark:bg-navy-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
            Explore Campus Places
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse departments, laboratories, libraries, canteens, and sports grounds across Ilahia College.
          </p>
        </div>

        {/* Search bar inside explore */}
        <div className="relative mb-6">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter places by name or building..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-campus-500"
          />
        </div>

        {/* Category Cards Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Campus Categories
            </h2>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="text-xs text-campus-600 dark:text-campus-400 font-semibold hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((catKey) => {
              const info = CATEGORY_INFO[catKey];
              const isSelected = activeCategory === catKey;
              const count = counts[catKey] || 0;

              return (
                <button
                  key={catKey}
                  onClick={() => setActiveCategory(isSelected ? null : catKey)}
                  className={`p-3.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-campus-600 text-white border-campus-600 shadow-md ring-2 ring-campus-400/40'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-campus-300 dark:hover:border-campus-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">
                      {catKey === 'academic' && '🏫'}
                      {catKey === 'lab' && '🧪'}
                      {catKey === 'library' && '📚'}
                      {catKey === 'food' && '🍔'}
                      {catKey === 'facility' && '🚻'}
                      {catKey === 'sports' && '🏟️'}
                      {catKey === 'parking' && '🅿️'}
                      {catKey === 'gate' && '🚪'}
                      {catKey === 'medical' && '🏥'}
                      {catKey === 'admin' && '🏢'}
                      {catKey === 'emergency' && '🆘'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {count}
                    </span>
                  </div>

                  <div>
                    <p className={`font-bold text-xs sm:text-sm line-clamp-1 ${
                      isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {info.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results List */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            {activeCategory ? CATEGORY_INFO[activeCategory].label : 'All Campus Locations'} ({filtered.length})
          </h2>

          <div className="space-y-3">
            {filtered.map(loc => {
              const cat = CATEGORY_INFO[loc.category] || CATEGORY_INFO.academic;
              const isSaved = savedIds.includes(loc.id);

              return (
                <div
                  key={loc.id}
                  className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectLocation(loc)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.badgeColor}`}>
                        {cat.label}
                      </span>
                      {loc.isAccessible && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-medium">
                          <Accessibility className="w-3 h-3" />
                          Step-free
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
                      {loc.name}
                    </h3>

                    {loc.building && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{loc.building} {loc.floor ? `• ${loc.floor}` : ''}</span>
                      </p>
                    )}

                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                      {loc.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700 shrink-0">
                    <button
                      onClick={() => onToggleSave(loc.id)}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        isSaved
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-300 dark:border-amber-700'
                          : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                      }`}
                      title={isSaved ? "Remove bookmark" : "Save location"}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => onSelectLocation(loc)}
                      className="py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5 text-campus-600 dark:text-campus-400" />
                      <span>View Map</span>
                    </button>

                    <button
                      onClick={() => onNavigateToLocation(loc)}
                      className="py-2.5 px-4 rounded-xl bg-campus-600 hover:bg-campus-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1 active:scale-95"
                    >
                      <Navigation className="w-3.5 h-3.5 fill-current" />
                      <span>Navigate</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
