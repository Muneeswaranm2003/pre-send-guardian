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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blacklist_checks: {
        Row: {
          check_type: string
          checked_at: string
          details: string | null
          domain_id: string
          id: string
          is_listed: boolean | null
          provider: string
        }
        Insert: {
          check_type: string
          checked_at?: string
          details?: string | null
          domain_id: string
          id?: string
          is_listed?: boolean | null
          provider: string
        }
        Update: {
          check_type?: string
          checked_at?: string
          details?: string | null
          domain_id?: string
          id?: string
          is_listed?: boolean | null
          provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "blacklist_checks_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "monitored_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      monitored_domains: {
        Row: {
          blacklist_status: string | null
          created_at: string
          dkim_selector: string | null
          dkim_status: string | null
          dmarc_status: string | null
          domain: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_check_at: string | null
          overall_health: number | null
          smtp_host: string | null
          smtp_port: number | null
          spf_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blacklist_status?: string | null
          created_at?: string
          dkim_selector?: string | null
          dkim_status?: string | null
          dmarc_status?: string | null
          domain: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_check_at?: string | null
          overall_health?: number | null
          smtp_host?: string | null
          smtp_port?: number | null
          spf_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blacklist_status?: string | null
          created_at?: string
          dkim_selector?: string | null
          dkim_status?: string | null
          dmarc_status?: string | null
          domain?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_check_at?: string | null
          overall_health?: number | null
          smtp_host?: string | null
          smtp_port?: number | null
          spf_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monitoring_alerts: {
        Row: {
          alert_type: string
          created_at: string
          domain_id: string
          id: string
          is_email_sent: boolean | null
          is_read: boolean | null
          message: string
          severity: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          domain_id: string
          id?: string
          is_email_sent?: boolean | null
          is_read?: boolean | null
          message: string
          severity?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          domain_id?: string
          id?: string
          is_email_sent?: boolean | null
          is_read?: boolean | null
          message?: string
          severity?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_alerts_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "monitored_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      simulations: {
        Row: {
          created_at: string
          domain: string
          domain_id: string | null
          email_content: string | null
          email_subject: string | null
          id: string
          ip_address: string | null
          issues: Json | null
          risk_breakdown: Json | null
          risk_score: number
          send_volume: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          domain_id?: string | null
          email_content?: string | null
          email_subject?: string | null
          id?: string
          ip_address?: string | null
          issues?: Json | null
          risk_breakdown?: Json | null
          risk_score: number
          send_volume?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          domain_id?: string | null
          email_content?: string | null
          email_subject?: string | null
          id?: string
          ip_address?: string | null
          issues?: Json | null
          risk_breakdown?: Json | null
          risk_score?: number
          send_volume?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulations_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "monitored_domains"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
