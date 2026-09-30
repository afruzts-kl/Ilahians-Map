import { CampusLocation, CampusBuilding, PathNode, PathEdge } from '../types';

/**
 * Verified Initial Campus Reference Data for Ilahia College (ICET)
 * Center: Mulavoor, Muvattupuzha (approx 10.02835°N, 76.59715°E)
 * 
 * Note: Administrators can edit/add/delete these buildings, locations,
 * and routing paths directly through the Admin Dashboard and Map Editor,
 * or sync them with Supabase PostgreSQL.
 */

export const SEED_BUILDINGS: CampusBuilding[] = [
  {
    id: "b-main-eng",
    name: "ICET Main Academic & Admin Block",
    code: "AB-1",
    description: "Central 4-storey administrative and academic building housing Central Library, Computer Science & Engineering, and Principal's Office.",
    latitude: 10.02845,
    longitude: 76.59710,
    category: "academic",
    floors: 4,
    departments: ["Computer Science & Engineering", "Science & Humanities", "Administration"],
    polygon: [
      [10.02875, 76.59675],
      [10.02875, 76.59745],
      [10.02815, 76.59745],
      [10.02815, 76.59675]
    ]
  },
  {
    id: "b-electrical",
    name: "Electrical Department Block (EEE)",
    code: "EE-BLOCK",
    description: "Dedicated block for Electrical & Electronics Engineering, laboratories, and faculty offices.",
    latitude: 10.02785,
    longitude: 76.59640,
    category: "academic",
    floors: 3,
    departments: ["Electrical & Electronics Engineering"],
    polygon: [
      [10.02805, 76.59615],
      [10.02805, 76.59665],
      [10.02765, 76.59665],
      [10.02765, 76.59615]
    ]
  },
  {
    id: "b-mech-civil",
    name: "Mechanical & Civil Engineering Block",
    code: "MC-BLOCK",
    description: "Mechanical workshops, civil engineering laboratories, CAD/CAM labs, and lecture halls.",
    latitude: 10.02740,
    longitude: 76.59700,
    category: "academic",
    floors: 3,
    departments: ["Mechanical Engineering", "Civil Engineering"],
    polygon: [
      [10.02760, 76.59675],
      [10.02760, 76.59725],
      [10.02720, 76.59725],
      [10.02720, 76.59675]
    ]
  },
  {
    id: "b-canteen",
    name: "Main Campus Canteen & Cafeteria",
    code: "CANTEEN",
    description: "Multi-cuisine campus dining facility, student food court, snacks, and fresh juice counter.",
    latitude: 10.02890,
    longitude: 76.59780,
    category: "food",
    floors: 1,
    polygon: [
      [10.02905, 76.59765],
      [10.02905, 76.59795],
      [10.02875, 76.59795],
      [10.02875, 76.59765]
    ]
  },
  {
    id: "b-sports-ground",
    name: "Ilahia College Play Ground",
    code: "GROUND",
    description: "Standard outdoor athletic ground for football, cricket, track events, and sports tournaments.",
    latitude: 10.02930,
    longitude: 76.59640,
    category: "sports",
    polygon: [
      [10.02970, 76.59580],
      [10.02970, 76.59700],
      [10.02890, 76.59700],
      [10.02890, 76.59580]
    ]
  },
  {
    id: "b-arts-science",
    name: "Ilahia College Arts & Science Block",
    code: "AS-BLOCK",
    description: "Arts, Commerce, and Science degree programs block.",
    latitude: 10.02810,
    longitude: 76.59820,
    category: "academic",
    floors: 3,
    departments: ["Commerce", "Computer Applications", "Management Studies"],
    polygon: [
      [10.02830, 76.59800],
      [10.02830, 76.59840],
      [10.02790, 76.59840],
      [10.02790, 76.59800]
    ]
  }
];

