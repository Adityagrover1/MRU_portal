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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'animals_animal_type_id_fkey';
            columns: ['animal_type_id'];
            isOneToOne: false;
            referencedRelation: 'animal_types';
            referencedColumns: ['id'];
          }
        ];
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'mrl_limits_animal_type_id_fkey';
            columns: ['animal_type_id'];
            isOneToOne: false;
            referencedRelation: 'animal_types';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mrl_limits_drug_id_fkey';
            columns: ['drug_id'];
            isOneToOne: false;
            referencedRelation: 'drugs';
            referencedColumns: ['id'];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: 'drug_usage_logs_animal_id_fkey';
            columns: ['animal_id'];
            isOneToOne: false;
            referencedRelation: 'animals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'drug_usage_logs_animal_type_id_fkey';
            columns: ['animal_type_id'];
            isOneToOne: false;
            referencedRelation: 'animal_types';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'drug_usage_logs_drug_id_fkey';
            columns: ['drug_id'];
            isOneToOne: false;
            referencedRelation: 'drugs';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
