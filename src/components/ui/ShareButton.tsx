import React, { useState } from 'react';
import { Share2, Copy, MessageSquare, Check, ExternalLink } from 'lucide-react';
import { CampusLocation } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';

interface ShareButtonProps {
  location: CampusLocation;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ location, className = '' }) => {
  const { lang, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [shareOptionsOpen, setShareOptionsOpen] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const deepLinkUrl = `${baseUrl}/?poi=${location.id}`;
  const shortLinkUrl = `${baseUrl}/p/${location.id}`;

  const shareData = {
    title: `${location.name} - ILahiaNav`,
    text: `${location.name} - ${location.description || 'Location at Ilahia College'}`,
    url: deepLinkUrl
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
          fallbackCopy();
        }
      }
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = async () => {
    try {
      await navigator.clipboard.writeText(deepLinkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = deepLinkUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${location.name} - ${deepLinkUrl}`)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setShareOptionsOpen(false);
  };

  const handleCopyLink = async () => {
    await fallbackCopy();
    setShareOptionsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Share Button */}
      <button
        onClick={() => setShareOptionsOpen(!shareOptionsOpen)}
        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors flex items-center justify-center"
        aria-label={t.share}
      >
        <Share2 className="w-5 h-5" />
      </button>

      {/* Share Options Dropdown */}
      {shareOptionsOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShareOptionsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-full right-0 mb-2 z-50 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t.shareTitle}
              </p>
              <div className="space-y-1">
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-campus-600 dark:text-campus-400 shrink-0" />
                  <span className="font-medium">{t.shareNative}</span>
                </button>

                <button
                  onClick={handleWhatsAppShare}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="font-medium">{t.shareWhatsApp}</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="font-medium">{copied ? t.copied : t.copyLink}</span>
                  {copied && <Check className="w-5 h-5 text-emerald-600 shrink-0" />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Hook for handling deep links
export function useDeepLink(): CampusLocation | null {
  const { lang } = useLanguage();

  React.useEffect(() => {
    const handleDeepLink = () => {
      const params = new URLSearchParams(window.location.search);
      const poiId = params.get('poi');
      const pathMatch = window.location.pathname.match(/^\/p\/(.+)$/);

      if (poiId || pathMatch) {
        const locationId = poiId || pathMatch![1];
        // The app will handle this via the location service
        console.log('Deep link detected for location:', locationId);
      }
    };

    handleDeepLink();
    window.addEventListener('popstate', handleDeepLink);
    return () => window.removeEventListener('popstate', handleDeepLink);
  }, [lang]);

  return null; // Actual location resolution happens in App.tsx
}