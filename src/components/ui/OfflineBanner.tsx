import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-1.5 text-center text-xs font-semibold shadow-md flex items-center justify-center gap-2">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — Using cached campus map and offline routing graph.</span>
    </div>
  );
};
