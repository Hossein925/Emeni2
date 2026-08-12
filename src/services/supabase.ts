import { createClient } from '@supabase/supabase-js';

// Supabase Client Initialization
const getSupabaseConfig = () => {
  const url = (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) ||
    import.meta.env.VITE_SUPABASE_URL ||
    'https://xyzcompany.supabase.co';
  const key = (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY__) ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummykey';
  return { url, key };
};

const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();
export const supabase = createClient(supabaseUrl, supabaseKey);
export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && supabaseUrl !== 'https://xyzcompany.supabase.co';
};

/**
 * Complete SQL Script to execute in Supabase SQL Editor
 * Cleans up old/incomplete schemas and builds complete JSONB-supported tables, policies, and buckets.
 */
export const COMPLETE_SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- SAFE CARE - HOSPITAL PATIENT SAFETY & QUALITY MANAGEMENT SYSTEM
-- COMPLETE & CLEAN SUPABASE DATABASE SETUP (LATEST FULL SCHEMAS, BUCKETS & POLICIES)
-- Copy and run this script in Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. DROP INCOMPLETE / OLD TABLES (CLEANUP PHASE - CASCADE)
-- ==============================================================================
DROP TABLE IF EXISTS public.app_store CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.error_reports CASCADE;
DROP TABLE IF EXISTS public.rca_forms CASCADE;
DROP TABLE IF EXISTS public.fmea_forms CASCADE;
DROP TABLE IF EXISTS public.safety_meetings CASCADE;
DROP TABLE IF EXISTS public.resolutions CASCADE;
DROP TABLE IF EXISTS public.checklists CASCADE;
DROP TABLE IF EXISTS public.safety_visits CASCADE;
DROP TABLE IF EXISTS public.safety_announcements CASCADE;
DROP TABLE IF EXISTS public.education_contents CASCADE;
DROP TABLE IF EXISTS public.safety_indicators CASCADE;
DROP TABLE IF EXISTS public.dept_evaluations CASCADE;
DROP TABLE IF EXISTS public.staff_evaluations CASCADE;
DROP TABLE IF EXISTS public.quiz_exams CASCADE;
DROP TABLE IF EXISTS public.quiz_results CASCADE;
DROP TABLE IF EXISTS public.ticker_messages CASCADE;
DROP TABLE IF EXISTS public.quarterly_assessments CASCADE;
DROP TABLE IF EXISTS public.dept_managers CASCADE;
DROP TABLE IF EXISTS public.staff_members CASCADE;
DROP TABLE IF EXISTS public.safety_officers CASCADE;

-- ==============================================================================
-- 3. CREATE ALL UPDATED TABLES WITH ID, PAYLOAD JSONB & UPDATED_AT
-- ==============================================================================

CREATE TABLE public.app_store (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.app_settings (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.departments (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.error_reports (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.rca_forms (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.fmea_forms (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.safety_meetings (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.resolutions (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.checklists (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.safety_visits (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.safety_announcements (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.education_contents (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.safety_indicators (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.dept_evaluations (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.staff_evaluations (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.quiz_exams (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.quiz_results (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ticker_messages (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.quarterly_assessments (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.dept_managers (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.staff_members (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.safety_officers (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. ENABLE RLS & PUBLIC RLS POLICIES FOR ALL TABLES
-- ==============================================================================
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'app_store', 'app_settings', 'users', 'departments', 'error_reports', 'rca_forms',
    'fmea_forms', 'safety_meetings', 'resolutions', 'checklists', 'safety_visits',
    'safety_announcements', 'education_contents', 'safety_indicators',
    'dept_evaluations', 'staff_evaluations', 'quiz_exams', 'quiz_results',
    'ticker_messages', 'quarterly_assessments', 'dept_managers', 'staff_members',
    'safety_officers'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Allow_All_' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true);', 'Allow_All_' || t, t);
  END LOOP;
END $$;

-- ==============================================================================
-- 5. STORAGE BUCKETS & PUBLIC STORAGE POLICIES
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('hospital-assets', 'hospital-assets', true), ('app-icons', 'app-icons', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Storage Select" ON storage.objects;
CREATE POLICY "Public Storage Select" ON storage.objects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Storage Insert" ON storage.objects;
CREATE POLICY "Public Storage Insert" ON storage.objects FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Storage Update" ON storage.objects;
CREATE POLICY "Public Storage Update" ON storage.objects FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Storage Delete" ON storage.objects;
CREATE POLICY "Public Storage Delete" ON storage.objects FOR DELETE USING (true);

SELECT 'Safe Care Supabase Database Schema & Storage Buckets successfully reset & created!' as status;
`;

export const checkSupabaseConnection = async (): Promise<{ connected: boolean; message: string }> => {
  try {
    if (!supabase) return { connected: false, message: 'کلاینت Supabase مقداردهی نشده است' };
    const { error } = await supabase.from('app_store').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return { connected: false, message: 'جدول app_store یا جداول اصلی در Supabase یافت نشد. لطفاً اسکریپت SQL را اجرا نمایید.' };
      }
      return { connected: false, message: `خطای اتصال به Supabase: ${error.message}` };
    }
    return { connected: true, message: 'ارتباط با Supabase کاملاً فعال و برقرار است.' };
  } catch (err: any) {
    return { connected: false, message: `خطا در تست اتصال: ${err.message || 'ناشناخته'}` };
  }
};
