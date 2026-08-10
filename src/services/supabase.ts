import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.trim().length > 0 &&
  supabaseAnonKey &&
  supabaseAnonKey.trim().length > 0
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * SQL Schema for Supabase Setup:
 * 
 * -- 1. Safety Indicators Table
 * create table if not exists safety_indicators (
 *   id text primary key,
 *   department_id text,
 *   department_name text,
 *   year integer,
 *   month integer,
 *   month_name text,
 *   fall_count integer default 0,
 *   pressure_ulcer_count integer default 0,
 *   medication_error_count integer default 0,
 *   phlebitis_count integer default 0,
 *   patient_count integer default 0,
 *   bed_occupancy_rate numeric default 0,
 *   hand_hygiene_compliance numeric default 0,
 *   satisfaction_rate numeric default 0,
 *   readmission_rate numeric default 0,
 *   created_at text,
 *   updated_at text
 * );
 * 
 * -- 2. Checklists Table
 * create table if not exists checklists (
 *   id text primary key,
 *   type text,
 *   title text,
 *   category text,
 *   fields jsonb,
 *   created_at text
 * );
 * 
 * -- 3. Evaluations Table
 * create table if not exists evaluations (
 *   id text primary key,
 *   staff_name text,
 *   national_id text,
 *   department_id text,
 *   department_name text,
 *   checklist_id text,
 *   checklist_title text,
 *   total_score numeric,
 *   max_score numeric,
 *   percentage numeric,
 *   year integer,
 *   month integer,
 *   month_name text,
 *   corrective_action text,
 *   evaluated_by text,
 *   answers jsonb,
 *   created_at text
 * );
 * 
 * -- 4. Quiz Exams Table
 * create table if not exists quiz_exams (
 *   id text primary key,
 *   title text,
 *   department_id text,
 *   department_name text,
 *   time_limit_minutes integer,
 *   pass_score_percentage numeric,
 *   is_active boolean default true,
 *   questions jsonb,
 *   created_at text
 * );
 * 
 * -- 5. Quiz Submissions Table
 * create table if not exists quiz_submissions (
 *   id text primary key,
 *   exam_id text,
 *   exam_title text,
 *   staff_name text,
 *   national_id text,
 *   department_id text,
 *   department_name text,
 *   correct_count integer,
 *   wrong_count integer,
 *   total_questions integer,
 *   score_percentage numeric,
 *   is_passed boolean,
 *   answers jsonb,
 *   submitted_at text
 * );
 * 
 * -- 6. Staff Members Table
 * create table if not exists staff_members (
 *   id text primary key,
 *   full_name text,
 *   national_id text,
 *   department_id text,
 *   department_name text,
 *   position text,
 *   created_at text
 * );
 * 
 * -- 7. Departments Table
 * create table if not exists departments (
 *   id text primary key,
 *   name text,
 *   manager_name text,
 *   manager_code text,
 *   created_at text
 * );
 */
