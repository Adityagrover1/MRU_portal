export interface DrugUsageLog {
  id: string;
  drug_id: string;
  animal_type_id: string;
  animal_id: string | null;
  dose_amount: number;
  dose_unit: string;
  animal_count: number;
  administration_date: string;
  notes: string;
  mrl_status: string;
  created_at: string;
  drugs: { name: string };
  animal_types: { name: string };
  animals?: { tag_id: string; name: string } | null;
}
