import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Navigation, 
  Sparkles, 
  Award, 
  Trophy, 
  Briefcase, 
  Cpu
} from 'lucide-react';
import { CampusEvent, CampusLocation } from '../../types';
import { SEED_CAMPUS_EVENTS } from '../../data/seedCampusData';

interface CampusEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: CampusLocation[];
  onNavigateToLocation: (location: CampusLocation) => void;
  lang: 'en' | 'ml';
}

export const CampusEventsModal: React.FC<CampusEventsModalProps> = ({
  isOpen,
  onClose,
  locations,
  onNavigateToLocation,
  lang
}) => {
  if (!isOpen) return null;

  const getCategoryBadge = (category: CampusEvent['category']) => {
    switch (category) {
      case 'tech':
        return {
          label: lang === 'ml' ? 'ടെക് ഫെസ്റ്റ്' : 'Tech Fest',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
          icon: <Cpu className="w-3.5 h-3.5" />
        };
      case 'sports':
        return {
          label: lang === 'ml' ? 'സ്പോർട്സ്' : 'Athletics & Sports',
          color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
          icon: <Trophy className="w-3.5 h-3.5" />
        };
      case 'placement':
        return {
          label: lang === 'ml' ? 'പ്ലേസ്മെന്റ് ഡ്രൈവ്' : 'Placement Drive',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
          icon: <Briefcase className="w-3.5 h-3.5" />
        };
      default:
        return {
          label: lang === 'ml' ? 'സെമിനാർ' : 'Campus Event',
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
          icon: <Award className="w-3.5 h-3.5" />
        };
    }
  };

  const handleNavigate = (event: CampusEvent) => {
    const loc = locations.find(l => l.id === event.locationId);
    if (loc) {
      onNavigateToLocation(loc);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-campus-700 to-emerald-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-sm">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {lang === 'ml' ? 'ക്യാമ്പസ് ഇവന്റുകളും മത്സരങ്ങളും' : 'Campus Events & Highlights'}
              </h2>
              <p className="text-xs text-campus-100">
                {lang === 'ml'
                  ? 'ഇലാഹിയാ കോളേജിലെ പ്രധാന പരിപാടികളും വേദികളും'
                  : 'Upcoming fests, hackathons, sports meets & interview drives'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Events List */}
        <div className="p-5 overflow-y-auto space-y-4">
          {SEED_CAMPUS_EVENTS.map(event => {
            const badge = getCategoryBadge(event.category);
            return (
              <div
                key={event.id}
                className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-750/50 hover:bg-white dark:hover:bg-gray-750 hover:border-campus-400 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.color}`}>
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {event.date}
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {event.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                  {event.description}
                </p>

                <div className="mt-3 pt-3 border-t border-gray-200/80 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5 font-medium text-gray-800 dark:text-gray-200">
                      <MapPin className="w-3.5 h-3.5 text-campus-600 dark:text-campus-400 shrink-0" />
                      <span>{event.locationName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{event.time}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavigate(event)}
                    className="py-2 px-4 rounded-xl bg-campus-600 hover:bg-campus-700 active:scale-95 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 fill-current" />
                    <span>{lang === 'ml' ? 'വേദിയിലേക്ക് വഴി കാണിക്കുക' : 'Navigate to Venue'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
