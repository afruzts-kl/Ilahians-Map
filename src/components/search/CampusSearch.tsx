import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Building2, ChevronRight } from 'lucide-react';
import { CampusLocation, LocationCategory } from '../../types';
import { CATEGORY_INFO } from '../../config/campusConfig';

interface CampusSearchProps {
  locations: CampusLocation[];
  onSelectLocation: (location: CampusLocation) => void;
  selectedCategory: LocationCategory | null;
  onSelectCategory: (category: LocationCategory | null) => void;
  placeholder?: string;
}

export const CampusSearch: React.FC<CampusSearchProps> = ({
  locations,
  onSelectLocation,
  selectedCategory,
  onSelectCategory,
  placeholder = "Search department, lab, canteen, library..."
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter matching results
  const filteredLocations = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q && !selectedCategory) return [];

    return locations.filter(loc => {
      if (!loc.isActive) return false;
      if (selectedCategory && loc.category !== selectedCategory) return false;
      if (!q) return true;

      return (
        loc.name.toLowerCase().includes(q) ||
        loc.description.toLowerCase().includes(q) ||
        (loc.building && loc.building.toLowerCase().includes(q)) ||
        (loc.aliases && loc.aliases.some(a => a.toLowerCase().includes(q)))
      );
    }).slice(0, 8); // Top 8 results
  }, [locations, query, selectedCategory]);

  const handleSelect = (loc: CampusLocation) => {
    onSelectLocation(loc);
    setQuery(loc.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
  };

  // Quick categories list for chips
  const categoriesList: { id: LocationCategory; label: string; emoji: string }[] = [
    { id: 'academic', label: 'Academic', emoji: '🏫' },
    { id: 'lab', label: 'Labs', emoji: '🧪' },
    { id: 'library', label: 'Library', emoji: '📚' },
    { id: 'food', label: 'Food & Canteen', emoji: '🍔' },
    { id: 'facility', label: 'Facilities', emoji: '🚻' },
    { id: 'sports', label: 'Playground', emoji: '🏟️' },
    { id: 'parking', label: 'Parking', emoji: '🅿️' },
    { id: 'gate', label: 'Gates', emoji: '🚪' }
  ];

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Bar */}
      <div className="relative flex items-center w-full bg-white dark:bg-gray-800 rounded-2xl shadow-subtle border border-gray-200/80 dark:border-gray-700/80 transition-all focus-within:ring-2 focus-within:ring-campus-500 focus-within:border-transparent">
        <div className="pl-3.5 pr-2 py-3 text-gray-400 dark:text-gray-400 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-campus-600 dark:text-campus-400" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full py-2.5 pr-3 text-sm md:text-base bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
        />

        {query && (
          <button
            onClick={handleClear}
            className="p-1.5 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-0.5 no-scrollbar scroll-smooth">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all border ${
            selectedCategory === null
              ? 'bg-campus-600 text-white border-campus-600 shadow-sm'
              : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          All Places
        </button>

        {categoriesList.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all border ${
              selectedCategory === cat.id
                ? 'bg-campus-600 text-white border-campus-600 shadow-sm'
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Instant Search Suggestions Dropdown */}
      {isOpen && query.trim() !== '' && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-2xl shadow-floating border border-gray-200 dark:border-gray-700 z-50 max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60">
          {filteredLocations.length > 0 ? (
            filteredLocations.map(loc => {
              const cat = CATEGORY_INFO[loc.category] || CATEGORY_INFO.academic;
              return (
                <button
                  key={loc.id}
                  onClick={() => handleSelect(loc)}
                  className="w-full text-left p-3.5 hover:bg-campus-50/70 dark:hover:bg-gray-700/50 flex items-start gap-3 transition-colors"
                >
                  <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-campus-600 dark:text-campus-400 mt-0.5 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                        {loc.name}
                      </p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${cat.badgeColor}`}>
                        {cat.label}
                      </span>
                    </div>
                    {loc.building && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span>{loc.building} {loc.floor ? `• ${loc.floor}` : ''}</span>
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 self-center" />
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <p className="font-medium">No places found matching &ldquo;{query}&rdquo;</p>
              <p className="text-xs mt-1 text-gray-400">Try searching for &quot;CSE&quot;, &quot;Canteen&quot;, &quot;Library&quot;, or &quot;Admin&quot;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
