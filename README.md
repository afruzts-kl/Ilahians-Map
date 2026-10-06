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
   - Standalone Progressive Web App with home-screen installability.
   - Seamless offline fallback: operates using cached verified seed data and localStorage even if Wi-Fi or cellular signal drops.

7. **Comprehensive Admin Management & Map Drawing Tools**:
   - **Hidden Admin Route**: `/admin` - not linked in public UI for security.
   - **Supabase Authentication**: Google OAuth + Email/Password with admin allowlist (`admin_emails` table).
   - **Non-allowlisted users rejected**: "This account is not authorised." with auto sign-out.
   - **AdminTopBar**: Shows signed-in admin name, avatar, role (superadmin/editor) with sign-out.
   - **Draw POI Areas**: Rectangle/Polygon drawing on map using Leaflet Draw, auto-fills POI form with centroid coordinates and area GeoJSON.
   - **Bilingual POI Forms**: Full English + Malayalam fields (name_ml, description_ml) for all locations.
   - **Blueprint Floor Plan Upload**: Upload to Supabase Storage `blueprints` bucket, position with 4 draggable corner handles on satellite map.
   - **Walking Path Editor**: Add/move nodes, connect edges with snap-to-node, validate graph connectivity, handle one-way/restricted/stairs flags.
   - **Graph Validator**: Detects disconnected components, isolated nodes, and validates routing reachability.
   - **GeoJSON Export**: Export all campus GIS data for QGIS/ArcGIS/OpenStreetMap.

8. **First-Visit Location Permission Modal**:
   - Bilingual (English/Malayalam) modal explaining benefits: real-time position, accurate walking directions, nearest facilities.
   - "Allow" triggers browser geolocation API; "Not Now" defers with settings link.
   - Persisted in localStorage v2; one-time prompt on first visit.

9. **Complete Malayalam i18n (Bilingual EN/ML)**:
   - All UI strings translated via `TRANSLATIONS` dictionary in `src/services/i18n.ts`.
   - **Noto Sans Malayalam** Google Font with `display=swap` for optimal rendering.
   - Dynamic `html lang="ml"` attribute for accessibility.
   - Font styles: line-height ≥ 1.6, no letter-spacing, no uppercase transforms for Malayalam.
   - Search matches Malayalam text + English aliases.
   - Voice guidance: Malayalam phrases for turn-by-turn; English fallback with toast notice.

10. **PWA / Mobile-First Quality**:
    - **vite-plugin-pwa** auto-generates Service Worker with runtime caching (Google Fonts, OSM tiles, Leaflet assets).
    - `100dvh` full-screen layout, `viewport-fit=cover`, safe-area insets for notches.
    - 44px minimum touch targets, 16px input font size to prevent iOS zoom.
    - Bottom nav bar, bottom sheet modals, floating action buttons.
    - Install prompt with custom "Add to Home Screen" banner.

11. **Share Feature (Web Share API + Deep Links)**:
    - Native `navigator.share()` with clipboard fallback + toast confirmation.
    - WhatsApp deep link share option.
    - **Deep Link Formats**: `/?poi=<location-id>` and `/p/<id>`.
    - **Open Graph meta tags** in `index.html` for social previews.
    - App handles deep links on load: flies to POI, opens details panel.

12. **Campus Events Modal**:
    - Fetches events from Supabase `events` table.
    - Category tags, date/time, organizer, navigate-to-location button.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS with custom academic palette and Dark Mode support
- **Mapping Engine**: Leaflet 1.9 with custom markers, polyline layers, tile layer switcher
- **Drawing Tools**: Leaflet Draw for polygon/rectangle/edge editing
- **Routing Engine**: Custom Dijkstra graph algorithm implemented in TypeScript (`src/services/routing.ts`)
- **Backend & Database**: Supabase PostgreSQL with Row Level Security (RLS) policies
- **Authentication**: Supabase Auth (Google OAuth + Email/Password) with admin allowlist
- **Storage**: Supabase Storage `blueprints` bucket for floor plan images
- **Icons**: Lucide React
- **PWA**: vite-plugin-pwa with Workbox for Service Worker generation
- **i18n**: Custom `useLanguage` hook with bilingual dictionary
- **Voice**: Web Speech API with Malayalam/English phrase dictionary

---

## 📁 Project Architecture

