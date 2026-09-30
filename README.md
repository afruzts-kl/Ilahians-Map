# ILahiaNav — Smart Campus Navigation System

> **"Find Your Way Around Campus"**  
> *Your Campus. Your Route. Your Way.*

**ILahiaNav** is a modern, mobile-first, production-grade campus navigation application designed specifically for students, faculty, staff, and visitors of **Ilahia College of Engineering and Technology (ICET), Mulavoor, Muvattupuzha, Kerala**.

Designed especially for **first-year students and campus newcomers**, ILahiaNav answers the fundamental question:
> *"I am somewhere inside the Ilahia campus and I need to reach a particular place. How do I get there?"*

---

## 🚀 Key Features

1. **Interactive Dual-Mode Campus Map**:
   - **High-Resolution Satellite Imagery** (Esri World Imagery) matching real-world campus aerial layouts.
   - **High-Contrast Vector Street Map** (Carto Voyager / Dark Mode).
   - Building footprints and custom POI emoji pins with category color-coding.

2. **Graph-Based Walking Routing Engine (Dijkstra / A\*)**:
   - Computes the shortest walking route between any starting point (live GPS or manual gate selection) and campus destinations.
   - Outputs accurate walking distance in meters and walking time estimate (`~X min`).
   - Generates human-friendly turn-by-turn walking instructions with compass bearings.
   - **Wheelchair / Step-Free Accessible Routing Toggle**: avoids steps and steep paths when enabled.

3. **Live GPS & Position Tracking**:
   - Uses `navigator.geolocation.watchPosition()` with accuracy ring (`±XX m`).
   - Tolerates noisy signals and handles permission-denied / off-campus states gracefully.
   - One-tap "Simulate at Main Entrance Gate" for off-campus testing or guest visitors.
   - Dynamic arrival detection with celebration banner when within campus tolerance radius.

4. **Fast Fuzzy Campus Search & Category Filters**:
   - Search by building names, departments, labs, classrooms, offices, amenities, and common aliases (e.g., `CSE`, `canteen`, `sports ground`, `library`, `admin`).
   - Category filter pills for quick discovery:
     - 🏫 Academic Blocks
     - 🧪 Laboratories
     - 📚 Central Library
     - 🍔 Food & Canteen
     - 🚻 Facilities & Restrooms
     - 🏟️ Sports & Play Ground
     - 🅿️ Parking Areas
     - 🚪 Entrance Gates
     - 🏥 Health & Medical
     - 🏢 Administration
     - 🆘 Emergency Post

5. **"New to Campus?" Guided Interactive Tour**:
   - Step-by-step walkthrough specially tailored for new students:
     `Main Gate → Admin Office → CSE Dept & Labs → Central Library → Electrical Block → Canteen → Play Ground`.
   - Includes practical senior tips and one-tap navigation to each stop.

6. **Saved Locations & Offline PWA Readiness**:
   - Bookmark frequently visited spots (classrooms, favorite canteen corner, labs).
   - Standalone Progressive Web App (`manifest.json` + `sw.js` Service Worker) with home-screen installability.
   - Seamless offline fallback: operates using cached verified seed data and localStorage even if Wi-Fi or cellular signal drops.

7. **Comprehensive Admin Management & Map Click Editor**:
   - Protected Admin Portal with Supabase Auth or instant local demo credentials.
   - Full CRUD management of locations, buildings, floor levels, room numbers, and opening hours.
   - **Interactive Admin Map Editor**: Click anywhere on the satellite canvas or drag the coordinate marker to set precise latitude/longitude.
   - **GeoJSON Export**: Export all campus GIS points for use in QGIS, ArcGIS, or OpenStreetMap.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS with custom academic palette and Dark Mode support
- **Mapping Engine**: Leaflet 1.9 with custom Leaflet markers, polyline layers, and tile layer switcher
- **Routing Engine**: Custom Dijkstra graph algorithm implemented in TypeScript (`src/services/routing.ts`)
- **Backend & Database**: Supabase PostgreSQL with Row Level Security (RLS) policies
- **Icons**: Lucide React
- **PWA**: Web App Manifest & Service Worker asset caching

---

## 📁 Project Architecture

