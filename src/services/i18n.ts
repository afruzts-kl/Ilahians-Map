export type SupportedLanguage = 'en' | 'ml';

export interface Translations {
  appName: string;
  tagline: string;
  subTagline: string;
  searchPlaceholder: string;
  allPlaces: string;
  navigateHere: string;
  saveLocation: string;
  saved: string;
  save: string;
  startNavigation: string;
  stopNavigation: string;
  walkingTime: string;
  distance: string;
  wheelchairRoute: string;
  changeStart: string;
  currentStep: string;
  turnDirections: string;
  youHaveArrived: string;
  done: string;
  voiceOn: string;
  voiceOff: string;
  campusTour: string;
  newHere: string;
  exploreTitle: string;
  exploreSubtitle: string;
  savedTitle: string;
  savedSubtitle: string;
  noSavedPlaces: string;
  popularDestinations: string;
  campusEvents: string;
  eventsSubtitle: string;
  categories: {
    academic: string;
    lab: string;
    library: string;
    food: string;
    facility: string;
    sports: string;
    parking: string;
    gate: string;
    medical: string;
    admin: string;
    emergency: string;
  };
  navigationPhrases: {
    start: string;
    straight: string;
    turnRight: string;
    turnLeft: string;
    slightRight: string;
    slightLeft: string;
    sharpRight: string;
    sharpLeft: string;
    arrived: string;
  };
  // Location Permission Modal
  locationPermissionTitle: string;
  locationPermissionSubtitle: string;
  locationPermissionDescription: string;
  locationPermissionNote: string;
  locationPermissionFeature1: string;
  locationPermissionFeature2: string;
  locationPermissionFeature3: string;
  allowLocation: string;
  denyLocation: string;
  openSettings: string;
  locationPrivacyNote: string;
  // Share Feature
  share: string;
  shareTitle: string;
  shareDescription: string;
  copyLink: string;
  copied: string;
  shareWhatsApp: string;
  shareNative: string;
  // Admin
  adminPortal: string;
  adminLogin: string;
  adminLogout: string;
  drawArea: string;
  uploadBlueprint: string;
  editPaths: string;
  validateGraph: string;
  // POI Form
  placeName: string;
  placeNameML: string;
  category: string;
  building: string;
  floor: string;
  room: string;
  latitude: string;
  longitude: string;
  description: string;
  descriptionML: string;
  openingHours: string;
  facilities: string;
  aliases: string;
  wheelchairAccessible: string;
  activeOnMap: string;
  // Blueprint Uploader
  selectBuilding: string;
  selectFloor: string;
  uploadImage: string;
  positionOnMap: string;
  alignCorners: string;
  saveBlueprint: string;
  blueprintSaved: string;
  // Path Editor
  addNode: string;
  addEdge: string;
  editMode: string;
  viewMode: string;
  nodes: string;
  edges: string;
  connected: string;
  disconnected: string;
  components: string;
  // General
  cancel: string;
  saving: string;
  savedSuccess: string;
  error: string;
  deleteConfirm: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    appName: "ILahiaNav",
    tagline: "Find Your Way Around Campus",
    subTagline: "Your Campus. Your Route. Your Way.",
    searchPlaceholder: "Search department, lab, canteen, library...",
    allPlaces: "All Places",
    navigateHere: "Navigate Here",
    saveLocation: "Save Location",
    saved: "Saved",
    save: "Save",
    startNavigation: "Start Live Navigation",
    stopNavigation: "Stop Navigation",
    walkingTime: "Walking Time",
    distance: "Distance",
    wheelchairRoute: "Wheelchair / Accessible Walkway",
    changeStart: "Change Start",
    currentStep: "Current Step",
    turnDirections: "Turn-by-Turn Directions",
    youHaveArrived: "You Have Arrived!",
    done: "Done",
    voiceOn: "Voice Guidance: ON",
    voiceOff: "Voice Guidance: OFF",
    campusTour: "Campus Tour",
    newHere: "New here?",
    exploreTitle: "Explore Campus Places",
    exploreSubtitle: "Browse departments, laboratories, libraries, canteens, and sports grounds across Ilahia College.",
    savedTitle: "Saved Locations",
    savedSubtitle: "Your quick-access bookmarks for frequent classrooms, labs, and spots.",
    noSavedPlaces: "No Saved Places Yet",
    popularDestinations: "Popular Destinations",
    campusEvents: "Campus Events",
    eventsSubtitle: "Upcoming campus fests, workshops, seminars, and sports meets.",
    categories: {
      academic: "Academic Blocks",
      lab: "Laboratories",
      library: "Central Library",
      food: "Food & Canteen",
      facility: "Facilities & Restrooms",
      sports: "Sports & Grounds",
      parking: "Parking Areas",
      gate: "Gates & Entrances",
      medical: "Health & Medical",
      admin: "Administration",
      emergency: "Emergency & Safety"
    },
    navigationPhrases: {
      start: "Start from",
      straight: "Continue straight",
      turnRight: "Turn right",
      turnLeft: "Turn left",
      slightRight: "Bear slightly right",
      slightLeft: "Bear slightly left",
      sharpRight: "Make a sharp right",
      sharpLeft: "Make a sharp left",
      arrived: "You have arrived at your destination."
    },
    // Location Permission Modal
    locationPermissionTitle: "Enable Location Access",
    locationPermissionSubtitle: "Allow ILahiaNav to access your location for the best experience",
    locationPermissionDescription: "ILahiaNav uses your location to show your position on the campus map, provide accurate walking directions, and help you navigate to any destination.",
    locationPermissionNote: "You can change this later in your browser settings.",
    locationPermissionFeature1: "See your real-time position on the map",
    locationPermissionFeature2: "Get accurate walking directions from your location",
    locationPermissionFeature3: "Find nearest facilities and emergency exits",
    allowLocation: "Allow Location Access",
    denyLocation: "Not Now",
    openSettings: "Open Browser Settings",
    locationPrivacyNote: "Your location is only used locally and never stored on our servers.",
    // Share Feature
    share: "Share",
    shareTitle: "Share Location",
    shareDescription: "Share this location with others",
    copyLink: "Copy Link",
    copied: "Copied!",
    shareWhatsApp: "Share on WhatsApp",
    shareNative: "Share via...",
    // Admin
    adminPortal: "Admin Portal",
    adminLogin: "Admin Login",
    adminLogout: "Logout",
    drawArea: "Draw POI Area",
    uploadBlueprint: "Upload Blueprint",
    editPaths: "Edit Walking Paths",
    validateGraph: "Validate Graph",
    // POI Form
    placeName: "Place Name",
    placeNameML: "Place Name (മലയാളം)",
    category: "Category",
    building: "Building / Block",
    floor: "Floor",
    room: "Room Number",
    latitude: "Latitude",
    longitude: "Longitude",
    description: "Description (English)",
    descriptionML: "Description (മലയാളം)",
    openingHours: "Opening Hours",
    facilities: "Facilities (comma-separated)",
    aliases: "Search Aliases (comma-separated)",
    wheelchairAccessible: "Wheelchair Accessible",
    activeOnMap: "Active on Map",
    // Blueprint Uploader
    selectBuilding: "Select Building",
    selectFloor: "Select Floor",
    uploadImage: "Upload Floor Plan Image",
    positionOnMap: "Position on Map",
    alignCorners: "Drag 4 corner markers to align with building footprint",
    saveBlueprint: "Save Blueprint Position",
    blueprintSaved: "Blueprint saved successfully!",
    // Path Editor
    addNode: "Add Node",
    addEdge: "Add Edge",
    editMode: "Edit/Move",
    viewMode: "View",
    nodes: "Nodes",
    edges: "Edges",
    connected: "Fully Connected",
    disconnected: "Disconnected Components",
    components: "Components",
    // General
    cancel: "Cancel",
    saving: "Saving...",
    savedSuccess: "Saved successfully!",
    error: "Error",
    deleteConfirm: "Are you sure you want to delete this?"
  },
  ml: {
    appName: "ഇലാഹിയാനവ്",
    tagline: "ക്യാമ്പസിലൂടെ എളുപ്പത്തിൽ വഴി കണ്ടെത്താം",
    subTagline: "നിങ്ങളുടെ ക്യാമ്പസ്. നിങ്ങളുടെ വഴി.",
    searchPlaceholder: "ഡിപ്പാർട്ട്മെന്റ്, ലാബ്, കാന്റീൻ, ലൈബ്രറി തിരയുക...",
    allPlaces: "എല്ലാ സ്ഥലങ്ങളും",
    navigateHere: "ഇവിടേക്ക് വഴി കാണിക്കുക",
    saveLocation: "സൂക്ഷിച്ചുവെക്കുക",
    saved: "സൂക്ഷിച്ചു",
    save: "സേവ്",
    startNavigation: "യാത്ര ആരംഭിക്കുക",
    stopNavigation: "യാത്ര അവസാനിപ്പിക്കുക",
    walkingTime: "നടക്കാനുള്ള സമയം",
    distance: "ദൂരം",
    wheelchairRoute: "സ്റ്റെപ്പുകൾ ഇല്ലാത്ത വീൽചെയർ വഴി",
    changeStart: "തുടക്ക സ്ഥലം മാറ്റുക",
    currentStep: "ഇപ്പോഴത്തെ നിർദ്ദേശം",
    turnDirections: "ഓരോ തിരിവുകളുമുള്ള ദിശാനിർദ്ദേശങ്ങൾ",
    youHaveArrived: "നിങ്ങൾ ലക്ഷ്യസ്ഥാനത്ത് എത്തിച്ചേർന്നു!",
    done: "ശരി",
    voiceOn: "വോയ്സ് ഗൈഡൻസ്: ഓൺ",
    voiceOff: "വോയ്സ് ഗൈഡൻസ്: ഓഫ്",
    campusTour: "ക്യാമ്പസ് ടൂർ",
    newHere: "പുതിയ ആളാണോ?",
    exploreTitle: "ക്യാമ്പസ് സ്ഥലങ്ങൾ അറിയാം",
    exploreSubtitle: "ഇലാഹിയാ കോളേജിലെ വിവിധ ഡിപ്പാർട്ട്മെന്റുകൾ, ലാബുകൾ, ലൈബ്രറി, കാന്റീൻ തുടങ്ങിയവ.",
    savedTitle: "സൂക്ഷിച്ച സ്ഥലങ്ങൾ",
    savedSubtitle: "നിങ്ങൾക്ക് ആവശ്യമായ പ്രധാന സ്ഥലങ്ങൾ എളുപ്പത്തിൽ കണ്ടെത്താം.",
    noSavedPlaces: "സൂക്ഷിച്ച സ്ഥലങ്ങൾ ഒന്നുമില്ല",
    popularDestinations: "പ്രധാന സ്ഥലങ്ങൾ",
    campusEvents: "ക്യാമ്പസ് ഇവന്റുകൾ",
    eventsSubtitle: "ടെക് ഫെസ്റ്റുകൾ, സെമിനാറുകൾ, സ്പോർട്സ് മത്സരങ്ങൾ.",
    categories: {
      academic: "അക്കാദമിക് ബ്ലോക്കുകൾ",
      lab: "ലബോറട്ടറികൾ",
      library: "സെൻട്രൽ ലൈബ്രറി",
      food: "ഭക്ഷണം & കാന്റീൻ",
      facility: "സൗകര്യങ്ങൾ & വിശ്രമമുറികൾ",
      sports: "സ്പോർട്സ് & ഗ്രൗണ്ട്",
      parking: "പാർക്കിംഗ് ഏരിയകൾ",
      gate: "പ്രവേശന കവാടങ്ങൾ",
      medical: "ഹെൽത്ത് & ഫസ്റ്റ് എയ്ഡ്",
      admin: "അഡ്മിനിസ്ട്രേഷൻ ഓഫീസ്",
      emergency: "അടിയന്തര സഹായം"
    },
    navigationPhrases: {
      start: "ആരംഭിക്കുക",
      straight: "നേരെ മുന്നോട്ട് പോകുക",
      turnRight: "വലത്തോട്ട് തിരിയുക",
      turnLeft: "ഇടത്തോട്ട് തിരിയുക",
      slightRight: "ചെറുതായി വലത്തോട്ട് തിരിയുക",
      slightLeft: "ചെറുതായി ഇടത്തോട്ട് തിരിയുക",
      sharpRight: "വലത്തോട്ട് കുത്തനെ തിരിയുക",
      sharpLeft: "ഇടത്തോട്ട് കുത്തനെ തിരിയുക",
      arrived: "നിങ്ങൾ ലക്ഷ്യസ്ഥാനത്ത് എത്തിച്ചേർന്നിരിക്കുന്നു."
    },
    // Location Permission Modal
    locationPermissionTitle: "ലൊക്കേഷൻ പ്രാപ്തി സന്നദ്ധമാക്കുക",
    locationPermissionSubtitle: "ILahiaNav നിങ്ങളുടെ ലൊക്കേഷൻ അറിയാൻ അനുവദിക്കുക മികച്ച അനുഭവത്തിന്",
    locationPermissionDescription: "ILahiaNav നിങ്ങളുടെ ലൊക്കേഷൻ ഉപയോഗിച്ച് ക്യാമ്പസ് മാപ്പിൽ നിങ്ങളുടെ സ്ഥാനം കാണിക്കുകയും, കൃത്യമായ നടപ്പാത നിർദ്ദേശങ്ങൾ നൽകുകയും, ഏതു ലക്ഷ്യസ്ഥാനത്തേക്കും എളുപ്പത്തിൽ നയിക്കുകയും ചെയ്യുന്നു.",
    locationPermissionNote: "ബ്രൗസർ സেটിംഗുകളിൽനിന്ന് പിന്നീട് ഇത് മാറ്റാം.",
    locationPermissionFeature1: "മാപ്പിൽ നിങ്ങളുടെ റിയൽ-ടൈം സ്ഥാനം കാണുക",
    locationPermissionFeature2: "നിങ്ങളുടെ സ്ഥാനത്തുനിന്ന് കൃത്യമായ നടപ്പാത നിർദ്ദേശങ്ങൾ ലഭിക്കുക",
    locationPermissionFeature3: "സമീപത്തുള്ള സൗകര്യങ്ങളും അടിയന്തര വഴികൾ കണ്ടെത്തുക",
    allowLocation: "ലൊക്കേഷൻ അനുവദിക്കുക",
    denyLocation: "പിന്നീട്",
    openSettings: "ബ്രൗസർ സেটിംഗ്സ് തുറക്കുക",
    locationPrivacyNote: "നിങ്ങളുടെ ലൊക്കേഷൻ മാത്രം പ്രയോജനപ്പെടുത്തുന്നു, ഞങ്ങളുടെ സെർവറുകളിൽ സംഭരിക്കാറില്ല.",
    // Share Feature
    share: "പങ്കിടുക",
    shareTitle: "സ്ഥലം പങ്കിടുക",
    shareDescription: "ഈ സ്ഥലം മറ്റുള്ളവരുമായി പങ്കിടുക",
    copyLink: "ലിങ്ക് കопി ചെയ്യുക",
    copied: "കോപ്പി ചെയ്തു!",
    shareWhatsApp: "WhatsApp-ിൽ പങ്കിടുക",
    shareNative: "പങ്കിടുക...",
    // Admin
    adminPortal: "അഡ്മിൻ പോർട്ടൽ",
    adminLogin: "അഡ്മിൻ ലോഗിൻ",
    adminLogout: "ലോഗൗട്ട്",
    drawArea: "പിഒഐ ഏരിയ വരയ്ക്കുക",
    uploadBlueprint: "ബ്ലൂപ്രിന്റ് അപ്‌ലോഡ് ചെയ്യുക",
    editPaths: "നടപ്പാതകൾ എഡിറ്റ് ചെയ്യുക",
    validateGraph: "ഗ്രാഫ് പരിശോധിക്കുക",
    // POI Form
    placeName: "സ്ഥലത്തിന്റെ പേര്",
    placeNameML: "സ്ഥലത്തിന്റെ പേര് (മലയാളം)",
    category: "വിഭാഗം",
    building: "ബിൽഡിംഗ് / ബ്ലോക്ക്",
    floor: "നില",
    room: "മുറി നമ്പർ",
    latitude: "ലാറ്റിറ്റ്യൂഡ്",
    longitude: "ലോन्गിറ്റ്യൂഡ്",
    description: "വിവരണം (English)",
    descriptionML: "വിവരണം (മലയാളം)",
    openingHours: "വേള സമയം",
    facilities: "സൗകര്യങ്ങൾ (കോമmalayalam-വേർതിരിക്കുക)",
    aliases: "തിരയൽ别名 (കോമmalayalam-വേർതിരിക്കുക)",
    wheelchairAccessible: "വീൽചെയർ പ്രാപ്തമാണ്",
    activeOnMap: "മാപ്പിൽ സജീവം",
    // Blueprint Uploader
    selectBuilding: "ബിൽഡിംഗ് തിരഞ്ഞെടുക്കുക",
    selectFloor: "നില തിരഞ്ഞെടുക്കുക",
    uploadImage: "നിലപ്ലാൻ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക",
    positionOnMap: "മാപ്പിൽ സ്ഥാനനിർദ്ദേശം ചെയ്യുക",
    alignCorners: "ബിൽഡിംഗ് ഫുട്പ്രിന്റിനൊപ്പം 4 കോർണർ മാർക്കറുകൾ വലിച്ചുകൊണ്ടുപോകുക",
    saveBlueprint: "ബ്ലൂപ്രിന്റ് സ്ഥാനം സേവ് ചെയ്യുക",
    blueprintSaved: "ബ്ലൂപ്രിന്റ് വിജയകരമായി സേവ് ചെയ്തു!",
    // Path Editor
    addNode: "നോഡ് ചേർക്കുക",
    addEdge: "എഡ്ജ് ചേർക്കുക",
    editMode: "എഡിറ്റ്/സ്ഥലം മാറ്റുക",
    viewMode: "കാണുക",
    nodes: "നോഡുകൾ",
    edges: "എഡ്ജുകൾ",
    connected: "പൂർണ്ണമായും കണക്റ്റഡ്",
    disconnected: "ഡിസ്കണക്റ്റഡ് കമ്പോനന്റുകൾ",
    components: "കമ്പോനന്റുകൾ",
    // General
    cancel: "രദ്ദാക്കുക",
    saving: "സേവ് ചെയ്യുകയാണ്...",
    savedSuccess: "വിജയകരമായി സേവ് ചെയ്തു!",
    error: "പിഴവ്",
    deleteConfirm: "ഇത് ഡിലീറ്റ് ചെയ്യാൻ ഉറപ്പാണോ?"
  }
};
