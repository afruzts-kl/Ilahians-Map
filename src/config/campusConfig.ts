// Centralized Campus Configuration for Ilahia College

export const CAMPUS_CONFIG = {
  name: "Ilahia College of Engineering and Technology",
  shortName: "ILahiaNav",
  tagline: "Find Your Way Around Campus",
  subTagline: "Your Campus. Your Route. Your Way.",
  location: "Mulavoor, Muvattupuzha, Kerala 686673",
  
  // Center coordinates (lat, lng)
  center: [10.02835, 76.59715] as [number, number],
  defaultZoom: 18,
  minZoom: 16,
  maxZoom: 21,
  
  // Bounding box for campus viewport boundary
  bounds: [
    [10.0240, 76.5920], // Southwest
    [10.0325, 76.6025]  // Northeast
  ] as [[number, number], [number, number]],

  // Walking routing speed in meters/second (configurable, ~4.8 km/h)
  walkingSpeedMps: 1.35,

  // GPS tolerance in meters for arrival detection
  arrivalToleranceMeters: 18,

  // Map Tile Layers
  tileLayers: {
    satellite: {
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "&copy; Esri, Maxar, Earthstar Geographics",
      maxZoom: 20
    },
    street: {
      name: "Street Map",
      url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/attributions'>CARTO</a>",
      maxZoom: 20
    },
    dark: {
      name: "Dark Map",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/attributions'>CARTO</a>",
      maxZoom: 20
    }
  }
};

export const CATEGORY_INFO: Record<string, { label: string; icon: string; color: string; badgeColor: string }> = {
  academic: {
    label: "Academic Blocks",
    icon: "GraduationCap",
    color: "#2563eb", // blue-600
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
  },
  lab: {
    label: "Laboratories",
    icon: "FlaskConical",
    color: "#7c3aed", // violet-600
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
  },
  library: {
    label: "Library",
    icon: "BookOpen",
    color: "#059669", // emerald-600
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
  },
  food: {
    label: "Food & Canteen",
    icon: "Utensils",
    color: "#ea580c", // orange-600
    badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
  },
  facility: {
    label: "Facilities & Restrooms",
    icon: "Building2",
    color: "#0891b2", // cyan-600
    badgeColor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300"
  },
  sports: {
    label: "Sports & Grounds",
    icon: "Trophy",
    color: "#16a34a", // green-600
    badgeColor: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
  },
  parking: {
    label: "Parking Areas",
    icon: "Car",
    color: "#64748b", // slate-500
    badgeColor: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
  },
  gate: {
    label: "Gates & Entrances",
    icon: "DoorOpen",
    color: "#dc2626", // red-600
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
  },
  medical: {
    label: "Health & Medical",
    icon: "HeartPulse",
    color: "#e11d48", // rose-600
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
  },
  admin: {
    label: "Administration",
    icon: "Briefcase",
    color: "#d97706", // amber-600
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
  },
  emergency: {
    label: "Emergency & Safety",
    icon: "AlertTriangle",
    color: "#b91c1c", // red-700
    badgeColor: "bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-200"
  }
};
