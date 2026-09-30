import React, { useState, useCallback } from 'react';
import { useCampusLocations } from './hooks/useCampusLocations';
import { useGeolocation } from './hooks/useGeolocation';
import { useNavigation } from './hooks/useNavigation';
import { useTheme } from './hooks/useTheme';
import { CampusLocation, LocationCategory } from './types';
import { CampusMap } from './components/map/CampusMap';
import { CampusSearch } from './components/search/CampusSearch';
import { LocationDetails } from './components/locations/LocationDetails';
import { NavigationPanel } from './components/navigation/NavigationPanel';
import { Header } from './components/ui/Header';
import { BottomNav, ActiveTab } from './components/ui/BottomNav';
import { useLanguage } from './hooks/useLanguage';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { CampusTourModal } from './components/tour/CampusTourModal';
import { CampusEventsModal } from './components/events/CampusEventsModal';
import { Explore } from './pages/Explore';
import { Saved } from './pages/Saved';
import { Profile } from './pages/Profile';

export default function App() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const { lang, toggleLanguage, t } = useLanguage();
  const [isEventsOpen, setIsEventsOpen] = useState(false);

  // Campus Data
  const {
    locations,
    buildings,
    pathNodes,
    pathEdges,
    events,
    savedIds,
    savedLocations,
    isLoading,
    error: dataError,
    refresh: refreshCampusData,
    toggleSave
  } = useCampusLocations();

  // Geolocation
  const {
    location: userLocation,
    setLocationToMainGate,
    startTracking,
    setSimulatedLocation
  } = useGeolocation();

  // Navigation Engine
  const {
    destination,
    setDestination,
    isAccessibleOnly,
    setIsAccessibleOnly,
    currentRoute,
    isNavigating,
    hasArrived,
    activeStepIndex,
    routingError,
    startNavigation,
    stopNavigation,
    clearRoute
  } = useNavigation({
    userLocation,
    pathNodes,
    pathEdges,
    locations
  });

  // UI Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory | null>(null);

  // Modals & Panels
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Handlers
  const handleSelectLocation = useCallback((loc: CampusLocation) => {
    setSelectedLocation(loc);
    setActiveTab('map'); // switch to map view if in explore/saved
  }, []);

  const handleNavigateToLocation = useCallback((loc: CampusLocation) => {
    setSelectedLocation(loc);
    setDestination(loc);
    setActiveTab('map');
  }, [setDestination]);

  const handleCloseDetails = () => {
    setSelectedLocation(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100 dark:bg-navy-900 font-sans text-gray-900 dark:text-gray-100">
      {/* Offline Alert Banner */}
      <OfflineBanner />

      {/* Top Application Header */}
      <Header
        userLocation={userLocation}
        darkMode={isDark}
        onToggleDarkMode={() => setTheme(isDark ? 'light' : 'dark')}
        onStartTour={() => setIsTourOpen(true)}
        onCenterUser={startTracking}
        lang={lang}
        onToggleLanguage={toggleLanguage}
        onOpenEvents={() => setIsEventsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
        {/* TAB: EXPLORE */}
        {activeTab === 'explore' && (
          <div className="w-full h-full z-10">
            <Explore
              locations={locations}
              onSelectLocation={handleSelectLocation}
              onNavigateToLocation={handleNavigateToLocation}
              savedIds={savedIds}
              onToggleSave={toggleSave}
            />
          </div>
        )}

        {/* TAB: SAVED */}
        {activeTab === 'saved' && (
          <div className="w-full h-full z-10">
            <Saved
              savedLocations={savedLocations}
              onSelectLocation={handleSelectLocation}
              onNavigateToLocation={handleNavigateToLocation}
              onRemoveSaved={toggleSave}
              onGoToExplore={() => setActiveTab('explore')}
            />
          </div>
        )}

        {/* TAB: PROFILE / ABOUT */}
        {activeTab === 'profile' && (
          <div className="w-full h-full z-10">
            <Profile
              userLocation={userLocation}
              onResetData={() => {
                refreshCampusData();
              }}
              onStartTour={() => setIsTourOpen(true)}
              onSimulateGate={setLocationToMainGate}
            />
          </div>
        )}

        {/* TAB: MAP VIEW (Default & Primary Experience) */}
        <div
          className={`relative w-full h-full flex flex-col md:flex-row ${
            activeTab === 'map' ? 'flex' : 'hidden'
          }`}
        >
          {/* Desktop Left Sidebar Panel (hidden on mobile, visible on md+) */}
          <aside className="hidden md:flex flex-col w-[380px] lg:w-[420px] h-full bg-white dark:bg-gray-800/95 border-r border-gray-200 dark:border-gray-700/80 z-20 shadow-lg overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Search Bar */}
              <CampusSearch
                locations={locations}
                onSelectLocation={handleSelectLocation}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

              {/* Navigation Panel in Desktop Sidebar */}
              {destination && (
                <div className="mt-2">
                  <NavigationPanel
                    destination={destination}
                    route={currentRoute}
                    isNavigating={isNavigating}
                    hasArrived={hasArrived}
                    activeStepIndex={activeStepIndex}
                    isAccessibleOnly={isAccessibleOnly}
                    onToggleAccessible={() => setIsAccessibleOnly(prev => !prev)}
                    onStartNavigation={startNavigation}
                    onStopNavigation={stopNavigation}
                    onClose={clearRoute}
                    routingError={routingError}
                    onSelectStartGate={setLocationToMainGate}
                    lang={lang}
                  />
                </div>
              )}

              {/* Location Details in Desktop Sidebar */}
              {selectedLocation && !destination && (
                <div className="mt-2">
                  <LocationDetails
                    location={selectedLocation}
                    onClose={handleCloseDetails}
                    onNavigateHere={handleNavigateToLocation}
                    isSaved={savedIds.includes(selectedLocation.id)}
                    onToggleSave={toggleSave}
                    onCenterOnMap={handleSelectLocation}
                  />
                </div>
              )}

              {/* Default Welcome / Quick Places Guide in Sidebar */}
              {!selectedLocation && !destination && (
                <div className="pt-2 space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-campus-50 to-emerald-50 dark:from-campus-950/40 dark:to-emerald-950/20 border border-campus-100 dark:border-campus-900/40">
                    <h3 className="font-bold text-sm text-campus-900 dark:text-campus-200">
                      Welcome to Ilahia College
                    </h3>
                    <p className="text-xs text-campus-700 dark:text-campus-400 mt-1 leading-relaxed">
                      Select any building or place on the campus map, search above, or tap below to start a quick route.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2">
                      Popular Destinations
                    </h4>
                    <div className="space-y-1.5">
                      {locations.slice(0, 5).map(loc => (
                        <button
                          key={loc.id}
                          onClick={() => handleSelectLocation(loc)}
                          className="w-full p-2.5 rounded-xl text-left bg-gray-50 dark:bg-gray-700/40 hover:bg-campus-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {loc.name}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                            {loc.building || 'Campus'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Interactive Campus Map Canvas */}
          <main className="relative flex-1 w-full h-full">
            {/* Mobile Top Floating Search Bar (hidden on desktop) */}
            <div className="absolute top-3 left-3 right-3 z-20 md:hidden max-w-lg mx-auto">
              <CampusSearch
                locations={locations}
                onSelectLocation={handleSelectLocation}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            {/* Leaflet Map Engine */}
            <CampusMap
              locations={locations}
              buildings={buildings}
              selectedLocation={selectedLocation}
              userLocation={userLocation}
              route={currentRoute}
              onSelectLocation={handleSelectLocation}
              isDark={isDark}
            />

            {/* Mobile Bottom Sheet: Navigation Panel */}
            {destination && (
              <div className="absolute bottom-16 left-0 right-0 z-30 md:hidden max-w-md mx-auto px-2">
                <NavigationPanel
                  destination={destination}
                  route={currentRoute}
                  isNavigating={isNavigating}
                  hasArrived={hasArrived}
                  activeStepIndex={activeStepIndex}
                  isAccessibleOnly={isAccessibleOnly}
                  onToggleAccessible={() => setIsAccessibleOnly(prev => !prev)}
                  onStartNavigation={startNavigation}
                  onStopNavigation={stopNavigation}
                  onClose={clearRoute}
                  routingError={routingError}
                  onSelectStartGate={setLocationToMainGate}
                  lang={lang}
                />
              </div>
            )}

            {/* Mobile Bottom Sheet: Location Details */}
            {selectedLocation && !destination && (
              <div className="absolute bottom-16 left-0 right-0 z-30 md:hidden max-w-md mx-auto px-2">
                <LocationDetails
                  location={selectedLocation}
                  onClose={handleCloseDetails}
                  onNavigateHere={handleNavigateToLocation}
                  isSaved={savedIds.includes(selectedLocation.id)}
                  onToggleSave={toggleSave}
                  onCenterOnMap={handleSelectLocation}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        savedCount={savedLocations.length}
      />

      {/* Guided Tour Modal */}
      <CampusTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateToLocation={handleNavigateToLocation}
        locations={locations}
      />

      {/* Campus Events Modal */}
      <CampusEventsModal
        isOpen={isEventsOpen}
        onClose={() => setIsEventsOpen(false)}
        locations={locations}
        onNavigateToLocation={handleNavigateToLocation}
        lang={lang}
        events={events}
      />
    </div>
  );
}
