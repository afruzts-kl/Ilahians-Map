import React from 'react';
import { CampusLocation } from '../types';
import { CATEGORY_INFO } from '../config/campusConfig';
import { Bookmark, Navigation, MapPin, Trash2, ArrowRight } from 'lucide-react';

interface SavedProps {
  savedLocations: CampusLocation[];
  onSelectLocation: (location: CampusLocation) => void;
  onNavigateToLocation: (location: CampusLocation) => void;
  onRemoveSaved: (id: string) => void;
  onGoToExplore: () => void;
}

export const Saved: React.FC<SavedProps> = ({
  savedLocations,
  onSelectLocation,
  onNavigateToLocation,
  onRemoveSaved,
  onGoToExplore
}) => {
  return (
    <div className="w-full h-full overflow-y-auto pb-24 md:pb-12 bg-gray-50 dark:bg-navy-900 transition-colors">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
              Saved Locations
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your quick-access bookmarks for frequent classrooms, labs, and spots.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
            {savedLocations.length} Saved
          </span>
        </div>

        {savedLocations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 text-center max-w-md mx-auto my-12 shadow-subtle">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              No Saved Places Yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 mb-6 leading-relaxed">
              Bookmark your daily classroom, CSE Lab, the Central Library, or Canteen for quick one-tap walking routes.
            </p>
            <button
              onClick={onGoToExplore}
              className="py-3 px-6 bg-campus-600 hover:bg-campus-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md inline-flex items-center gap-2"
            >
              <span>Explore Places</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedLocations.map(loc => {
              const cat = CATEGORY_INFO[loc.category] || CATEGORY_INFO.academic;

              return (
                <div
                  key={loc.id}
                  className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-campus-300 transition-colors"
                >
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectLocation(loc)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.badgeColor}`}>
                        {cat.label}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
                      {loc.name}
                    </h3>

                    {loc.building && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {loc.building} {loc.floor ? `• ${loc.floor}` : ''}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => onRemoveSaved(loc.id)}
                      className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSelectLocation(loc)}
                      className="py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5 text-campus-600 dark:text-campus-400" />
                      <span>View</span>
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
        )}
      </div>
    </div>
  );
};
