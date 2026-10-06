import React, { useState, useEffect } from 'react';
import { X, MapPin, Globe, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export const LocationPermissionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
}> = ({ isOpen, onClose, onPermissionGranted, onPermissionDenied }) => {
  const { lang, t } = useLanguage();
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAllow = async () => {
    setRequesting(true);
    setError(null);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      // Permission granted and location obtained
      localStorage.setItem('ilahianav_location_permission', 'granted');
      onPermissionGranted();
      onClose();
    } catch (err: any) {
      if (err.code === err.PERMISSION_DENIED) {
        setError(lang === 'ml' ? 'ലൊക്കേഷൻ അനുമതി നിഷേധിച്ചു. സെറ്റിംഗുകളിൽനിന്ന് അണുക്കാം.' : 'Location permission denied. You can enable it in settings.');
      } else if (err.code === err.TIMEOUT) {
        setError(lang === 'ml' ? 'ലൊക്കേഷൻ വാങ്ങുന്നതിൽ വൈകി. വീണ്ടും ശ്രമിക്കുക.' : 'Location request timed out. Please try again.');
      } else {
        setError(lang === 'ml' ? 'ലൊക്കേഷൻ ലഭിക്കാനായില്ല.' : 'Unable to get location.');
      }
    } finally {
      setRequesting(false);
    }
  };

  const handleDeny = () => {
    localStorage.setItem('ilahianav_location_permission', 'denied');
    onPermissionDenied();
    onClose();
  };

  const handleSettings = () => {
    // Open browser settings (not possible directly, show instructions)
    alert(lang === 'ml'
      ? 'ബ്രൗസർ സെറ്റിംഗുകളിൽ പോയി ലൊക്കേഷൻ അനുമതി നൽകുക: Settings > Privacy > Location Services'
      : 'Go to browser settings to enable location: Settings > Privacy > Location Services');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-campus-50 to-emerald-50 dark:from-campus-950/40 dark:to-emerald-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-campus-100 dark:bg-campus-950/60 text-campus-600 dark:text-campus-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {t.locationPermissionTitle}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.locationPermissionSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Illustration */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-campus-100 dark:bg-campus-950/40 flex items-center justify-center">
              <MapPin className="w-10 h-10 text-campus-600 dark:text-campus-400" />
            </div>
          </div>

          {/* Description */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {t.locationPermissionDescription}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t.locationPermissionNote}
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-2">
            {[
              { icon: MapPin, text: t.locationPermissionFeature1 },
              { icon: Globe, text: t.locationPermissionFeature2 },
              { icon: Check, text: t.locationPermissionFeature3 }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-campus-100 dark:bg-campus-950/60 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-campus-600 dark:text-campus-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-red-800 dark:text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleAllow}
              disabled={requesting}
              className="w-full py-3 px-4 bg-campus-600 hover:bg-campus-700 text-white rounded-xl font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {requesting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{lang === 'ml' ? 'ലൊക്കേഷൻ വാങ്ങുകയാണ്...' : 'Getting location...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>{t.allowLocation}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDeny}
              disabled={requesting}
              className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              <X className="w-5 h-5" />
              <span>{t.denyLocation}</span>
            </button>

            <button
              onClick={handleSettings}
              className="w-full py-2 px-4 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center gap-1"
            >
              <span>{t.openSettings}</span>
            </button>
          </div>

          {/* Privacy note */}
          <p className="text-center text-[10px] text-gray-400 dark:text-gray-500">
            {t.locationPrivacyNote}
          </p>
        </div>
      </div>
    </div>
  );
};