```
Ilahians-Map/
├── public/
│   ├── favicon.png
│   ├── logo.svg
│   ├── manifest.json
│   ├── pwa-192.png
│   ├── pwa-512.png
│   └── og-image.png
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx      # Admin stats, location CRUD, path review, blueprints
│   │   │   ├── AdminTopBar.tsx         # Signed-in admin info + sign out
│   │   │   ├── MapDrawTool.tsx         # Rectangle/Polygon drawing with Leaflet Draw
│   │   │   ├── POIForm.tsx             # Bilingual POI form (EN/ML)
│   │   │   ├── BlueprintUploader.tsx   # Upload + position blueprint with corner handles
│   │   │   └── PathEditor.tsx          # Node/Edge editor with graph validation
│   │   ├── locations/
│   │   │   └── LocationDetails.tsx     # Bottom sheet with Share button
│   │   ├── map/
│   │   │   └── CampusMap.tsx           # Leaflet map, blueprint overlays, layers
│   │   ├── navigation/
│   │   │   └── NavigationPanel.tsx     # Turn-by-turn guidance and metrics
│   │   ├── search/
│   │   │   └── CampusSearch.tsx        # Fuzzy search & category filter chips
│   │   ├── tour/
│   │   │   └── CampusTourModal.tsx     # "New to Campus?" guided tour
│   │   └── ui/
│   │       ├── Header.tsx              # Application header & status pills
│   │       ├── BottomNav.tsx           # Mobile navigation bar
│   │       ├── OfflineBanner.tsx       # Offline indicator
│   │       ├── ShareButton.tsx         # Web Share API + WhatsApp + Copy
│   │       └── LocationPermissionModal.tsx # First-visit GPS permission
│   ├── config/
│   │   └── campusConfig.ts       # Centralized coordinates, bounds, tile layers
│   ├── data/
│   │   └── seedCampusData.ts     # Verified ICET locations, buildings, walking graph
│   ├── hooks/
│   │   ├── useAdminAuth.ts       # Admin authentication state
│   │   ├── useCampusLocations.ts # Location state and search queries
│   │   ├── useGeolocation.ts     # Geolocation API watcher & simulator
│   │   ├── useLanguage.ts        # Bilingual i18n (EN/ML) with html lang
│   │   ├── useLocationPermission.ts # First-visit permission modal
│   │   ├── useNavigation.ts      # Route solver with disconnected graph handling
│   │   └── useTheme.ts           # Dark / Light / System theme
│   ├── services/
│   │   ├── i18n.ts               # Translation dictionary (EN + ML)
│   │   ├── locationService.ts    # Supabase / LocalStorage data manager
│   │   ├── routing.ts            # Dijkstra + graph validation
│   │   ├── supabase.ts           # Supabase client initializer
│   │   └── voiceGuidance.ts      # Malayalam/English voice phrases
│   ├── types/
│   │   └── index.ts              # TypeScript domain types
│   ├── pages/
│   │   ├── AdminLoginPage.tsx    # Full-page /admin login
│   │   ├── Explore.tsx
│   │   ├── Saved.tsx
│   │   └── Profile.tsx
│   ├── App.tsx                   # Master responsive application layout
│   ├── index.css                 # Tailwind + Malayalam font styles
│   └── main.tsx                  # React DOM mount & PWA bootstrap
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql     # Core tables, RLS, is_admin()
│       ├── 003_admin_allowlist.sql    # Admin emails, trigger, storage bucket
│       └── 004_poi_areas_blueprints_i18n.sql # Area GeoJSON, ML fields, blueprints, path flags
├── .env.example
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🏃 Getting Started

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
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
# Copy environment example
cp .env.example .env

# Edit .env with your Supabase credentials
# VITE_SUPABASE_URL=https://your-project-id.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key-here

npm run dev
```
Open your browser at `http://localhost:3000`.

> **Note**: Admin features require Supabase to be configured. Without Supabase, the map shows an empty state ("No locations added yet").

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

### Applying the Database Migrations
1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Run `supabase/migrations/001_initial_schema.sql` - Creates core tables, RLS policies, and `is_admin()` function.
3. Run `supabase/migrations/003_admin_allowlist.sql` - Creates admin allowlist, updates `is_admin()`, adds storage bucket for blueprints, and trigger for admin-only signup.
4. Run `supabase/migrations/004_poi_areas_blueprints_i18n.sql` - Adds area GeoJSON, centroid, Malayalam fields, blueprint columns, and path graph enhancements.