```
Ilahians-Map/
├── public/
│   ├── favicon.png
│   ├── logo.svg
│   ├── manifest.json
│   └── sw.js                     # Offline Service Worker
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx      # Admin stats, location CRUD, path review
│   │   │   └── AdminLoginModal.tsx     # Supabase Auth / demo login
│   │   ├── locations/
│   │   │   └── LocationDetails.tsx     # Bottom sheet (mobile) / side panel (desktop)
│   │   ├── map/
│   │   │   └── CampusMap.tsx           # Leaflet map instance, layers, controls
│   │   ├── navigation/
│   │   │   └── NavigationPanel.tsx     # Turn-by-turn guidance and metrics
│   │   ├── search/
│   │   │   └── CampusSearch.tsx        # Fuzzy search & category filter chips
│   │   ├── tour/
│   │   │   └── CampusTourModal.tsx     # "New to Campus?" guided tour
│   │   └── ui/
│   │       ├── BottomNav.tsx           # Mobile navigation bar
│   │       ├── Header.tsx              # Application header & status pills
│   │       └── OfflineBanner.tsx       # Offline indicator
│   ├── config/
│   │   └── campusConfig.ts       # Centralized coordinates, bounds, tile layers
│   ├── data/
│   │   └── seedCampusData.ts     # Verified ICET locations, buildings, walking graph
│   ├── hooks/
│   │   ├── useCampusLocations.ts # Location state and search queries
│   │   ├── useGeolocation.ts     # Geolocation API watcher & simulator
│   │   ├── useNavigation.ts      # Route solver and active step tracker
│   │   └── useTheme.ts           # Dark / Light / System theme
│   ├── services/
│   │   ├── locationService.ts    # Supabase / LocalStorage data manager
│   │   ├── routing.ts            # Dijkstra shortest path & turn directions
│   │   └── supabase.ts           # Supabase client initializer
│   ├── types/
│   │   └── index.ts              # TypeScript domain types
│   ├── App.tsx                   # Master responsive application layout
│   ├── index.css                 # Tailwind directives & Leaflet styling
│   └── main.tsx                  # React DOM mount & PWA bootstrap
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Complete PostgreSQL schema with RLS
├── .env.example
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🏃 Getting Started

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended, verified on v24)
- **npm** (v9 or higher)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/afruzts-kl/Ilahians-Map.git
cd Ilahians-Map
npm install
```

### 3. Running in Development Mode
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Running a Production Build
```bash
npm run build
npm run preview
```

---

## 🔐 Environment Variables & Supabase Setup

Create a `.env` file in the root directory (based on `.env.example`):
```bash
cp .env.example .env
```

Fill in your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Applying the Database Migration
1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Open `supabase/migrations/001_initial_schema.sql`.
3. Paste the contents and run the script. This creates:
   - `profiles`
   - `buildings`
   - `locations`
   - `path_nodes`
   - `path_edges`
   - `saved_locations`
   - `categories`
   - `campus_settings`
   - Row Level Security (RLS) policies allowing public read and admin write.

> **Offline / Standalone Fallback**: If you do not have Supabase credentials configured yet, the app runs automatically with full functionality using the verified seed dataset and localStorage caching!

---

## 🗺️ How to Update Campus Coordinates & Buildings

All central geographic configuration is centralized in **`src/config/campusConfig.ts`**:
- `center`: `[10.02835, 76.59715]`
- `bounds`: Southwest and Northeast bounds restricting the viewport to Ilahia College.
- `walkingSpeedMps`: Standard walking speed (default `1.35 m/s` ~ `4.8 km/h`).

### Updating Locations via UI:
1. Click **Admin** in the header.
2. Sign in with your Supabase credentials or click **Demo Login** (`admin@ilahia.edu` / `admin123`).
3. Click **Launch Map Click Editor** to place new pins interactively on the satellite map or use **Campus Locations** to edit existing entries.
4. Changes save to localStorage and sync to Supabase when connected.

---

## 🚶 How the Walking Graph Routing Works

1. Walking paths are represented as a graph in `src/data/seedCampusData.ts`:
   - `SEED_NODES`: Key junctions, building entrances, and gates.
   - `SEED_EDGES`: Walkable segments with distance (meters), accessibility flag (`isAccessible`), and surface type (`road`, `paved`, `corridor`).
2. `findShortestPath` (`src/services/routing.ts`) runs Dijkstra's algorithm to compute the shortest path.
3. If **Accessible Route** is checked, paths with stairs or uneven surfaces are pruned from the graph.
4. `generateDirectionSteps` calculates heading changes between consecutive nodes to provide turn-by-turn guidance:
   - Bearing differences between `45°` and `135°` produce `Turn right`.
   - Bearing differences between `-45°` and `-135°` produce `Turn left`.
   - Differences close to `0°` produce `Continue straight`.

---

## 📱 Mobile-First Responsive Design

The application is rigorously optimized for small mobile viewports:
- Mobile (< 768px): Full-screen map with floating search, bottom sheets, and bottom navigation.
- Desktop (>= 768px): Split view with dedicated left control sidebar and expanded map viewport.
- Tested and verified across:
  - 320px (iPhone SE / older compact screens)
  - 375px (iPhone 12/13/Mini)
  - 390px (iPhone 14/15/16)
  - 414px (Plus / Max phones)
  - 768px (iPad / Tablets)
  - 1024px - 1440px (Laptops & Desktops)

---

## 🔮 Future Roadmap

- [ ] **Indoor Multi-Floor Navigation**: SVG floor plans for CSE labs and lecture halls.
- [ ] **QR Code Signposts**: Scanning QR plaques posted on doors to immediately calibrate user position.
- [ ] **Malayalam Language Support**: Bilingual Malayalam / English UI toggles.
- [ ] **Voice-Assisted Guidance**: Text-to-speech audio prompts for upcoming turns.
- [ ] **Live Campus Event Navigation**: Highlighting festival stages, tech fest stalls, and seminar venues.