export const SEED_LOCATIONS: CampusLocation[] = [
  // Gate & Access
  {
    id: "loc-main-gate",
    name: "Main Campus Entrance Gate",
    category: "gate",
    description: "Main security gate on college access road. Primary entry and exit for students, faculty, and visitors.",
    latitude: 10.02710,
    longitude: 76.59600,
    building: "Campus Gate",
    openingHours: "Open 24/7 (Visitors: 8:00 AM - 6:00 PM)",
    facilities: ["Security Post", "Visitor Registration", "CCTV Surveillance", "Vehicle Check"],
    isAccessible: true,
    isActive: true,
    aliases: ["main gate", "entrance", "security", "gate 1", "entry"],
    nearestNodeId: "n-main-gate"
  },
  // Administration
  {
    id: "loc-admin-office",
    name: "Administrative Office & Principal Room",
    category: "admin",
    description: "Main administrative counter, student admissions, fee payments, and Principal's office.",
    latitude: 10.02830,
    longitude: 76.59710,
    building: "ICET Main Academic & Admin Block",
    floor: "Ground Floor",
    room: "Admin Suite 101",
    openingHours: "8:30 AM - 4:30 PM (Mon-Sat)",
    facilities: ["Student Helpdesk", "Fee Counter", "Principal Chamber", "Visitor Lounge"],
    isAccessible: true,
    isActive: true,
    aliases: ["admin", "office", "principal", "fee counter", "enquiry"],
    nearestNodeId: "n-main-block-front"
  },
  // CSE Department & Labs
  {
    id: "loc-cse-dept",
    name: "Computer Science & Engineering Department (CSE)",
    category: "academic",
    description: "Head of Department (HOD) CSE, faculty cabins, department library, and student project cubicles.",
    latitude: 10.02850,
    longitude: 76.59710,
    building: "ICET Main Academic & Admin Block",
    floor: "1st Floor",
    room: "Block A - Room 204",
    openingHours: "8:30 AM - 4:30 PM",
    facilities: ["HOD Office", "Faculty Cabins", "Smart Classroom", "Department Notice Board"],
    isAccessible: true,
    isActive: true,
    aliases: ["cse", "computer science", "cs department", "hod cse"],
    nearestNodeId: "n-main-block-front"
  },
  {
    id: "loc-cse-lab-1",
    name: "CSE Software Development Lab (Lab 1)",
    category: "lab",
    description: "Modern high-speed computer programming lab equipped with Linux and Windows systems for Python, Java, and Web projects.",
    latitude: 10.02860,
    longitude: 76.59720,
    building: "ICET Main Academic & Admin Block",
    floor: "1st Floor",
    room: "Room 210",
    openingHours: "8:30 AM - 5:00 PM",
    facilities: ["High-speed Gigabit LAN", "UPS Backup", "Projector Display", "Air Conditioned"],
    isAccessible: true,
    isActive: true,
    aliases: ["cse lab", "lab 1", "computer lab", "software lab"],
    nearestNodeId: "n-main-block-north"
  },
  {
    id: "loc-cse-lab-2",
    name: "Advanced AI & Cloud Computing Lab (Lab 2)",
    category: "lab",
    description: "Specialized lab for Artificial Intelligence, Machine Learning, and Cloud development workstations.",
    latitude: 10.02865,
    longitude: 76.59700,
    building: "ICET Main Academic & Admin Block",
    floor: "2nd Floor",
    room: "Room 312",
    openingHours: "8:30 AM - 5:00 PM",
    facilities: ["GPU Workstations", "Air Conditioned", "High-speed Internet", "Presentation Screen"],
    isAccessible: true,
    isActive: true,
    aliases: ["cse lab 2", "ai lab", "cloud lab", "project lab"],
    nearestNodeId: "n-main-block-north"
  },
  // Library
  {
    id: "loc-central-library",
    name: "Central Library & Digital Resource Center",
    category: "library",
    description: "Spacious academic library with extensive collections of engineering books, journals, IEEE digital access, and reading rooms.",
    latitude: 10.02840,
    longitude: 76.59735,
    building: "ICET Main Academic & Admin Block",
    floor: "Ground & 1st Floor (East Wing)",
    room: "Library Complex",
    openingHours: "8:00 AM - 6:00 PM",
    facilities: ["Digital Library", "Reference Section", "Quiet Study Hall", "Reprography & Photocopy"],
    isAccessible: true,
    isActive: true,
    aliases: ["library", "reading room", "books", "digital library", "ieee"],
    nearestNodeId: "n-main-block-east"
  },
  // Electrical Department
  {
    id: "loc-eee-dept",
    name: "Electrical Department / ICET Electrical Block (EEE)",
    category: "academic",
    description: "Department of Electrical and Electronics Engineering, HOD room, staff rooms, and simulation software labs.",
    latitude: 10.02785,
    longitude: 76.59640,
    building: "Electrical Department Block (EEE)",
    floor: "Ground Floor",
    room: "Room EE-101",
    openingHours: "8:30 AM - 4:30 PM",
    facilities: ["HOD Chamber", "Staff Room", "Seminar Hall", "Classrooms"],
    isAccessible: true,
    isActive: true,
    aliases: ["electrical", "eee", "electrical department", "icet electrical"],
    nearestNodeId: "n-electrical-entrance"
  },
  {
    id: "loc-eee-machines-lab",
    name: "Electrical Machines & Drives Laboratory",
    category: "lab",
    description: "AC/DC machines, transformers, motor-generator sets, and heavy test benches.",
    latitude: 10.02775,
    longitude: 76.59635,
    building: "Electrical Department Block (EEE)",
    floor: "Ground Floor",
    room: "Machines Lab Annex",
    openingHours: "8:30 AM - 4:30 PM",
    facilities: ["Heavy Electrical Test Benches", "Safety Mats", "Fire Suppression"],
    isAccessible: true,
    isActive: true,
    aliases: ["machines lab", "electrical lab", "eee lab"],
    nearestNodeId: "n-electrical-entrance"
  },
  // Mechanical & Civil
  {
    id: "loc-mech-workshop",
    name: "Mechanical Engineering Central Workshops",
    category: "lab",
    description: "Carpentry, fitting, smithy, welding, and machine tool workshop equipped with lathes and shaping machines.",
    latitude: 10.02735,
    longitude: 76.59690,
    building: "Mechanical & Civil Engineering Block",
    floor: "Ground Floor",
    room: "Central Workshop",
    openingHours: "8:30 AM - 4:30 PM",
    facilities: ["Lathe Machines", "Welding Booths", "Safety Gear Unit", "Fitting Benches"],
    isAccessible: true,
    isActive: true,
    aliases: ["workshop", "mechanical workshop", "lathe", "carpentry", "mech"],
    nearestNodeId: "n-workshop-entrance"
  },
  {
    id: "loc-civil-lab",
    name: "Civil Engineering Strength of Materials Lab",
    category: "lab",
    description: "Testing facilities for universal testing machine (UTM), concrete tests, and soil mechanics.",
    latitude: 10.02745,
    longitude: 76.59715,
    building: "Mechanical & Civil Engineering Block",
    floor: "Ground Floor",
    room: "Room CE-04",
    openingHours: "8:30 AM - 4:30 PM",
    facilities: ["UTM Machine", "Compression Testing", "Soil Testing Apparatus"],
    isAccessible: true,
    isActive: true,
    aliases: ["civil lab", "utm lab", "concrete lab", "civil"],
    nearestNodeId: "n-workshop-entrance"
  },
  // Food & Dining
  {
    id: "loc-canteen",
    name: "Ilahia College Main Canteen & Cafeteria",
    category: "food",
    description: "Campus cafeteria providing breakfast, traditional Kerala lunch meals, snacks, tea, coffee, and beverages.",
    latitude: 10.02890,
    longitude: 76.59780,
    building: "Main Campus Canteen & Cafeteria",
    floor: "Ground Floor",
    openingHours: "7:30 AM - 5:30 PM",
    facilities: ["Hot Meals", "Tea & Coffee Counter", "Separate Dining Sections", "Handwash & Restrooms", "UPI Payment"],
    isAccessible: true,
    isActive: true,
    aliases: ["canteen", "cafeteria", "mess", "food", "snacks", "tea", "coffee"],
    nearestNodeId: "n-canteen-front"
  },
  // Sports
  {
    id: "loc-playground",
    name: "Ilahia College Play Ground",
    category: "sports",
    description: "Expansive outdoor athletic grounds for football matches, cricket nets, annual sports meet, and recreation.",
    latitude: 10.02930,
    longitude: 76.59640,
    building: "Ilahia College Play Ground",
    openingHours: "6:00 AM - 6:30 PM",
    facilities: ["Football Pitch", "Cricket Pitch", "Athletics Track", "Spectator Seating"],
    isAccessible: true,
    isActive: true,
    aliases: ["playground", "ground", "football ground", "sports", "cricket ground"],
    nearestNodeId: "n-ground-gate"
  },
  // Facilities & Restrooms
  {
    id: "loc-student-amenities",
    name: "Student Amenities Center & Restrooms",
    category: "facility",
    description: "Modern clean restrooms, water refill stations, student council room, and common recreation space.",
    latitude: 10.02820,
    longitude: 76.59760,
    building: "Amenities Annex",
    floor: "Ground Floor",
    openingHours: "8:00 AM - 6:00 PM",
    facilities: ["Male & Female Restrooms", "Accessible Restroom", "Pure RO Water Coolers"],
    isAccessible: true,
    isActive: true,
    aliases: ["toilet", "washroom", "restroom", "water", "amenities"],
    nearestNodeId: "n-main-block-east"
  },
  // Parking
  {
    id: "loc-main-parking",
    name: "Campus Vehicle Parking Zone",
    category: "parking",
    description: "Designated covered and open parking slots for two-wheelers and four-wheelers.",
    latitude: 10.02730,
    longitude: 76.59630,
    building: "Parking Bay A & B",
    openingHours: "Open 24/7",
    facilities: ["Two Wheeler Bay", "Car Parking", "EV Charging Point (Upcoming)"],
    isAccessible: true,
    isActive: true,
    aliases: ["parking", "bike parking", "car parking", "vehicle stand"],
    nearestNodeId: "n-parking-junction"
  },
  // Medical
  {
    id: "loc-health-center",
    name: "Campus Health & First Aid Clinic",
    category: "medical",
    description: "On-campus medical first-aid clinic with visiting nurse, emergency bed, and emergency medicine supplies.",
    latitude: 10.02825,
    longitude: 76.59695,
    building: "ICET Main Academic & Admin Block",
    floor: "Ground Floor",
    room: "Room 105",
    openingHours: "9:00 AM - 4:00 PM",
    facilities: ["First Aid", "Doctor On-Call", "Wheelchair Support", "Blood Pressure & Glucose Testing"],
    isAccessible: true,
    isActive: true,
    aliases: ["medical", "clinic", "first aid", "health center", "doctor", "emergency"],
    nearestNodeId: "n-main-block-front"
  },
  // Emergency
  {
    id: "loc-emergency-post",
    name: "Campus Emergency & Security Control Post",
    category: "emergency",
    description: "Central emergency helpline desk, campus security supervision, and immediate ambulance coordination.",
    latitude: 10.02715,
    longitude: 76.59605,
    building: "Security Main Post",
    openingHours: "Open 24/7",
    facilities: ["Campus SOS Radio", "Fire Alarm Panel", "Emergency First Responder Kit"],
    isAccessible: true,
    isActive: true,
    aliases: ["emergency", "sos", "security office", "ambulance contact", "helpline"],
    nearestNodeId: "n-main-gate"
  }
];

