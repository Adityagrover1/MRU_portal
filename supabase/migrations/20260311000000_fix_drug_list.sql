/*
  # Fix Drug List — Remove Unsupported Drugs, Add FSSAI-Supported Drugs

  ## Problem
  The following drugs had no FSSAI MRL data for any animal type, causing every
  drug-animal combination to be flagged as "unsupported" in the UI:
    - Sulfonamides
    - Tylosin
    - Penicillin  (bare name — the FSSAI key is "Penicillin G"; a bare "Penicillin"
                   entry causes a name-mismatch and shows as unsupported for all animals)

  ## Changes
  1. Remove all three unsupported drugs (CASCADE removes their mrl_limits rows too).
  2. Insert four drugs that have verified FSSAI MRL data covering all five animal
     types (Cattle, Pig, Poultry, Sheep, Goat):
       - Ampicillin
       - Streptomycin
       - Erythromycin
       - Neomycin
  3. Insert corresponding mrl_limits rows (FSSAI muscle-tissue values, converted
     to μg/kg) for each new drug × each animal type.

  Note: "Penicillin G" is kept as-is — it exactly matches the FSSAI_STANDARDS_MRLS
  key and is valid for all five animal types.
*/

-- 1. Remove drugs with no MRL data (CASCADE removes their mrl_limits rows)
-- 'Penicillin' (bare) does not match the FSSAI key 'Penicillin G'; remove it
-- so the DB-only entry stops triggering false "unsupported" warnings.
DELETE FROM drugs WHERE name IN ('Sulfonamides', 'Tylosin', 'Penicillin');

-- 2. Insert new supported drugs
INSERT INTO drugs (name, description) VALUES
  ('Ampicillin',    'Beta-lactam antibiotic active against gram-positive and gram-negative bacteria'),
  ('Streptomycin',  'Aminoglycoside antibiotic used against gram-negative bacteria'),
  ('Erythromycin',  'Macrolide antibiotic effective against gram-positive organisms'),
  ('Neomycin',      'Aminoglycoside antibiotic used for enteric infections')
ON CONFLICT (name) DO NOTHING;

-- 3. MRL limits for Ampicillin (FSSAI muscle limit: 0.01 mg/kg = 10 μg/kg)
INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 10, 'μg/kg', 7
FROM drugs d, animal_types a
WHERE d.name = 'Ampicillin'
  AND a.name IN ('Cattle', 'Pig', 'Poultry', 'Sheep', 'Goat')
ON CONFLICT (drug_id, animal_type_id) DO NOTHING;

-- 4. MRL limits for Streptomycin (FSSAI muscle limit: 0.6 mg/kg = 600 μg/kg)
INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 600, 'μg/kg', 14
FROM drugs d, animal_types a
WHERE d.name = 'Streptomycin'
  AND a.name IN ('Cattle', 'Pig', 'Poultry', 'Sheep', 'Goat')
ON CONFLICT (drug_id, animal_type_id) DO NOTHING;

-- 5. MRL limits for Erythromycin (FSSAI muscle limit: 0.1 mg/kg = 100 μg/kg)
INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 100, 'μg/kg', 14
FROM drugs d, animal_types a
WHERE d.name = 'Erythromycin'
  AND a.name IN ('Cattle', 'Pig', 'Poultry', 'Sheep', 'Goat')
ON CONFLICT (drug_id, animal_type_id) DO NOTHING;

-- 6. MRL limits for Neomycin (FSSAI muscle limit: 0.5 mg/kg = 500 μg/kg)
INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 500, 'μg/kg', 14
FROM drugs d, animal_types a
WHERE d.name = 'Neomycin'
  AND a.name IN ('Cattle', 'Pig', 'Poultry', 'Sheep', 'Goat')
ON CONFLICT (drug_id, animal_type_id) DO NOTHING;
