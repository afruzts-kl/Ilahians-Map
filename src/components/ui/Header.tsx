import React from 'react';
import { 
  Compass, 
  Moon, 
  Sun, 
  MapPin, 
  Navigation,
  Sparkles,
  Calendar,
  Languages
} from 'lucide-react';
import { UserLocationState } from '../../types';

interface HeaderProps {
  userLocation: UserLocationState;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onStartTour: () => void;
  onCenterUser: () => void;
  lang: 'en' | 'ml';
  onToggleLanguage: () => void;
  onOpenEvents: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userLocation,
  darkMode,
  onToggleDarkMode,
  onStartTour,
  onCenterUser,
  lang,
  onToggleLanguage,
  onOpenEvents
}) => {
  return (
    <header className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 px-4 py-2.5 z-30 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-campus-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-campus-600/20">
            <Navigation className="w-5 h-5 fill-current rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-campus-700 to-emerald-600 dark:from-campus-400 dark:to-emerald-400 bg-clip-text text-transparent">
                ILahiaNav
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-campus-100 dark:bg-campus-950/60 text-campus-800 dark:text-campus-300">
                CAMPUS
              </span>
            </div>
            <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              Ilahia College Smart Navigation System
            </p>
          </div>
        </div>

        {/* GPS Status & Actions */}
        <div className="flex items-center gap-2">
          {/* GPS Accuracy Indicator */}
          {userLocation.latitude !== null ? (
            <button
              onClick={onCenterUser}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 transition-colors"
              title="Click to center on GPS position"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              <span>
                {userLocation.isSimulated
                  ? 'Simulated Gate'
                  : `GPS ±${userLocation.accuracy ?? 15}m`}
              </span>
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>Location off</span>
            </span>
          )}

          {/* Language Switcher (EN | മലയാളം) */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Switch Language / ഭാഷ മാറ്റുക"
          >
            <Languages className="w-3.5 h-3.5 text-campus-600 dark:text-campus-400" />
            <span>{lang === 'en' ? 'മലയാളം' : 'English'}</span>
          </button>

          {/* Campus Events Modal Button */}
          <button
            onClick={onOpenEvents}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60 text-xs font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>{lang === 'ml' ? 'ഇവന്റുകൾ' : 'Events'}</span>
          </button>

          {/* New to Campus Guided Tour Button */}
          <button
            onClick={onStartTour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/50 active:scale-95 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden xs:inline">New here?</span>
            <span>Campus Tour</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label="Toggle dark mode"
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
