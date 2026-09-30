-- =========================================================
-- ILahiaNav: Smart Campus Navigation System
-- Supabase PostgreSQL Schema Migration 001
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Admins, Faculty, Students)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'editor', 'superadmin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BUILDINGS
CREATE TABLE IF NOT EXISTS public.buildings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  category TEXT NOT NULL DEFAULT 'academic',
  floors INTEGER DEFAULT 1,
  departments TEXT[] DEFAULT '{}',
  image_url TEXT,
  polygon_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CAMPUS LOCATIONS / POIs
CREATE TABLE IF NOT EXISTS public.locations (
  id TEXT PRIMARY KEY,
  building_id TEXT REFERENCES public.buildings(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  floor TEXT,
  room TEXT,
  opening_hours TEXT,
  accessibility BOOLEAN DEFAULT TRUE,
  facilities TEXT[] DEFAULT '{}',
  aliases TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  nearest_node_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PATH NODES (Walking Graph Vertices)
CREATE TABLE IF NOT EXISTS public.path_nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  is_accessible BOOLEAN DEFAULT TRUE,
  type TEXT DEFAULT 'junction',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PATH EDGES (Walking Graph Walkways)
CREATE TABLE IF NOT EXISTS public.path_edges (
  id TEXT PRIMARY KEY,
  start_node_id TEXT NOT NULL REFERENCES public.path_nodes(id) ON DELETE CASCADE,
  end_node_id TEXT NOT NULL REFERENCES public.path_nodes(id) ON DELETE CASCADE,
  distance DOUBLE PRECISION NOT NULL, -- in meters
  is_accessible BOOLEAN DEFAULT TRUE,
  is_restricted BOOLEAN DEFAULT FALSE,
  has_stairs BOOLEAN DEFAULT FALSE,
  surface_type TEXT DEFAULT 'paved',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SAVED LOCATIONS (Bookmarked per user)
CREATE TABLE IF NOT EXISTS public.saved_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id TEXT REFERENCES public.locations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, location_id)
);

-- 8. CAMPUS SETTINGS & BOUNDARIES
CREATE TABLE IF NOT EXISTS public.campus_settings (
  id TEXT PRIMARY KEY DEFAULT 'ilahia_campus',
  campus_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  zoom_level INTEGER DEFAULT 18,
  boundary_data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CAMPUS EVENTS
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT,
  location_id TEXT REFERENCES public.locations(id) ON DELETE SET NULL,
  location_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'seminar' CHECK (category IN ('tech', 'sports', 'cultural', 'academic', 'placement', 'seminar')),
  organizer TEXT,
  is_upcoming BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast spatial & category search
CREATE INDEX IF NOT EXISTS idx_locations_category ON public.locations(category);
CREATE INDEX IF NOT EXISTS idx_locations_coords ON public.locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_active ON public.locations(is_active);
CREATE INDEX IF NOT EXISTS idx_path_edges_nodes ON public.path_edges(start_node_id, end_node_id);
CREATE INDEX IF NOT EXISTS idx_saved_user ON public.saved_locations(user_id);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.path_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.path_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin/editor
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('superadmin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public READ for general campus data (no login required for map exploration)
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Buildings" ON public.buildings FOR SELECT USING (true);
CREATE POLICY "Public Read Locations" ON public.locations FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Public Read Path Nodes" ON public.path_nodes FOR SELECT USING (true);
CREATE POLICY "Public Read Path Edges" ON public.path_edges FOR SELECT USING (true);
CREATE POLICY "Public Read Campus Settings" ON public.campus_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Events" ON public.events FOR SELECT USING (true);

-- Authenticated Users: Saved Locations
CREATE POLICY "Users read their own saved locations"
  ON public.saved_locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own saved locations"
  ON public.saved_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete their own saved locations"
  ON public.saved_locations FOR DELETE
  USING (auth.uid() = user_id);

-- Profiles
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Admin Full Access Policies
CREATE POLICY "Admin All Buildings" ON public.buildings FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Locations" ON public.locations FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Path Nodes" ON public.path_nodes FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Path Edges" ON public.path_edges FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Settings" ON public.campus_settings FOR ALL USING (public.is_admin());
