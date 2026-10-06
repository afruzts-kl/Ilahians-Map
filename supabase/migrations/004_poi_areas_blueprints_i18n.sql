-- =========================================================
-- ILahiaNav: POI Areas, Blueprints, i18n & Path Enhancements
-- Migration 004
-- =========================================================

-- 1. Add area/centroid/i18n columns to locations
ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS area_geojson JSONB,
  ADD COLUMN IF NOT EXISTS centroid_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS centroid_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS name_ml TEXT,
  ADD COLUMN IF NOT EXISTS description_ml TEXT,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT,
  ADD COLUMN IF NOT EXISTS aliases_ml TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS entrance_node_id TEXT REFERENCES public.path_nodes(id) ON DELETE SET NULL;

-- 2. Add blueprint columns to buildings
ALTER TABLE public.buildings
  ADD COLUMN IF NOT EXISTS blueprint_url TEXT,
  ADD COLUMN IF NOT EXISTS blueprint_bounds JSONB, -- Format: [[swLat, swLng], [neLat, neLng]]
  ADD COLUMN IF NOT EXISTS blueprint_floor TEXT,
  ADD COLUMN IF NOT EXISTS blueprint_opacity REAL DEFAULT 0.7;

-- 3. Add entrance/metadata columns to path_nodes
ALTER TABLE public.path_nodes
  ADD COLUMN IF NOT EXISTS is_entrance_for TEXT REFERENCES public.locations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_one_way BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS accessible_notes TEXT;

-- 4. Add flags to path_edges
ALTER TABLE public.path_edges
  ADD COLUMN IF NOT EXISTS is_one_way BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_accessible BOOLEAN DEFAULT TRUE;

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_locations_area ON public.locations USING GIN (area_geojson);
CREATE INDEX IF NOT EXISTS idx_locations_centroid ON public.locations(centroid_lat, centroid_lng);
CREATE INDEX IF NOT EXISTS idx_locations_name_ml ON public.locations USING GIN (name_ml gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_locations_description_ml ON public.locations USING GIN (description_ml gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_path_nodes_entrance ON public.path_nodes(is_entrance_for);
CREATE INDEX IF NOT EXISTS idx_path_edges_one_way ON public.path_edges(is_one_way);
CREATE INDEX IF NOT EXISTS idx_path_edges_accessible ON public.path_edges(is_accessible);
CREATE INDEX IF NOT EXISTS idx_buildings_blueprint ON public.buildings(blueprint_url) WHERE blueprint_url IS NOT NULL;

-- 6. Enable pg_trgm extension for Malayalam text search (run once)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =========================================================
-- VERIFICATION QUERIES (Run after migration):
-- =========================================================
-- Check locations table has new columns:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'locations' AND column_name IN
--   ('area_geojson', 'centroid_lat', 'centroid_lng', 'name_ml', 'description_ml', 'updated_by', 'updated_by_name', 'aliases_ml', 'entrance_node_id');

-- Check buildings table has new columns:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'buildings' AND column_name IN
--   ('blueprint_url', 'blueprint_bounds', 'blueprint_floor', 'blueprint_opacity');

-- Check path_nodes has new columns:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'path_nodes' AND column_name IN
--   ('is_entrance_for', 'is_one_way', 'accessible_notes');

-- Check path_edges has new columns:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'path_edges' AND column_name IN
--   ('is_one_way', 'is_accessible');

-- Test area_geojson insert:
-- INSERT INTO locations (id, name, category, latitude, longitude, area_geojson, centroid_lat, centroid_lng, name_ml, description_ml)
-- VALUES ('test-area', 'Test Area', 'academic', 10.02835, 76.59715,
--   '{"type":"Polygon","coordinates":[[[10.028,76.597],[10.029,76.597],[10.029,76.598],[10.028,76.598],[10.028,76.597]]]}',
--   10.0285, 76.5975, 'ടെസ്റ്റ് ഏരിയ', 'പരീക്ഷണ പ്രദേശം');