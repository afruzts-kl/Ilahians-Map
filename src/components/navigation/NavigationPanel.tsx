import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  X, 
  ArrowUp, 
  CornerUpLeft, 
  CornerUpRight, 
  CheckCircle, 
  Clock, 
  Milestone, 
  Accessibility, 
  RotateCcw,
  Sparkles,
  MapPin,
  Volume2,
  VolumeX
} from 'lucide-react';
import { CalculatedRoute, CampusLocation, DirectionStep } from '../../types';
import { voiceGuidance } from '../../services/voiceGuidance';
import { TRANSLATIONS, SupportedLanguage } from '../../services/i18n';

interface NavigationPanelProps {
  destination: CampusLocation;
  route: CalculatedRoute | null;
  isNavigating: boolean;
  hasArrived: boolean;
  activeStepIndex: number;
  isAccessibleOnly: boolean;
  onToggleAccessible: () => void;
  onStartNavigation: () => void;
  onStopNavigation: () => void;
  onClose: () => void;
  routingError: string | null;
  startPointName?: string;
  onSelectStartGate: () => void;
  lang?: SupportedLanguage;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  destination,
  route,
  isNavigating,
  hasArrived,
  activeStepIndex,
  isAccessibleOnly,
  onToggleAccessible,
  onStartNavigation,
  onStopNavigation,
  onClose,
  routingError,
  startPointName = "Current GPS Location",
  onSelectStartGate,
  lang = 'en'
}) => {
  const [isVoiceOn, setIsVoiceOn] = useState(() => voiceGuidance.getIsEnabled());
  const t = TRANSLATIONS[lang];

  const toggleVoice = () => {
    const next = !isVoiceOn;
    setIsVoiceOn(next);
    voiceGuidance.setEnabled(next);
    if (next) {
      voiceGuidance.speak(lang === 'ml' ? 'വോയ്സ് ഗൈഡൻസ് ഓൺ ആക്കി' : 'Voice guidance enabled');
    }
  };

  // Live spoken guidance whenever active step changes or when arrived
  useEffect(() => {
    if (!isNavigating || !route) return;

    if (hasArrived) {
      const msg = lang === 'ml' 
        ? `${destination.name} ലേക്ക് എത്തിച്ചേർന്നിരിക്കുന്നു`
        : `You have arrived at ${destination.name}`;
      voiceGuidance.speak(msg);
      return;
    }

    const currentStep = route.steps[activeStepIndex];
    if (currentStep) {
      voiceGuidance.speak(currentStep.instruction);
    }
  }, [isNavigating, activeStepIndex, hasArrived, route, destination, lang]);

  // Format minutes & seconds
  const formatTime = (seconds: number) => {
    const mins = Math.ceil(seconds / 60);
    return mins <= 1 ? '~1 min' : `~${mins} mins`;
  };

  // Helper for step icons
  const getStepIcon = (action: DirectionStep['action']) => {
    switch (action) {
      case 'turn-left':
      case 'slight-left':
        return <CornerUpLeft className="w-5 h-5 text-blue-500" />;
      case 'turn-right':
      case 'slight-right':
        return <CornerUpRight className="w-5 h-5 text-blue-500" />;
      case 'arrive':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <ArrowUp className="w-5 h-5 text-campus-600 dark:text-campus-400" />;
    }
  };

  // Arrival State Modal
  if (hasArrived) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-2xl shadow-floating border-t md:border border-gray-200 dark:border-gray-700 p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-8 h-8 animate-bounce" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {t.youHaveArrived}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-5">
          {lang === 'ml' ? 'നിങ്ങൾ എത്തിച്ചേർന്ന സ്ഥലം: ' : 'You have reached '}
          <span className="font-semibold text-gray-900 dark:text-white">{destination.name}</span>.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-campus-600 hover:bg-campus-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95"
        >
          {t.done}
        </button>
      </div>
    );
  }

  // Routing Error State
  if (routingError) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-2xl shadow-floating border border-red-200 dark:border-red-900/60 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <span>{lang === 'ml' ? 'റൂട്ട് ലഭ്യമല്ല' : 'Route Unavailable'}</span>
          </h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{routingError}</p>
        <div className="flex gap-2">
          <button
            onClick={onSelectStartGate}
            className="flex-1 py-2 px-3 text-xs font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
          >
            {lang === 'ml' ? 'മെയിൻ ഗേറ്റിൽ നിന്ന് തുടങ്ങുക' : 'Start from Main Gate'}
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            {lang === 'ml' ? 'ക്ലോസ് ചെയ്യുക' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-2xl shadow-floating p-6 text-center">
        <div className="animate-spin w-7 h-7 border-3 border-campus-600 border-t-transparent rounded-full mx-auto mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
          {lang === 'ml' ? 'വഴി കണക്കുകൂട്ടുന്നു...' : 'Calculating shortest walking route...'}
        </p>
      </div>
    );
  }

  const currentStep = route.steps[activeStepIndex] || route.steps[0];

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-2xl shadow-floating border-t md:border border-gray-200 dark:border-gray-700 p-5 transition-all max-h-[85vh] md:max-h-[calc(100vh-140px)] flex flex-col">
      {/* Mobile drag handle */}
      <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3 md:hidden" />

      {/* Header with Origin & Destination */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/80">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="truncate">{startPointName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-campus-600 dark:text-campus-400 shrink-0" />
            <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-white truncate">
              {destination.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Voice Guidance Toggle */}
          <button
            onClick={toggleVoice}
            aria-label="Toggle voice guidance"
            className={`p-2 rounded-xl border transition-colors ${
              isVoiceOn
                ? 'bg-campus-50 dark:bg-campus-950/40 text-campus-600 dark:text-campus-400 border-campus-200 dark:border-campus-800'
                : 'border-gray-200 dark:border-gray-700 text-gray-400'
            }`}
            title={isVoiceOn ? t.voiceOn : t.voiceOff}
          >
            {isVoiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            aria-label="Exit navigation"
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Route Quick Metrics */}
      <div className="grid grid-cols-2 gap-3 my-3">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-campus-50/70 dark:bg-campus-950/30 border border-campus-100 dark:border-campus-900/50">
          <Milestone className="w-5 h-5 text-campus-600 dark:text-campus-400" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t.distance}</div>
            <div className="text-base font-bold text-gray-900 dark:text-white">
              {route.totalDistanceMeters} m
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t.walkingTime}</div>
            <div className="text-base font-bold text-gray-900 dark:text-white">
              {formatTime(route.estimatedTimeSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Accessible Route Toggle */}
      <div className="flex items-center justify-between py-2 px-1 mb-2 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isAccessibleOnly}
            onChange={onToggleAccessible}
            className="w-4 h-4 text-campus-600 rounded border-gray-300 focus:ring-campus-500"
          />
          <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
            <Accessibility className="w-3.5 h-3.5 text-campus-600" />
            {t.wheelchairRoute}
          </span>
        </label>

        <button
          onClick={onSelectStartGate}
          className="text-campus-600 dark:text-campus-400 hover:underline font-medium"
        >
          {t.changeStart}
        </button>
      </div>

      {/* Live Turn Banner if navigating */}
      {isNavigating && currentStep && (
        <div className="my-2 p-3.5 rounded-xl bg-campus-600 text-white shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20">
              {getStepIcon(currentStep.action)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-campus-100">
                {t.currentStep} ({activeStepIndex + 1}/{route.steps.length})
              </p>
              <p className="text-sm font-bold leading-tight mt-0.5">
                {currentStep.instruction}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step by Step Turn List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 my-2 pr-1 divide-y divide-gray-100 dark:divide-gray-700/60 max-h-56">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 pt-1">
          {t.turnDirections} ({route.steps.length})
        </p>
        {route.steps.map((step, idx) => {
          const isActive = idx === activeStepIndex && isNavigating;
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 pt-2 text-sm transition-colors ${
                isActive
                  ? 'font-bold text-campus-700 dark:text-campus-300'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 shrink-0 mt-0.5">
                {getStepIcon(step.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="leading-snug">{step.instruction}</p>
                {step.distanceMeters > 0 && (
                  <span className="text-[11px] text-gray-400 font-normal">
                    {step.distanceMeters} {lang === 'ml' ? 'മീറ്റർ' : 'meters'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Start / Stop Navigation Action */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-700/80">
        {!isNavigating ? (
          <button
            onClick={onStartNavigation}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-campus-600 hover:bg-campus-700 active:scale-95 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
          >
            <Navigation className="w-4 h-4 fill-current" />
            <span>{t.startNavigation}</span>
          </button>
        ) : (
          <button
            onClick={onStopNavigation}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.stopNavigation}</span>
          </button>
        )}
      </div>
    </div>
  );
};