### Admin Setup (Required for Admin Features)
1. In **Supabase Dashboard > Authentication > Providers**:
   - Enable **Email** provider (for email/password login)
   - Enable **Google** provider (add OAuth credentials from Google Cloud Console)
   - Set **Site URL** to your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - Add **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

2. In **Supabase Dashboard > Storage**:
   - Create bucket named `blueprints` (public: true)
   - Set file size limit: 10MB
   - Allowed MIME types: `image/png`, `image/jpeg`, `image/webp`
   - Add 4 storage policies (see `003_admin_allowlist.sql` comments)

3. In **Supabase Dashboard > Table Editor > admin_emails**:
   - Insert your admin emails:
   ```sql
   INSERT INTO admin_emails (email, name, role) VALUES
     ('admin@ilahia.edu', 'Admin User', 'superadmin'),
     ('your-email@gmail.com', 'Your Name', 'editor');
   ```

4. Test admin access: Visit `/admin` (hidden route), sign in with Google or email/password.
   - Non-allowlisted users will see "This account is not authorised."

> **Important**: The app no longer has a demo/fallback mode. Supabase must be configured for admin features to work. Public map browsing works without Supabase (uses empty state).

---

## 🗺️ How to Update Campus Coordinates & Buildings

All central geographic configuration is centralized in **`src/config/campusConfig.ts`**:
- `center`: `[10.02835, 76.59715]`
- `bounds`: Southwest and Northeast bounds restricting the viewport to Ilahia College.
- `walkingSpeedMps`: Standard walking speed (default `1.35 m/s` ~ `4.8 km/h`).

### Updating Locations via UI:
1. Navigate to `/admin` (hidden route - not linked in public UI).
2. Sign in with Google OAuth or email/password (must be in `admin_emails` allowlist).
3. Use the **Draw Area** tool to create POIs by drawing on the satellite map.
4. Use the **Paths** tab to draw walking routes for navigation.
5. Use the **Blueprints** tab to upload and position floor plans.
6. Changes sync to Supabase immediately (admin-only write access via RLS).

---

## 🚶 How the Walking Graph Routing Works

1. Walking paths are represented as a graph:
   - **Nodes**: Key junctions, building entrances, and gates (stored in `path_nodes` table).
   - **Edges**: Walkable segments with distance (meters), accessibility flag (`isAccessible`), stairs flag (`hasStairs`), surface type (`paved`, `corridor`, `stairs`), one-way (`isOneWay`), restricted (`isRestricted`).
2. `findShortestPath` (`src/services/routing.ts`) runs Dijkstra's algorithm to compute the shortest path.
3. If **Accessible Route** is checked, paths with stairs or uneven surfaces are pruned from the graph.
4. `generateDirectionSteps` calculates heading changes between consecutive nodes to provide turn-by-turn guidance:
   - Bearing differences between `45°` and `135°` produce `Turn right`.
   - Bearing differences between `-45°` and `-135°` produce `Turn left`.
   - Differences close to `0°` produce `Continue straight`.
5. **Graph Validation** (`validateGraphConnectivity`): Detects disconnected components and isolated nodes. Used in admin Path Editor and navigation error messaging.

---

## 🌐 Malayalam Localization (i18n)

All UI strings are in `src/services/i18n.ts`:
- **Language Toggle**: Tap the globe icon in header to switch EN ↔ ML.
- **Font**: Noto Sans Malayalam loaded from Google Fonts (`display=swap`).
- **RTL/LTR**: Malayalam is LTR but uses complex shaping; `line-height: 1.6`, no `letter-spacing`, no `text-transform: uppercase`.
- **Search**: Matches both Malayalam names/descriptions and English aliases.
- **Voice Guidance**: Malayalam phrases for turn-by-turn; if browser Malayalam TTS unavailable, falls back to English with toast notice.
- **Admin Forms**: All POI/Blueprint forms include Malayalam fields (`name_ml`, `description_ml`).

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

### PWA Installation
- Visit the deployed site on mobile.
- Browser will prompt "Add to Home Screen" or use menu → "Install App".
- App runs standalone with splash screen, offline caching, and native-like feel.

---

## 🔗 Share & Deep Linking

- **Share Button**: In location details panel (desktop sidebar / mobile bottom sheet).
- **Native Share**: Uses `navigator.share()` with title, text, and deep link URL.
- **Fallback**: Copy to clipboard with toast confirmation ("Copied!").
- **WhatsApp**: Opens `wa.me` with pre-filled message.
- **Deep Link Formats**:
  - `https://your-app.vercel.app/?poi=<location-id>`
  - `https://your-app.vercel.app/p/<location-id>`