/**
 * Realistic Walkable Graph Network for Ilahia College Campus
 * Built for Dijkstra / A* routing with step-by-step navigation
 */
export const SEED_NODES: PathNode[] = [
  { id: "n-main-gate", name: "Main Campus Gate", latitude: 10.02710, longitude: 76.59600, isAccessible: true, type: "gate" },
  { id: "n-parking-junction", name: "Parking Bay Junction", latitude: 10.02735, longitude: 76.59630, isAccessible: true, type: "junction" },
  { id: "n-workshop-junction", name: "Workshop Road Junction", latitude: 10.02740, longitude: 76.59670, isAccessible: true, type: "junction" },
  { id: "n-workshop-entrance", name: "Mechanical & Civil Entrance", latitude: 10.02738, longitude: 76.59700, isAccessible: true, type: "building_entrance" },
  { id: "n-electrical-junction", name: "Electrical Dept Crossroad", latitude: 10.02775, longitude: 76.59640, isAccessible: true, type: "junction" },
  { id: "n-electrical-entrance", name: "Electrical Block Entrance", latitude: 10.02785, longitude: 76.59640, isAccessible: true, type: "building_entrance" },
  { id: "n-central-avenue", name: "Central Campus Avenue", latitude: 10.02800, longitude: 76.59675, isAccessible: true, type: "junction" },
  { id: "n-main-block-front", name: "ICET Main Block Portico Entrance", latitude: 10.02830, longitude: 76.59710, isAccessible: true, type: "building_entrance" },
  { id: "n-main-block-east", name: "Main Block East / Library Entrance", latitude: 10.02840, longitude: 76.59735, isAccessible: true, type: "building_entrance" },
  { id: "n-main-block-north", name: "Main Block North / CSE Labs Wing", latitude: 10.02860, longitude: 76.59710, isAccessible: true, type: "building_entrance" },
  { id: "n-canteen-path", name: "Canteen Walkway Junction", latitude: 10.02865, longitude: 76.59755, isAccessible: true, type: "junction" },
  { id: "n-canteen-front", name: "Canteen Entrance Veranda", latitude: 10.02890, longitude: 76.59780, isAccessible: true, type: "building_entrance" },
  { id: "n-ground-junction", name: "Playground Approach Road", latitude: 10.02860, longitude: 76.59640, isAccessible: true, type: "junction" },
  { id: "n-ground-gate", name: "Ilahia College Play Ground Entrance", latitude: 10.02900, longitude: 76.59640, isAccessible: true, type: "gate" }
];

