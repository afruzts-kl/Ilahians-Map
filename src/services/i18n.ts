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
    }
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
    }
  }
};
