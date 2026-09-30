import React from 'react';
import { 
  X, 
  Navigation, 
  Bookmark, 
  Clock, 
  Building, 
  Layers, 
  CheckCircle2, 
  Accessibility, 
  Share2, 
  MapPin, 
  Compass
} from 'lucide-react';
import { CampusLocation } from '../../types';
import { CATEGORY_INFO } from '../../config/campusConfig';

interface LocationDetailsProps {
  location: CampusLocation | null;
  onClose: () => void;
  onNavigateHere: (location: CampusLocation) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onCenterOnMap: (location: CampusLocation) => void;
}

export const LocationDetails: React.FC<LocationDetailsProps> = ({
  location,
  onClose,
  onNavigateHere,
  isSaved,
  onToggleSave,
  onCenterOnMap
}) => {
  if (!location) return null;

  const cat = CATEGORY_INFO[location.category] || CATEGORY_INFO.academic;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ILahiaNav - ${location.name}`,
          text: `Check out ${location.name} on the Ilahia College campus map!`,
          url: window.location.href
        });
      } catch {
        // Ignored or cancelled
      }
    } else {
      navigator.clipboard.writeText(`${location.name} - Ilahia College (${location.latitude}, ${location.longitude})`);
      alert('Location copied to clipboard!');
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-2xl shadow-floating border-t md:border border-gray-200 dark:border-gray-700 p-5 transition-all max-h-[85vh] md:max-h-[calc(100vh-140px)] overflow-y-auto">
      {/* Drag handle indicator on mobile */}
      <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 md:hidden" />

      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cat.badgeColor}`}>
              {cat.label}
            </span>
            {location.isAccessible && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Accessibility className="w-3 h-3" />
                Accessible
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {location.name}
          </h2>
        </div>

        <button
          onClick={onClose}
          aria-label="Close location details"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Action Buttons: Navigate & Save */}
      <div className="grid grid-cols-2 gap-3 my-4">
        <button
          onClick={() => onNavigateHere(location)}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-campus-600 hover:bg-campus-700 active:scale-95 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
        >
          <Navigation className="w-4 h-4" />
          <span>Navigate Here</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleSave(location.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl border font-semibold text-sm transition-all active:scale-95 ${
              isSaved
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleShare}
            aria-label="Share location"
            title="Share location"
            className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
        {location.description}
      </p>

      {/* Metadata Badges */}
      <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-gray-700/80 text-sm">
        {location.building && (
          <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-200">
            <Building className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="font-medium">{location.building}</span>
          </div>
        )}

        {(location.floor || location.room) && (
          <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-200">
            <Layers className="w-4 h-4 text-gray-400 shrink-0" />
            <span>
              {location.floor ? location.floor : ''}
              {location.floor && location.room ? ' • ' : ''}
              {location.room ? location.room : ''}
            </span>
          </div>
        )}

        {location.openingHours && (
          <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-200">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{location.openingHours}</span>
          </div>
        )}

        <div className="flex items-center gap-2.5 text-gray-500 dark:text-gray-400 text-xs">
          <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
          <span>Coordinates: {location.latitude.toFixed(5)}° N, {location.longitude.toFixed(5)}° E</span>
        </div>
      </div>

      {/* Facilities List */}
      {location.facilities && location.facilities.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/80">
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Available Facilities & Highlights
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {location.facilities.map((fac, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-gray-100 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200"
              >
                <CheckCircle2 className="w-3 h-3 text-campus-600 dark:text-campus-400" />
                <span>{fac}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
