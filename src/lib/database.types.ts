export type Database = {
  public: {
    Tables: {
      animal_types: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      animals: {
        Row: {
          id: string;
          user_id: string;
          animal_type_id: string;
          tag_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          animal_type_id: string;
          tag_id: string;
          name?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          animal_type_id?: string;
          tag_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      drugs: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
        };
      };
      mrl_limits: {
        Row: {
          id: string;
          drug_id: string;
          animal_type_id: string;
          limit_value: number;
          unit: string;
          withdrawal_period_days: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          drug_id: string;
          animal_type_id: string;
          limit_value: number;
          unit?: string;
          withdrawal_period_days?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          drug_id?: string;
          animal_type_id?: string;
          limit_value?: number;
          unit?: string;
          withdrawal_period_days?: number;
          created_at?: string;
        };
      };
      drug_usage_logs: {
        Row: {
          id: string;
          user_id: string;
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
        };
        Insert: {
          id?: string;
          user_id: string;
          drug_id: string;
          animal_type_id: string;
          animal_id?: string | null;
          dose_amount: number;
          dose_unit?: string;
          animal_count?: number;
          administration_date: string;
          notes?: string;
          mrl_status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          drug_id?: string;
          animal_type_id?: string;
          animal_id?: string | null;
          dose_amount?: number;
          dose_unit?: string;
          animal_count?: number;
          administration_date?: string;
          notes?: string;
          mrl_status?: string;
          created_at?: string;
        };
      };
    };
  };
};
