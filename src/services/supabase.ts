import { createClient } from '@supabase/supabase-js';

// Supabase Client Initialization
export const DEFAULT_SUPABASE_URL = 'https://gyumpokamojktuhewcmc.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_faeb3XI3I21H4EXRgE_KLA_3zzCjP0i';

export const getSupabaseConfig = () => {
  const env = (import.meta as any).env || {};
  const url = (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) ||
    (typeof window !== 'undefined' && localStorage.getItem('custom_supabase_url')) ||
    env.VITE_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;
  const key = (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY__) ||
    (typeof window !== 'undefined' && localStorage.getItem('custom_supabase_anon_key')) ||
    env.VITE_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;
  return { url, key };
};

let { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();
export let supabase = createClient(supabaseUrl, supabaseKey);

export const reinitializeSupabase = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('custom_supabase_url', url);
    localStorage.setItem('custom_supabase_anon_key', key);
  }
  supabaseUrl = url;
  supabaseKey = key;
  supabase = createClient(url, key);
};

export const clearCustomSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('custom_supabase_url');
    localStorage.removeItem('custom_supabase_anon_key');
  }
  const config = getSupabaseConfig();
  supabaseUrl = config.url;
  supabaseKey = config.key;
  supabase = createClient(config.url, config.key);
};

export const isSupabaseConfigured = (): boolean => {
  const current = getSupabaseConfig();
  return !!current.url && current.url.trim().length > 0 && !!current.key && current.key.trim().length > 0;
};

/**
 * Complete SQL Script to execute in Supabase SQL Editor
 * Cleans up old/incomplete schemas and builds complete JSONB-supported tables, policies, and buckets.
 */
export const COMPLETE_SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- SAFE CARE - HOSPITAL PATIENT SAFETY & QUALITY MANAGEMENT SYSTEM
-- UNIFIED & CLEAN SUPABASE DATABASE SETUP (FULL SCHEMAS, BUCKETS & POLICIES)
-- Copy and run this script in Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. DYNAMICALLY DROP ALL PREVIOUS RLS POLICIES ON PUBLIC SCHEMA TABLES
-- ==============================================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ==============================================================================
-- 3. DROP INCOMPLETE / OLD TABLES (CLEANUP PHASE - CASCADE)
-- ==============================================================================
DROP TABLE IF EXISTS public.app_store CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.indicator_defs CASCADE;
DROP TABLE IF EXISTS public.indicator_records CASCADE;
DROP TABLE IF EXISTS public.staff_evaluations CASCADE;
DROP TABLE IF EXISTS public.safety_meetings CASCADE;
DROP TABLE IF EXISTS public.checklists CASCADE;
DROP TABLE IF EXISTS public.checklist_responses CASCADE;
DROP TABLE IF EXISTS public.error_reports CASCADE;
DROP TABLE IF EXISTS public.edu_categories CASCADE;
DROP TABLE IF EXISTS public.education_contents CASCADE;
DROP TABLE IF EXISTS public.safety_scenarios CASCADE;
DROP TABLE IF EXISTS public.safety_visits CASCADE;
DROP TABLE IF EXISTS public.safety_announcements CASCADE;
DROP TABLE IF EXISTS public.quiz_exams CASCADE;
DROP TABLE IF EXISTS public.quiz_submissions CASCADE;
DROP TABLE IF EXISTS public.rca_forms CASCADE;
DROP TABLE IF EXISTS public.quarterly_assessments CASCADE;
DROP TABLE IF EXISTS public.fmea_forms CASCADE;
DROP TABLE IF EXISTS public.staff_members CASCADE;
DROP TABLE IF EXISTS public.safety_officers CASCADE;

-- Legacy table names cleanup
DROP TABLE IF EXISTS public.safety_indicators CASCADE;
DROP TABLE IF EXISTS public.dept_evaluations CASCADE;
DROP TABLE IF EXISTS public.resolutions CASCADE;
DROP TABLE IF EXISTS public.ticker_messages CASCADE;
DROP TABLE IF EXISTS public.dept_managers CASCADE;

-- ==============================================================================
-- 4. CREATE ALL 23 UNIFIED TABLES WITH ID, PAYLOAD JSONB & UPDATED_AT
-- ==============================================================================

