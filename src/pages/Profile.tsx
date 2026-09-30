import React from 'react';
import { 
  Building2, 
  MapPin, 
  Navigation, 
  Sparkles, 
  RotateCcw, 
  PhoneCall, 
  Info,
  ExternalLink,
  Globe
} from 'lucide-react';
import { CAMPUS_CONFIG } from '../config/campusConfig';
import { UserLocationState } from '../types';

interface ProfileProps {
  userLocation: UserLocationState;
  onResetData: () => void;
  onStartTour: () => void;
  onSimulateGate: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  userLocation,
  onResetData,
  onStartTour,
  onSimulateGate
}) => {
  return (
    <div className="w-full h-full overflow-y-auto pb-24 md:pb-12 bg-gray-50 dark:bg-navy-900 transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Campus Header Card */}
        <div className="bg-gradient-to-br from-campus-700 to-emerald-800 rounded-3xl p-6 text-white shadow-subtle">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <Navigation className="w-6 h-6 rotate-45 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">ILahiaNav</h1>
              <p className="text-xs text-campus-100">{CAMPUS_CONFIG.tagline}</p>
            </div>
          </div>

          <p className="text-sm text-campus-50/90 mt-3 leading-relaxed">
            Smart Campus Navigation System for students, faculty, and visitors of {CAMPUS_CONFIG.name}.
          </p>

          <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap gap-3 text-xs text-campus-100">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {CAMPUS_CONFIG.location}
            </span>
          </div>
        </div>

        {/* GPS Diagnostics */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-500" />
            <span>GPS & Location Status</span>
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <span className="text-gray-400 block mb-1">Status</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {userLocation.latitude !== null
                  ? userLocation.isSimulated
                    ? 'Simulated (Main Gate)'
                    : 'Live GPS Active'
                  : 'Location Inactive'}
              </span>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <span className="text-gray-400 block mb-1">Accuracy</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {userLocation.accuracy ? `±${userLocation.accuracy} meters` : 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl col-span-2">
              <span className="text-gray-400 block mb-1">Current Coordinates</span>
              <span className="font-mono font-medium text-gray-800 dark:text-gray-200 text-[11px]">
                {userLocation.latitude !== null && userLocation.longitude !== null
                  ? `${userLocation.latitude.toFixed(6)}° N, ${userLocation.longitude.toFixed(6)}° E`
                  : 'Not available (enable location in browser or click below)'}
              </span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={onSimulateGate}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              Simulate at Main Entrance Gate
            </button>
          </div>
        </div>

        {/* Guided Campus Tour Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">New to Campus?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Interactive walkthrough of key college facilities.
              </p>
            </div>
          </div>

          <button
            onClick={onStartTour}
            className="py-2 px-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition-all shrink-0 shadow-sm"
          >
            Start Tour
          </button>
        </div>

        {/* Emergency Assistance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-red-500" />
            <span>Campus Emergency & Security</span>
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <span className="font-medium text-gray-800 dark:text-gray-200">Main Security Post</span>
              <span className="font-bold text-campus-700 dark:text-campus-400">Open 24/7 (Gate 1)</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <span className="font-medium text-gray-800 dark:text-gray-200">First Aid & Clinic</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">Main Block Rm 105</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <span className="font-medium text-gray-800 dark:text-gray-200">College Office Telephone</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">0485-2549145</span>
            </div>
          </div>
        </div>

        {/* Maintenance / Reset Data */}
        <div className="pt-2 text-center">
          <button
            onClick={() => {
              if (confirm('Reset campus map data back to factory verified seed defaults?')) {
                onResetData();
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Map Data to Verified Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};
