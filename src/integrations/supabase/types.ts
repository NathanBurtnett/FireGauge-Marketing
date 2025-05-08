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
      equipment: {
        Row: {
          created_at: string
          equipment_type_id: number
          id: number
          identifier: string
          manufacturer: string | null
          mfg_date: string | null
          model: string | null
          owner_tenant_id: number
          properties: Json | null
          station_id: number
          status: Database["public"]["Enums"]["equipment_status_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment_type_id: number
          id?: number
          identifier: string
          manufacturer?: string | null
          mfg_date?: string | null
          model?: string | null
          owner_tenant_id: number
          properties?: Json | null
          station_id: number
          status?: Database["public"]["Enums"]["equipment_status_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment_type_id?: number
          id?: number
          identifier?: string
          manufacturer?: string | null
          mfg_date?: string | null
          model?: string | null
          owner_tenant_id?: number
          properties?: Json | null
          station_id?: number
          status?: Database["public"]["Enums"]["equipment_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_equipment_type_id_fkey"
            columns: ["equipment_type_id"]
            isOneToOne: false
            referencedRelation: "equipment_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_owner_tenant_id_fkey"
            columns: ["owner_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "station"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_type: {
        Row: {
          created_at: string
          description: string | null
          id: number
          metadata_schema: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          metadata_schema?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          metadata_schema?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          date: string
          id: string
          invoice_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          date?: string
          id?: string
          invoice_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          date?: string
          id?: string
          invoice_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      plan: {
        Row: {
          amount_cents: number
          created_at: string
          id: number
          interval: Database["public"]["Enums"]["billing_interval"]
          name: string
          stripe_price_id: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: number
          interval: Database["public"]["Enums"]["billing_interval"]
          name: string
          stripe_price_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: number
          interval?: Database["public"]["Enums"]["billing_interval"]
          name?: string
          stripe_price_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      station: {
        Row: {
          created_at: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          season_status: string | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          season_status?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          season_status?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription: {
        Row: {
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: number
          plan_id: number
          status: Database["public"]["Enums"]["subscription_status_enum"]
          stripe_subscription_id: string
          tenant_id: number
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: number
          plan_id: number
          status: Database["public"]["Enums"]["subscription_status_enum"]
          stripe_subscription_id: string
          tenant_id: number
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: number
          plan_id?: number
          status?: Database["public"]["Enums"]["subscription_status_enum"]
          stripe_subscription_id?: string
          tenant_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          name: string
          plan: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          name: string
          plan?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          name?: string
          plan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tenant_station_access: {
        Row: {
          created_at: string
          id: number
          permission_level: string
          station_id: number
          tenant_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          permission_level?: string
          station_id: number
          tenant_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          permission_level?: string
          station_id?: number
          tenant_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_station_access_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "station"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_station_access_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      test_record: {
        Row: {
          created_at: string
          data: Json | null
          equipment_id: number
          id: number
          notes: string | null
          result: Database["public"]["Enums"]["test_result_enum"]
          test_date: string
          updated_at: string
          user_id: number
        }
        Insert: {
          created_at?: string
          data?: Json | null
          equipment_id: number
          id?: number
          notes?: string | null
          result: Database["public"]["Enums"]["test_result_enum"]
          test_date: string
          updated_at?: string
          user_id: number
        }
        Update: {
          created_at?: string
          data?: Json | null
          equipment_id?: number
          id?: number
          notes?: string | null
          result?: Database["public"]["Enums"]["test_result_enum"]
          test_date?: string
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "test_record_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_record_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          auth_uid: string | null
          created_at: string
          id: number
          password_hash: string
          role: string
          tenant_id: number
          updated_at: string
          username: string
        }
        Insert: {
          auth_uid?: string | null
          created_at?: string
          id?: number
          password_hash: string
          role: string
          tenant_id: number
          updated_at?: string
          username: string
        }
        Update: {
          auth_uid?: string | null
          created_at?: string
          id?: number
          password_hash?: string
          role?: string
          tenant_id?: number
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      billing_interval: "monthly" | "annual"
      equipment_status_enum: "in_service" | "out_of_service" | "needs_repair"
      subscription_status_enum:
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
      test_result_enum: "pass" | "fail"
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
      billing_interval: ["monthly", "annual"],
      equipment_status_enum: ["in_service", "out_of_service", "needs_repair"],
      subscription_status_enum: [
        "active",
        "past_due",
        "canceled",
        "unpaid",
        "incomplete",
      ],
      test_result_enum: ["pass", "fail"],
    },
  },
} as const
