/*
  # Farm Management Portal - MRL & AMU Monitoring Schema

  ## Overview
  This migration creates tables for tracking antimicrobial drug usage in livestock 
  and monitoring Maximum Residue Limits (MRL) compliance.

  ## New Tables
  
  ### `animal_types`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Animal type name (e.g., "Cattle", "Poultry", "Swine")
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `drugs`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Drug/antimicrobial name
  - `description` (text) - Drug description/details
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `mrl_limits`
  - `id` (uuid, primary key) - Unique identifier
  - `drug_id` (uuid, foreign key) - Reference to drugs table
  - `animal_type_id` (uuid, foreign key) - Reference to animal_types table
  - `limit_value` (numeric) - MRL limit value in μg/kg or ppb
  - `unit` (text) - Unit of measurement (e.g., "μg/kg", "ppb")
  - `withdrawal_period_days` (integer) - Required withdrawal period in days
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `drug_usage_logs`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `drug_id` (uuid, foreign key) - Reference to drugs table
  - `animal_type_id` (uuid, foreign key) - Reference to animal_types table
  - `dose_amount` (numeric) - Dosage amount administered
  - `dose_unit` (text) - Dosage unit (e.g., "mg", "ml")
  - `animal_count` (integer) - Number of animals treated
  - `administration_date` (date) - Date drug was administered
  - `notes` (text) - Additional notes
  - `mrl_status` (text) - Calculated status: "safe", "warning", "exceeded"
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only view and manage their own drug usage logs
  - All users can view reference data (animal types, drugs, MRL limits)

  ## Sample Data
  - Populate with common animal types
  - Add sample drugs and MRL limits for demonstration
*/

-- Create animal_types table
CREATE TABLE IF NOT EXISTS animal_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create drugs table
CREATE TABLE IF NOT EXISTS drugs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create mrl_limits table
CREATE TABLE IF NOT EXISTS mrl_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_id uuid NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
  animal_type_id uuid NOT NULL REFERENCES animal_types(id) ON DELETE CASCADE,
  limit_value numeric NOT NULL,
  unit text DEFAULT 'μg/kg',
  withdrawal_period_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(drug_id, animal_type_id)
);

-- Create drug_usage_logs table
CREATE TABLE IF NOT EXISTS drug_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  drug_id uuid NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
  animal_type_id uuid NOT NULL REFERENCES animal_types(id) ON DELETE CASCADE,
  dose_amount numeric NOT NULL,
  dose_unit text DEFAULT 'mg',
  animal_count integer DEFAULT 1,
  administration_date date NOT NULL,
  notes text DEFAULT '',
  mrl_status text DEFAULT 'safe',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE animal_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mrl_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for animal_types (read-only for authenticated users)
CREATE POLICY "Anyone can view animal types"
  ON animal_types FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for drugs (read-only for authenticated users)
CREATE POLICY "Anyone can view drugs"
  ON drugs FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for mrl_limits (read-only for authenticated users)
CREATE POLICY "Anyone can view MRL limits"
  ON mrl_limits FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for drug_usage_logs
CREATE POLICY "Users can view own drug usage logs"
  ON drug_usage_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drug usage logs"
  ON drug_usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drug usage logs"
  ON drug_usage_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own drug usage logs"
  ON drug_usage_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample animal types
INSERT INTO animal_types (name) VALUES
  ('Cattle'),
  ('Poultry'),
  ('Pig'),
  ('Sheep'),
  ('Goat')
ON CONFLICT (name) DO NOTHING;

-- Insert sample drugs
INSERT INTO drugs (name, description) VALUES
  ('Penicillin G', 'Beta-lactam antibiotic used for bacterial infections'),
  ('Tetracycline', 'Broad-spectrum antibiotic'),
  ('Ampicillin', 'Beta-lactam antibiotic active against gram-positive and gram-negative bacteria'),
  ('Enrofloxacin', 'Fluoroquinolone antibiotic'),
  ('Streptomycin', 'Aminoglycoside antibiotic used against gram-negative bacteria')
ON CONFLICT (name) DO NOTHING;

-- Insert sample MRL limits
INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT
  d.id,
  a.id,
  CASE
    WHEN d.name = 'Penicillin G' THEN 4
    WHEN d.name = 'Tetracycline' THEN 100
    WHEN d.name = 'Ampicillin' THEN 10
    WHEN d.name = 'Enrofloxacin' THEN 100
    WHEN d.name = 'Streptomycin' THEN 600
  END,
  'μg/kg',
  CASE
    WHEN d.name = 'Penicillin G' THEN 5
    WHEN d.name = 'Tetracycline' THEN 28
    WHEN d.name = 'Ampicillin' THEN 7
    WHEN d.name = 'Enrofloxacin' THEN 14
    WHEN d.name = 'Streptomycin' THEN 14
  END
FROM drugs d
CROSS JOIN animal_types a
ON CONFLICT (drug_id, animal_type_id) DO NOTHING;