CREATE TABLE public.app_store (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.app_settings (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.users (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.departments (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.indicator_defs (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.indicator_records (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.staff_evaluations (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.safety_meetings (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.checklists (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.checklist_responses (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.error_reports (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.edu_categories (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.education_contents (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.safety_scenarios (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.safety_visits (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.safety_announcements (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.quiz_exams (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.quiz_submissions (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.rca_forms (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.quarterly_assessments (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.fmea_forms (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.staff_members (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.safety_officers (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW());

-- ==============================================================================
-- 5. ENABLE RLS & UNIFIED PUBLIC RLS POLICIES FOR ALL TABLES
-- ==============================================================================
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'app_store', 'app_settings', 'users', 'departments', 'indicator_defs', 'indicator_records',
    'staff_evaluations', 'safety_meetings', 'checklists', 'checklist_responses', 'error_reports',
    'edu_categories', 'education_contents', 'safety_scenarios', 'safety_visits',
    'safety_announcements', 'quiz_exams', 'quiz_submissions', 'rca_forms',
    'quarterly_assessments', 'fmea_forms', 'staff_members', 'safety_officers'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true);', 'Allow_All_' || t, t);
  END LOOP;
END $$;

-- ==============================================================================
-- 6. STORAGE BUCKETS & CLEAN STORAGE POLICIES
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('hospital-assets', 'hospital-assets', true), ('app-icons', 'app-icons', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Clean existing policies on storage.objects for these buckets
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects;', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Public Read Assets" ON storage.objects FOR SELECT USING (bucket_id IN ('hospital-assets', 'app-icons'));
CREATE POLICY "Public Insert Assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('hospital-assets', 'app-icons'));
CREATE POLICY "Public Update Assets" ON storage.objects FOR UPDATE USING (bucket_id IN ('hospital-assets', 'app-icons'));
CREATE POLICY "Public Delete Assets" ON storage.objects FOR DELETE USING (bucket_id IN ('hospital-assets', 'app-icons'));

SELECT 'Safe Care Supabase Database Schema & Storage Buckets successfully reset & created!' as status;
`;

/**
 * Complete SQL Script to execute in MySQL / MariaDB (phpMyAdmin, MySQL Workbench, cPanel, DirectAdmin)
 * Creates all 23 unified tables with JSON columns, storage bucket tables, indices, and foreign keys.
 */
export const COMPLETE_MYSQL_SQL_SCRIPT = `-- ==============================================================================
-- SAFE CARE - HOSPITAL PATIENT SAFETY & QUALITY MANAGEMENT SYSTEM
-- UNIFIED MYSQL / MARIADB DATABASE SETUP (FULL TABLES, JSON & STORAGE BUCKETS)
-- Copy and run this script in phpMyAdmin, MySQL Workbench, cPanel or DirectAdmin
-- ==============================================================================

-- 1. CREATE DATABASE & SET CHARACTERSET
CREATE DATABASE IF NOT EXISTS \`safecare_db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`safecare_db\`;

-- 2. DISABLE FOREIGN KEY CHECKS & CLEANUP
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS \`app_store\`;
DROP TABLE IF EXISTS \`app_settings\`;
DROP TABLE IF EXISTS \`users\`;
DROP TABLE IF EXISTS \`departments\`;
DROP TABLE IF EXISTS \`indicator_defs\`;
DROP TABLE IF EXISTS \`indicator_records\`;
DROP TABLE IF EXISTS \`staff_evaluations\`;
DROP TABLE IF EXISTS \`safety_meetings\`;
DROP TABLE IF EXISTS \`checklists\`;
DROP TABLE IF EXISTS \`checklist_responses\`;
DROP TABLE IF EXISTS \`error_reports\`;
DROP TABLE IF EXISTS \`edu_categories\`;
DROP TABLE IF EXISTS \`education_contents\`;
DROP TABLE IF EXISTS \`safety_scenarios\`;
DROP TABLE IF EXISTS \`safety_visits\`;
DROP TABLE IF EXISTS \`safety_announcements\`;
DROP TABLE IF EXISTS \`quiz_exams\`;
DROP TABLE IF EXISTS \`quiz_submissions\`;
DROP TABLE IF EXISTS \`rca_forms\`;
DROP TABLE IF EXISTS \`quarterly_assessments\`;
DROP TABLE IF EXISTS \`fmea_forms\`;
DROP TABLE IF EXISTS \`staff_members\`;
DROP TABLE IF EXISTS \`safety_officers\`;
DROP TABLE IF EXISTS \`storage_buckets\`;
DROP TABLE IF EXISTS \`storage_objects\`;

-- Legacy table names cleanup
DROP TABLE IF EXISTS \`safety_indicators\`;
DROP TABLE IF EXISTS \`dept_evaluations\`;
DROP TABLE IF EXISTS \`resolutions\`;
DROP TABLE IF EXISTS \`ticker_messages\`;
DROP TABLE IF EXISTS \`dept_managers\`;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- 3. CREATE ALL 23 UNIFIED TABLES (JSON DATA TYPE & AUTO TIMESTAMP)
-- ==============================================================================

CREATE TABLE \`app_store\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`app_settings\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`users\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`departments\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`indicator_defs\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`indicator_records\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`staff_evaluations\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`safety_meetings\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`checklists\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`checklist_responses\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`error_reports\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`edu_categories\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`education_contents\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`safety_scenarios\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`safety_visits\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`safety_announcements\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`quiz_exams\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`quiz_submissions\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`rca_forms\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`quarterly_assessments\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`fmea_forms\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`staff_members\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`safety_officers\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`payload\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 4. STORAGE BUCKETS & ASSET TABLES FOR MYSQL / PHP BACKENDS
-- ==============================================================================

CREATE TABLE \`storage_buckets\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`is_public\` TINYINT(1) DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`storage_buckets\` (\`id\`, \`name\`, \`is_public\`) VALUES
('hospital-assets', 'hospital-assets', 1),
('app-icons', 'app-icons', 1)
ON DUPLICATE KEY UPDATE \`is_public\` = 1;

CREATE TABLE \`storage_objects\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`bucket_id\` VARCHAR(255) NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`file_path\` VARCHAR(1000) NOT NULL,
  \`mime_type\` VARCHAR(100) DEFAULT NULL,
  \`size_bytes\` BIGINT DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_bucket\` (\`bucket_id\`),
  CONSTRAINT \`fk_storage_bucket\` FOREIGN KEY (\`bucket_id\`) REFERENCES \`storage_buckets\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Safe Care MySQL / MariaDB Database Schema & Storage Tables created successfully!' AS status;
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