export const SEED_EDGES: PathEdge[] = [
  // Gate to Parking
  { id: "e1", startNodeId: "n-main-gate", endNodeId: "n-parking-junction", distance: 42, isAccessible: true, surfaceType: "road", description: "Walk along the main entrance paved road towards parking" },
  // Parking to Electrical Junction
  { id: "e2", startNodeId: "n-parking-junction", endNodeId: "n-electrical-junction", distance: 46, isAccessible: true, surfaceType: "road", description: "Follow the inner campus road north" },
  // Parking to Workshop Junction
  { id: "e3", startNodeId: "n-parking-junction", endNodeId: "n-workshop-junction", distance: 45, isAccessible: true, surfaceType: "road", description: "Walk east along the road toward engineering workshops" },
  // Workshop Junction to Entrance
  { id: "e4", startNodeId: "n-workshop-junction", endNodeId: "n-workshop-entrance", distance: 32, isAccessible: true, surfaceType: "paved", description: "Walk straight to Mechanical and Civil workshop porch" },
  // Workshop Junction to Central Avenue
  { id: "e5", startNodeId: "n-workshop-junction", endNodeId: "n-central-avenue", distance: 68, isAccessible: true, surfaceType: "paved", description: "Walk north towards the main academic roundabout" },
  // Electrical Junction to Entrance
  { id: "e6", startNodeId: "n-electrical-junction", endNodeId: "n-electrical-entrance", distance: 15, isAccessible: true, surfaceType: "paved", description: "Enter Electrical Department porch" },
  // Electrical Junction to Central Avenue
  { id: "e7", startNodeId: "n-electrical-junction", endNodeId: "n-central-avenue", distance: 48, isAccessible: true, surfaceType: "paved", description: "Walk east along avenue towards main academic block" },
  // Central Avenue to Main Block Front
  { id: "e8", startNodeId: "n-central-avenue", endNodeId: "n-main-block-front", distance: 52, isAccessible: true, surfaceType: "paved", description: "Head northeast to the ICET Main Block portico" },
  // Main Block Front to East / Library
  { id: "e9", startNodeId: "n-main-block-front", endNodeId: "n-main-block-east", distance: 30, isAccessible: true, surfaceType: "corridor", description: "Walk along covered corridor to Central Library wing" },
  // Main Block Front to North / CSE Labs
  { id: "e10", startNodeId: "n-main-block-front", endNodeId: "n-main-block-north", distance: 35, isAccessible: true, surfaceType: "corridor", description: "Walk through central lobby towards CSE department and labs" },
  // Main Block East to Canteen Path
  { id: "e11", startNodeId: "n-main-block-east", endNodeId: "n-canteen-path", distance: 38, isAccessible: true, surfaceType: "paved", description: "Take the east garden pathway toward canteen" },
  // Main Block North to Canteen Path
  { id: "e12", startNodeId: "n-main-block-north", endNodeId: "n-canteen-path", distance: 50, isAccessible: true, surfaceType: "paved", description: "Walk east along shaded walkway" },
  // Canteen Path to Canteen Front
  { id: "e13", startNodeId: "n-canteen-path", endNodeId: "n-canteen-front", distance: 38, isAccessible: true, surfaceType: "paved", description: "Arrive at Main Canteen & Cafeteria veranda" },
  // Central Avenue to Playground Junction
  { id: "e14", startNodeId: "n-central-avenue", endNodeId: "n-ground-junction", distance: 78, isAccessible: true, surfaceType: "road", description: "Walk northwest along the college road towards sports ground" },
  // Main Block North to Playground Junction
  { id: "e15", startNodeId: "n-main-block-north", endNodeId: "n-ground-junction", distance: 75, isAccessible: true, surfaceType: "paved", description: "Walk west along the academic link path" },
  // Playground Junction to Ground Gate
  { id: "e16", startNodeId: "n-ground-junction", endNodeId: "n-ground-gate", distance: 44, isAccessible: true, surfaceType: "road", description: "Enter Ilahia College Play Ground via main gate" }
];

