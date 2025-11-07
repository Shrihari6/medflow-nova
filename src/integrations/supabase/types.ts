export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bills: {
        Row: {
          amount: number
          bill_number: string
          created_at: string
          date: string
          description: string
          id: string
          paid_date: string | null
          patient_id: string
          status: Database["public"]["Enums"]["bill_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          bill_number: string
          created_at?: string
          date?: string
          description: string
          id?: string
          paid_date?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["bill_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          bill_number?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          paid_date?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["bill_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          availability: string | null
          created_at: string
          department: string
          email: string
          employee_id: string
          experience_years: number
          id: string
          patient_count: number
          phone: string
          qualification: string
          rating: number | null
          schedule: string | null
          specialization: string
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          created_at?: string
          department: string
          email: string
          employee_id: string
          experience_years: number
          id?: string
          patient_count?: number
          phone: string
          qualification: string
          rating?: number | null
          schedule?: string | null
          specialization: string
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          created_at?: string
          department?: string
          email?: string
          employee_id?: string
          experience_years?: number
          id?: string
          patient_count?: number
          phone?: string
          qualification?: string
          rating?: number | null
          schedule?: string | null
          specialization?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          admission_date: string
          age: number
          allergies: string[] | null
          assigned_doctor_id: string | null
          blood_type: string | null
          condition: string
          created_at: string
          department: string
          discharge_date: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string
          gender: string
          id: string
          medications: string[] | null
          notes: string | null
          patient_id: string
          phone: string | null
          room_id: string | null
          status: Database["public"]["Enums"]["patient_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          admission_date?: string
          age: number
          allergies?: string[] | null
          assigned_doctor_id?: string | null
          blood_type?: string | null
          condition: string
          created_at?: string
          department: string
          discharge_date?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name: string
          gender: string
          id?: string
          medications?: string[] | null
          notes?: string | null
          patient_id: string
          phone?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          admission_date?: string
          age?: number
          allergies?: string[] | null
          assigned_doctor_id?: string | null
          blood_type?: string | null
          condition?: string
          created_at?: string
          department?: string
          discharge_date?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string
          gender?: string
          id?: string
          medications?: string[] | null
          notes?: string | null
          patient_id?: string
          phone?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          created_at: string
          floor: number
          id: string
          is_occupied: boolean
          room_number: string
          room_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          floor: number
          id?: string
          is_occupied?: boolean
          room_number: string
          room_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          floor?: number
          id?: string
          is_occupied?: boolean
          room_number?: string
          room_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          department: string
          email: string
          employee_id: string
          id: string
          joined_date: string
          phone: string
          role: string
          salary: number | null
          shift: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department: string
          email: string
          employee_id: string
          id?: string
          joined_date?: string
          phone: string
          role: string
          salary?: number | null
          shift?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string
          email?: string
          employee_id?: string
          id?: string
          joined_date?: string
          phone?: string
          role?: string
          salary?: number | null
          shift?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "doctor" | "staff" | "patient"
      bill_status: "paid" | "pending" | "overdue"
      patient_status: "stable" | "critical" | "recovering" | "discharged"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "doctor", "staff", "patient"],
      bill_status: ["paid", "pending", "overdue"],
      patient_status: ["stable", "critical", "recovering", "discharged"],
    },
  },
} as const
