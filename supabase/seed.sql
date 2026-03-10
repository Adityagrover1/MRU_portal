-- Seed data for Farm Management Portal
-- Contains industry-standard MRL limits based on EU Regulation (EC) No 470/2009 and FDA standards

-- First, insert animal types
INSERT INTO animal_types (name) VALUES
  ('Cattle'),
  ('Pig'),
  ('Poultry'),
  ('Sheep'),
  ('Goat')
ON CONFLICT DO NOTHING;

-- Insert drugs
INSERT INTO drugs (name, description) VALUES
  ('Amoxicillin', 'β-lactam antibiotic used for bacterial infections'),
  ('Oxytetracycline', 'Broad-spectrum tetracycline antibiotic'),
  ('Penicillin G', 'Natural penicillin antibiotic'),
  ('Sulfadiazine', 'Sulfonamide antimicrobial agent'),
  ('Chlortetracycline', 'Tetracycline antibiotic'),
  ('Gentamicin', 'Aminoglycoside antibiotic'),
  ('Enrofloxacin', 'Fluoroquinolone antibiotic'),
  ('Metronidazole', 'Antiprotozoal and anaerobic antibacterial agent'),
  ('Tetracycline', 'Broad-spectrum antibiotic')
ON CONFLICT DO NOTHING;

-- Insert MRL limits for Amoxicillin
INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 50, 'μg/kg', 7
FROM drugs d, animal_types a
WHERE d.name = 'Amoxicillin' AND a.name IN ('Cattle', 'Pig', 'Sheep', 'Goat')
ON CONFLICT DO NOTHING;

INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 20, 'μg/kg', 3
FROM drugs d, animal_types a
WHERE d.name = 'Amoxicillin' AND a.name = 'Poultry'
ON CONFLICT DO NOTHING;

-- Insert MRL limits for Oxytetracycline
INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 100, 'μg/kg', 28
FROM drugs d, animal_types a
WHERE d.name = 'Oxytetracycline' AND a.name IN ('Cattle', 'Pig', 'Sheep', 'Goat')
ON CONFLICT DO NOTHING;

INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 100, 'μg/kg', 10
FROM drugs d, animal_types a
WHERE d.name = 'Oxytetracycline' AND a.name = 'Poultry'
ON CONFLICT DO NOTHING;

-- Insert MRL limits for Penicillin G
INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 4, 'μg/kg', 5
FROM drugs d, animal_types a
WHERE d.name = 'Penicillin G' AND a.name IN ('Cattle', 'Pig', 'Sheep', 'Goat')
ON CONFLICT DO NOTHING;

INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 10, 'μg/kg', 2
FROM drugs d, animal_types a
WHERE d.name = 'Penicillin G' AND a.name = 'Poultry'
ON CONFLICT DO NOTHING;

-- Insert MRL limits for Sulfadiazine
INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 100, 'μg/kg', 14
FROM drugs d, animal_types a
WHERE d.name = 'Sulfadiazine' AND a.name IN ('Cattle', 'Pig', 'Sheep', 'Goat')
ON CONFLICT DO NOTHING;

INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 100, 'μg/kg', 5
FROM drugs d, animal_types a
WHERE d.name = 'Sulfadiazine' AND a.name = 'Poultry'
ON CONFLICT DO NOTHING;

-- Insert MRL limits for Chlortetracycline
INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 200, 'μg/kg', 28
FROM drugs d, animal_types a
WHERE d.name = 'Chlortetracycline' AND a.name IN ('Cattle', 'Pig', 'Sheep', 'Goat')
ON CONFLICT DO NOTHING;

INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 200, 'μg/kg', 10
FROM drugs d, animal_types a
WHERE d.name = 'Chlortetracycline' AND a.name = 'Poultry'
ON CONFLICT DO NOTHING;

-- Insert MRL limits for Gentamicin
INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 100, 'μg/kg', 14
FROM drugs d, animal_types a
WHERE d.name = 'Gentamicin' AND a.name IN ('Cattle', 'Pig', 'Sheep', 'Goat')
ON CONFLICT DO NOTHING;

INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 50, 'μg/kg', 7
FROM drugs d, animal_types a
WHERE d.name = 'Gentamicin' AND a.name = 'Poultry'
ON CONFLICT DO NOTHING;

-- Insert MRL limits for Enrofloxacin
INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 100, 'μg/kg', 28
FROM drugs d, animal_types a
WHERE d.name = 'Enrofloxacin' AND a.name IN ('Cattle', 'Sheep', 'Goat')
ON CONFLICT DO NOTHING;

INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 100, 'μg/kg', 14
FROM drugs d, animal_types a
WHERE d.name = 'Enrofloxacin' AND a.name = 'Pig'
ON CONFLICT DO NOTHING;

INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 100, 'μg/kg', 10
FROM drugs d, animal_types a
WHERE d.name = 'Enrofloxacin' AND a.name = 'Poultry'
ON CONFLICT DO NOTHING;

-- Insert MRL limits for Metronidazole
INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 10, 'μg/kg', 7
FROM drugs d, animal_types a
WHERE d.name = 'Metronidazole' AND a.name IN ('Cattle', 'Pig', 'Sheep', 'Goat')
ON CONFLICT DO NOTHING;

INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 10, 'μg/kg', 5
FROM drugs d, animal_types a
WHERE d.name = 'Metronidazole' AND a.name = 'Poultry'
ON CONFLICT DO NOTHING;

-- Insert MRL limits for Tetracycline
INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 100, 'μg/kg', 28
FROM drugs d, animal_types a
WHERE d.name = 'Tetracycline' AND a.name IN ('Cattle', 'Pig', 'Sheep', 'Goat')
ON CONFLICT DO NOTHING;

INSERT INTO mrl_limits (drug_id, animal_type_id, limit_value, unit, withdrawal_period_days)
SELECT d.id, a.id, 100, 'μg/kg', 10
FROM drugs d, animal_types a
WHERE d.name = 'Tetracycline' AND a.name = 'Poultry'
ON CONFLICT DO NOTHING;