/**
 * Interactive New Student / Visitor Guided Tour Steps
 */
export const CAMPUS_TOUR_STEPS = [
  {
    step: 1,
    title: "Welcome to Ilahia College!",
    subtitle: "Main Entrance Gate",
    locationId: "loc-main-gate",
    description: "Welcome to Ilahia College of Engineering & Technology (ICET)! All campus journeys begin at the Main Entrance Security Gate. Show your student ID or register your vehicle here.",
    tip: "Security is open 24/7. First-year helpdesk is set up here during admission season."
  },
  {
    step: 2,
    title: "Administration & Principal's Office",
    subtitle: "ICET Main Block — Ground Floor",
    locationId: "loc-admin-office",
    description: "This is the administrative nerve center. Visit here for fee receipts, student certificates, ID card collection, and official inquiries.",
    tip: "Counters operate from 8:30 AM to 4:30 PM. Wheelchair accessible ramp available at front portico."
  },
  {
    step: 3,
    title: "Computer Science & Engineering (CSE)",
    subtitle: "ICET Main Block — 1st & 2nd Floor",
    locationId: "loc-cse-dept",
    description: "Headquarters of the CSE Department, featuring modern software development labs, high-performance computing, and faculty mentoring cabins.",
    tip: "CSE Lab 1 is on the 1st floor; Advanced AI and Cloud Lab 2 is located on the 2nd floor."
  },
  {
    step: 4,
    title: "Central Library & Digital Hub",
    subtitle: "ICET Main Block — East Wing",
    locationId: "loc-central-library",
    description: "Thousands of engineering reference books, journals, IEEE Xplore access, and peaceful reading halls with high-speed Wi-Fi.",
    tip: "Open until 6:00 PM. Reprography & scanning services are available inside."
  },
  {
    step: 5,
    title: "Electrical Department (EEE)",
    subtitle: "Electrical Block (West Wing)",
    locationId: "loc-eee-dept",
    description: "Dedicated block housing Electrical & Electronics classrooms, heavy machines lab, and power electronics facilities.",
    tip: "Right across from the central lawn, just 2 minutes walk from the main block."
  },
  {
    step: 6,
    title: "Main Campus Canteen & Cafeteria",
    subtitle: "Food & Social Hub",
    locationId: "loc-canteen",
    description: "The favorite hangout spot for students and staff. Serves delicious South Indian breakfast, lunch, snacks, fresh juices, and hot tea/coffee.",
    tip: "UPI payments and cash accepted. Separate seating sections available."
  },
  {
    step: 7,
    title: "Ilahia College Play Ground",
    subtitle: "Athletics & Sports Complex",
    locationId: "loc-playground",
    description: "Full-size football ground, cricket pitch, and athletic tracks where college sports fests, tournaments, and evening games take place.",
    tip: "Check sports room for equipment issue after 4:00 PM."
  }
];
