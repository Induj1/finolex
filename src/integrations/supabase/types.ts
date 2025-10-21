export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string
          batch_number: string
          created_at: string | null
          distribution_locations: string[] | null
          expiry_date: string
          id: string
          manufacturing_date: string
          product_name: string
          qr_code: string | null
          qr_generated_at: string | null
          qr_signature: string | null
          signed_qr_data: Json | null
          updated_at: string | null
        }
        Insert: {
          barcode: string
          batch_number: string
          created_at?: string | null
          distribution_locations?: string[] | null
          expiry_date: string
          id?: string
          manufacturing_date: string
          product_name: string
          qr_code?: string | null
          qr_generated_at?: string | null
          qr_signature?: string | null
          signed_qr_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string
          batch_number?: string
          created_at?: string | null
          distribution_locations?: string[] | null
          expiry_date?: string
          id?: string
          manufacturing_date?: string
          product_name?: string
          qr_code?: string | null
          qr_generated_at?: string | null
          qr_signature?: string | null
          signed_qr_data?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      qr_scan_attempts: {
        Row: {
          created_at: string | null
          device_id: string | null
          id: string
          ip_address: unknown | null
          qr_id: string
          scan_location: string | null
          scan_time: string | null
          user_agent: string | null
          verification_status: string
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          ip_address?: unknown | null
          qr_id: string
          scan_location?: string | null
          scan_time?: string | null
          user_agent?: string | null
          verification_status: string
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          ip_address?: unknown | null
          qr_id?: string
          scan_location?: string | null
          scan_time?: string | null
          user_agent?: string | null
          verification_status?: string
        }
        Relationships: []
      }
      qr_scan_tracking: {
        Row: {
          created_at: string | null
          first_scan_device_id: string | null
          first_scan_ip: unknown | null
          first_scan_location: string | null
          first_scan_time: string | null
          id: string
          last_scan_device_id: string | null
          last_scan_ip: unknown | null
          last_scan_location: string | null
          last_scan_time: string | null
          product_id: string | null
          qr_id: string
          scan_count: number | null
        }
        Insert: {
          created_at?: string | null
          first_scan_device_id?: string | null
          first_scan_ip?: unknown | null
          first_scan_location?: string | null
          first_scan_time?: string | null
          id?: string
          last_scan_device_id?: string | null
          last_scan_ip?: unknown | null
          last_scan_location?: string | null
          last_scan_time?: string | null
          product_id?: string | null
          qr_id: string
          scan_count?: number | null
        }
        Update: {
          created_at?: string | null
          first_scan_device_id?: string | null
          first_scan_ip?: unknown | null
          first_scan_location?: string | null
          first_scan_time?: string | null
          id?: string
          last_scan_device_id?: string | null
          last_scan_ip?: unknown | null
          last_scan_location?: string | null
          last_scan_time?: string | null
          product_id?: string | null
          qr_id?: string
          scan_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_scan_tracking_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      rsa_keys: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          key_name: string
          private_key_hash: string
          public_key: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name: string
          private_key_hash: string
          public_key: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name?: string
          private_key_hash?: string
          public_key?: string
        }
        Relationships: []
      }
      scan_logs: {
        Row: {
          barcode: string
          created_at: string | null
          device_fingerprint: string | null
          id: string
          ip_address: unknown | null
          qr_code: string | null
          response_time_ms: number | null
          scan_location: string | null
          security_flag: Database["public"]["Enums"]["security_flag"] | null
          status: Database["public"]["Enums"]["product_status"]
          user_agent: string | null
        }
        Insert: {
          barcode: string
          created_at?: string | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          qr_code?: string | null
          response_time_ms?: number | null
          scan_location?: string | null
          security_flag?: Database["public"]["Enums"]["security_flag"] | null
          status: Database["public"]["Enums"]["product_status"]
          user_agent?: string | null
        }
        Update: {
          barcode?: string
          created_at?: string | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          qr_code?: string | null
          response_time_ms?: number | null
          scan_location?: string | null
          security_flag?: Database["public"]["Enums"]["security_flag"] | null
          status?: Database["public"]["Enums"]["product_status"]
          user_agent?: string | null
        }
        Relationships: []
      }
      suspicious_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          details: Json | null
          device_fingerprint: string | null
          id: string
          ip_address: unknown | null
          is_blocked: boolean | null
          severity: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          details?: Json | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          is_blocked?: boolean | null
          severity?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          details?: Json | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          is_blocked?: boolean | null
          severity?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      product_status: "genuine" | "counterfeit" | "unverified"
      security_flag: "low_risk" | "medium_risk" | "high_risk"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      product_status: ["genuine", "counterfeit", "unverified"],
      security_flag: ["low_risk", "medium_risk", "high_risk"],
    },
  },
} as const
