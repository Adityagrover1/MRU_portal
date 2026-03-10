/*
  # Add Individual Animal Tracking

  ## New Table: `animals`
  Stores individual animals with a unique tag/ID per user for identification.

  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to auth.users) - owner of the record
  - `animal_type_id` (uuid, FK to animal_types) - species of the animal
  - `tag_id` (text) - user-assigned identifier (ear tag, RFID, name-code, etc.)
  - `name` (text) - optional friendly name
  - `created_at` (timestamptz)

  ## Changes to `drug_usage_logs`
  - Adds nullable `animal_id` column (FK to animals) so each drug log can
    optionally be linked to a specific individual animal.

  ## Security
  - RLS: users can only view/insert/update/delete their own animal records.
*/

-- Create animals table
CREATE TABLE IF NOT EXISTS animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  animal_type_id uuid NOT NULL REFERENCES animal_types(id) ON DELETE RESTRICT,
  tag_id text NOT NULL,
  name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tag_id)
);

-- Enable RLS
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;

-- RLS policies for animals
CREATE POLICY "Users can view own animals"
  ON animals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own animals"
  ON animals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own animals"
  ON animals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own animals"
  ON animals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_animals_user_id ON animals(user_id);
CREATE INDEX IF NOT EXISTS idx_animals_animal_type_id ON animals(animal_type_id);

-- Add animal_id to drug_usage_logs (nullable — logs don't require an individual animal)
ALTER TABLE drug_usage_logs
  ADD COLUMN IF NOT EXISTS animal_id uuid REFERENCES animals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_drug_usage_logs_animal_id ON drug_usage_logs(animal_id);
