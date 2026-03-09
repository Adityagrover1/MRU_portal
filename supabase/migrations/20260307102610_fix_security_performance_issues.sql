/*
  # Fix Security and Performance Issues

  ## Changes Made

  1. Added Indexes for Foreign Keys
    - Create indexes on drug_id, animal_type_id, and user_id in drug_usage_logs
    - Create index on animal_type_id in mrl_limits
    - These indexes improve query performance for joins and lookups

  2. Optimized RLS Policies
    - Replace direct auth.uid() calls with (select auth.uid())
    - This prevents re-evaluation of auth functions for each row
    - Improves performance at scale

  3. RLS Policy Updates
    - Updated all policies on drug_usage_logs for better performance
    - Uses subquery pattern for auth function calls
*/

-- Add indexes for foreign keys in drug_usage_logs
CREATE INDEX IF NOT EXISTS idx_drug_usage_logs_user_id 
  ON drug_usage_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_drug_usage_logs_drug_id 
  ON drug_usage_logs(drug_id);

CREATE INDEX IF NOT EXISTS idx_drug_usage_logs_animal_type_id 
  ON drug_usage_logs(animal_type_id);

-- Add index for foreign key in mrl_limits
CREATE INDEX IF NOT EXISTS idx_mrl_limits_animal_type_id 
  ON mrl_limits(animal_type_id);

-- Drop existing policies to replace them with optimized versions
DROP POLICY IF EXISTS "Users can view own drug usage logs" ON drug_usage_logs;
DROP POLICY IF EXISTS "Users can insert own drug usage logs" ON drug_usage_logs;
DROP POLICY IF EXISTS "Users can update own drug usage logs" ON drug_usage_logs;
DROP POLICY IF EXISTS "Users can delete own drug usage logs" ON drug_usage_logs;

-- Create optimized RLS policies using subquery pattern
CREATE POLICY "Users can view own drug usage logs"
  ON drug_usage_logs FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own drug usage logs"
  ON drug_usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own drug usage logs"
  ON drug_usage_logs FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own drug usage logs"
  ON drug_usage_logs FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));
