import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Navigation, 
  Compass, 
  Sparkles, 
  Lightbulb, 
  Check 
} from 'lucide-react';
import { CAMPUS_TOUR_STEPS } from '../../data/seedCampusData';
import { CampusLocation } from '../../types';

interface CampusTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToLocation: (location: CampusLocation) => void;
  locations: CampusLocation[];
}

export const CampusTourModal: React.FC<CampusTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateToLocation,
  locations
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const currentStep = CAMPUS_TOUR_STEPS[currentStepIdx];
  const targetLocation = locations.find(l => l.id === currentStep.locationId);

  const handleNext = () => {
    if (currentStepIdx < CAMPUS_TOUR_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const handleNavigate = () => {
    if (targetLocation) {
      onNavigateToLocation(targetLocation);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
        {/* Banner with Progress Bar */}
        <div className="bg-gradient-to-r from-campus-600 to-emerald-700 p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm">
              <Compass className="w-3.5 h-3.5" />
              Campus Guide Tour
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold">{currentStep.title}</h3>
          <p className="text-xs text-campus-100 mt-0.5">{currentStep.subtitle}</p>

          {/* Stepper Progress */}
          <div className="flex items-center gap-1.5 mt-4">
            {CAMPUS_TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full flex-1 transition-all ${
                  idx <= currentStepIdx ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Student Tip Card */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Senior Student Tip
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                {currentStep.tip}
              </p>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700/80 flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            {targetLocation && (
              <button
                onClick={handleNavigate}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center gap-1.5"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="py-2.5 px-5 bg-campus-600 hover:bg-campus-700 active:scale-95 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>{currentStepIdx === CAMPUS_TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
