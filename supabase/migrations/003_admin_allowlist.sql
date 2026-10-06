-- =========================================================
-- ILahiaNav: Admin Allowlist & Authentication
-- Migration 003
-- =========================================================

-- 1. Admin emails allowlist table
CREATE TABLE IF NOT EXISTS public.admin_emails (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('superadmin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. Add updated_by columns to locations (for audit trail)
ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;

-- 3. Update is_admin() function to check admin_emails allowlist
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_emails ae
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE ae.email = p.email
    AND p.role IN ('superadmin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger on auth.users insert: create profile only if email in admin_emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.admin_emails WHERE email = NEW.email) THEN
    INSERT INTO public.profiles (user_id, name, role, avatar_url)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
      (SELECT role FROM public.admin_emails WHERE email = NEW.email),
      NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (user_id) DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = NOW();
  ELSE
    -- Non-allowlisted users: raise exception to prevent signup
    RAISE EXCEPTION 'This account is not authorised.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Storage bucket for blueprints (public read, admin write)
-- Note: Run this in Supabase Dashboard > Storage > New Bucket
-- Or use Supabase CLI: supabase storage create blueprints --public
-- SQL equivalent for reference:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('blueprints', 'blueprints', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
-- ON CONFLICT (id) DO UPDATE SET
--   public = true,
--   file_size_limit = 5242880,
--   allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

-- 6. Storage policies for blueprints bucket
-- These must be created in Supabase Dashboard > Storage > Policies
-- Or via Supabase CLI with proper policies

-- Policy: Public read access to blueprints
-- CREATE POLICY "Public read blueprints" ON storage.objects
--   FOR SELECT USING (bucket_id = 'blueprints');

-- Policy: Admin-only insert
-- CREATE POLICY "Admin write blueprints" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'blueprints' AND public.is_admin());

-- Policy: Admin-only update
-- CREATE POLICY "Admin update blueprints" ON storage.objects
--   FOR UPDATE USING (bucket_id = 'blueprints' AND public.is_admin());

-- Policy: Admin-only delete
-- CREATE POLICY "Admin delete blueprints" ON storage.objects
--   FOR DELETE USING (bucket_id = 'blueprints' AND public.is_admin());

-- 7. RLS Policies: Ensure admin-only write for core tables
-- (Public read policies already exist from 001_initial_schema.sql)

-- Buildings: Admin full access
DROP POLICY IF EXISTS "Admin All Buildings" ON public.buildings;
CREATE POLICY "Admin All Buildings" ON public.buildings FOR ALL USING (public.is_admin());

-- Locations: Admin full access
DROP POLICY IF EXISTS "Admin All Locations" ON public.locations;
CREATE POLICY "Admin All Locations" ON public.locations FOR ALL USING (public.is_admin());

-- Path Nodes: Admin full access
DROP POLICY IF EXISTS "Admin All Path Nodes" ON public.path_nodes;
CREATE POLICY "Admin All Path Nodes" ON public.path_nodes FOR ALL USING (public.is_admin());

-- Path Edges: Admin full access
DROP POLICY IF EXISTS "Admin All Path Edges" ON public.path_edges;
CREATE POLICY "Admin All Path Edges" ON public.path_edges FOR ALL USING (public.is_admin());

-- Campus Settings: Admin full access
DROP POLICY IF EXISTS "Admin All Settings" ON public.campus_settings;
CREATE POLICY "Admin All Settings" ON public.campus_settings FOR ALL USING (public.is_admin());

-- Events: Admin full access
DROP POLICY IF EXISTS "Admin All Events" ON public.events;
CREATE POLICY "Admin All Events" ON public.events FOR ALL USING (public.is_admin());

-- Categories: Admin full access
DROP POLICY IF EXISTS "Admin All Categories" ON public.categories;
CREATE POLICY "Admin All Categories" ON public.categories FOR ALL USING (public.is_admin());

-- 8. Index for admin_emails lookups
CREATE INDEX IF NOT EXISTS idx_admin_emails_role ON public.admin_emails(role);

-- =========================================================
-- SETUP INSTRUCTIONS (Run after migration):
-- =========================================================
-- 1. In Supabase Dashboard > Authentication > Providers:
--    - Enable "Email" provider
--    - Enable "Google" provider (add OAuth credentials)
--    - Set Site URL to your Vercel deployment URL
--    - Add Redirect URLs: https://your-domain.com/auth/callback
--
-- 2. In Supabase Dashboard > Storage:
--    - Create bucket "blueprints" (public: true)
--    - Set file size limit: 5MB
--    - Allowed MIME types: image/png, image/jpeg, image/webp, application/pdf
--    - Add the 4 storage policies listed above
--
-- 3. In Supabase Dashboard > Table Editor > admin_emails:
--    - Insert your admin emails:
--      INSERT INTO admin_emails (email, name, role) VALUES
--        ('admin@ilahia.edu', 'Admin User', 'superadmin'),
--        ('your-email@gmail.com', 'Your Name', 'editor');
--
-- 4. Test: Visit /admin, sign in with Google or email/password
--    Non-allowlisted users will see "This account is not authorised."