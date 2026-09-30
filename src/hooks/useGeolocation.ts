import { useState, useEffect, useCallback, useRef } from 'react';
import { UserLocationState } from '../types';
import { CAMPUS_CONFIG } from '../config/campusConfig';

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    heading: null,
    speed: null,
    error: null,
    isPermissionGranted: false,
    isTracking: false,
    isSimulated: false,
    timestamp: undefined
  });

  const watchIdRef = useRef<number | null>(null);

  // Check if coordinate is approximately within college vicinity (within ~1.5 km)
  const isInsideCampusVicinity = useCallback((lat: number, lon: number) => {
    const [centerLat, centerLng] = CAMPUS_CONFIG.center;
    const latDiff = Math.abs(lat - centerLat);
    const lonDiff = Math.abs(lon - centerLng);
    // rough bounding box check
    return latDiff < 0.015 && lonDiff < 0.015;
  }, []);

  // Request & Watch GPS
  const startTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser.',
        isTracking: false
      }));
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setLocation(prev => ({ ...prev, isTracking: true, error: null }));

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, heading, speed } = position.coords;
        setLocation({
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          heading,
          speed,
          error: null,
          isPermissionGranted: true,
          isTracking: true,
          isSimulated: false,
          timestamp: position.timestamp
        });
      },
      (err) => {
        let msg = 'Unable to retrieve your location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location access is disabled. Enable location permissions to use live navigation.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'GPS signal is currently unavailable.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out.';
        }

        setLocation(prev => ({
          ...prev,
          error: msg,
          isPermissionGranted: false,
          isTracking: false
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 4000
      }
    );

    watchIdRef.current = id;
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLocation(prev => ({ ...prev, isTracking: false }));
  }, []);

  // Set manual / simulated location (e.g. for testing or when off campus)
  const setSimulatedLocation = useCallback((lat: number, lon: number, name?: string) => {
    stopTracking();
    setLocation({
      latitude: lat,
      longitude: lon,
      accuracy: 5,
      heading: 0,
      speed: 0,
      error: null,
      isPermissionGranted: true,
      isTracking: false,
      isSimulated: true,
      timestamp: Date.now()
    });
  }, [stopTracking]);

  // Set starting location to Campus Main Gate
  const setLocationToMainGate = useCallback(() => {
    setSimulatedLocation(10.02710, 76.59600, "Main Campus Entrance Gate");
  }, [setSimulatedLocation]);

  useEffect(() => {
    startTracking();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [startTracking]);

  return {
    location,
    startTracking,
    stopTracking,
    setSimulatedLocation,
    setLocationToMainGate,
    isInsideCampusVicinity
  };
}
