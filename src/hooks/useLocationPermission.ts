import { useState, useEffect, useCallback } from 'react';

const PERMISSION_KEY = 'ilahianav_location_permission_v2';

export function useLocationPermission() {
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [showModal, setShowModal] = useState(false);

  // Check permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      // Check localStorage first
      const stored = localStorage.getItem(PERMISSION_KEY);
      if (stored === 'granted' || stored === 'denied') {
        setPermission(stored);
        return;
      }

      // Check browser permission API
      try {
        const perm = await navigator.permissions.query({ name: 'geolocation' });
        if (perm.state === 'granted' || perm.state === 'denied') {
          setPermission(perm.state);
          localStorage.setItem(PERMISSION_KEY, perm.state);
        } else {
          setPermission('prompt');
          setShowModal(true);
        }
      } catch {
        // Permission API not supported, assume prompt
        setPermission('prompt');
        setShowModal(true);
      }
    };

    checkPermission();
  }, []);

  const handlePermissionGranted = useCallback(() => {
    setPermission('granted');
    setShowModal(false);
    localStorage.setItem(PERMISSION_KEY, 'granted');
  }, []);

  const handlePermissionDenied = useCallback(() => {
    setPermission('denied');
    setShowModal(false);
    localStorage.setItem(PERMISSION_KEY, 'denied');
  }, []);

  const resetPermission = useCallback(() => {
    localStorage.removeItem(PERMISSION_KEY);
    setPermission('checking');
    // Re-check
    setTimeout(() => {
      setPermission('prompt');
      setShowModal(true);
    }, 0);
  }, []);

  return {
    permission,
    showModal,
    setShowModal,
    handlePermissionGranted,
    handlePermissionDenied,
    resetPermission
  };
}