- **Open Graph**: Meta tags in `index.html` for social media previews.
- **Vercel SPA Rewrite**: `vercel.json` handles `/p/<id>` routing.

---

## 📦 Deployment (Vercel)

1. Push to GitHub.
2. Import in Vercel.
3. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy.
5. Vercel auto-detects Vite + React, runs `npm run build`, serves from `dist/`.

The `vercel.json` includes SPA rewrite rules for deep links (`/p/:id` → `/`).

---

## 🔮 Future Roadmap

- [ ] **Indoor Multi-Floor Navigation**: SVG floor plans for CSE labs and lecture halls.
- [ ] **QR Code Signposts**: Scanning QR plaques posted on doors to immediately calibrate user position.
- [ ] **Real-time Crowd Data**: Integration with campus Wi-Fi AP data for live occupancy.
- [ ] **Accessibility Audit**: WCAG 2.1 AA compliance testing with screen readers.
- [ ] **Analytics Dashboard**: Admin panel for route popularity, POI visits, search queries.

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Ilahia College of Engineering and Technology** - For campus data and support.
- **OpenStreetMap Contributors** - For map data foundations.
- **Leaflet**, **Supabase**, **Vite**, **Tailwind CSS**, **Lucide** - Open source libraries that make this possible.

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
# Copy environment example
cp .env.example .env

# Edit .env with your Supabase credentials
# VITE_SUPABASE_URL=https://your-project-id.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key-here

npm run dev
```
Open your browser at `http://localhost:3000`.

> **Note**: Admin features require Supabase to be configured. Without Supabase, the map shows an empty state ("No locations added yet").

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

### Applying the Database Migrations
1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Run `supabase/migrations/001_initial_schema.sql` - Creates core tables, RLS policies, and `is_admin()` function.
3. Run `supabase/migrations/003_admin_allowlist.sql` - Creates admin allowlist, updates `is_admin()`, adds storage bucket for blueprints, and trigger for admin-only signup.
4. Run `supabase/migrations/004_poi_areas_blueprints_i18n.sql` - Adds area GeoJSON, centroid, Malayalam fields, blueprint columns, and path graph enhancements.

### Admin Setup (Required for Admin Features)
1. In **Supabase Dashboard > Authentication > Providers**:
   - Enable **Email** provider (for email/password login)
   - Enable **Google** provider (add OAuth credentials from Google Cloud Console)
   - Set **Site URL** to your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - Add **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

2. In **Supabase Dashboard > Storage**:
   - Create bucket named `blueprints` (public: true)
   - Set file size limit: 5MB
   - Allowed MIME types: `image/png`, `image/jpeg`, `image/webp`, `application/pdf`
   - Add 4 storage policies (see `003_admin_allowlist.sql` comments)

3. In **Supabase Dashboard > Table Editor > admin_emails**:
   - Insert your admin emails:
   ```sql
   INSERT INTO admin_emails (email, name, role) VALUES
     ('admin@ilahia.edu', 'Admin User', 'superadmin'),
     ('your-email@gmail.com', 'Your Name', 'editor');
   ```

4. Test admin access: Visit `/admin` (hidden route), sign in with Google or email/password.
   - Non-allowlisted users will see "This account is not authorised."

> **Important**: The app no longer has a demo/fallback mode. Supabase must be configured for admin features to work. Public map browsing works without Supabase (uses empty state).

---

## 🗺️ How to Update Campus Coordinates & Buildings

All central geographic configuration is centralized in **`src/config/campusConfig.ts`**:
- `center`: `[10.02835, 76.59715]`
- `bounds`: Southwest and Northeast bounds restricting the viewport to Ilahia College.
- `walkingSpeedMps`: Standard walking speed (default `1.35 m/s` ~ `4.8 km/h`).

### Updating Locations via UI:
1. Navigate to `/admin` (hidden route - not linked in public UI).
2. Sign in with Google OAuth or email/password (must be in `admin_emails` allowlist).
3. Use the **Draw Area** tool to create POIs by drawing on the satellite map.
4. Use the **Paths** tab to draw walking routes for navigation.
5. Use the **Buildings** tab to upload and position blueprint floor plans.
6. Changes sync to Supabase immediately (admin-only write access via RLS).

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
