export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'user';
export type SpecStatus = 'draft' | 'submitted' | 'approved';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          role: UserRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      packaging_specifications: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          status: SpecStatus;
          type_selection: Json;
          packaging_method: Json;
          marking_forms: Json;
          label_forms: Json;
          palette_label: Json;
          loading_method: Json;
          additional_request: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          status?: SpecStatus;
          type_selection?: Json;
          packaging_method?: Json;
          marking_forms?: Json;
          label_forms?: Json;
          palette_label?: Json;
          loading_method?: Json;
          additional_request?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          status?: SpecStatus;
          type_selection?: Json;
          packaging_method?: Json;
          marking_forms?: Json;
          label_forms?: Json;
          palette_label?: Json;
          loading_method?: Json;
          additional_request?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type PackagingSpecification = Database['public']['Tables']['packaging_specifications']['Row'];
export type PackagingSpecificationInsert = Database['public']['Tables']['packaging_specifications']['Insert'];
export type PackagingSpecificationUpdate = Database['public']['Tables']['packaging_specifications']['Update'];
