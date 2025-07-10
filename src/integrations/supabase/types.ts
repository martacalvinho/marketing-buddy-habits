export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          current_streak: number | null
          email: string | null
          goal: string | null
          id: string
          last_activity_date: string | null
          platforms: string[] | null
          product_name: string | null
          product_type: string | null
          updated_at: string
          user_id: string
          website_analysis: Json | null
          website_url: string | null
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          email?: string | null
          goal?: string | null
          id?: string
          last_activity_date?: string | null
          platforms?: string[] | null
          product_name?: string | null
          product_type?: string | null
          updated_at?: string
          user_id: string
          website_analysis?: Json | null
          website_url?: string | null
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          email?: string | null
          goal?: string | null
          id?: string
          last_activity_date?: string | null
          platforms?: string[] | null
          product_name?: string | null
          product_type?: string | null
          updated_at?: string
          user_id?: string
          website_analysis?: Json | null
          website_url?: string | null
        }
        Relationships: []
      }
      strategies: {
        Row: {
          ai_generated: boolean | null
          channel: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          channel?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          channel?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          ai_suggestion: string | null
          category: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string
          description: string | null
          estimated_time: string | null
          id: string
          priority: string | null
          result_metrics: Json | null
          result_notes: string | null
          strategy_id: string | null
          title: string
          user_approach: string | null
          user_id: string
          week_start_date: string
        }
        Insert: {
          ai_suggestion?: string | null
          category?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          estimated_time?: string | null
          id?: string
          priority?: string | null
          result_metrics?: Json | null
          result_notes?: string | null
          strategy_id?: string | null
          title: string
          user_approach?: string | null
          user_id: string
          week_start_date: string
        }
        Update: {
          ai_suggestion?: string | null
          category?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          estimated_time?: string | null
          id?: string
          priority?: string | null
          result_metrics?: Json | null
          result_notes?: string | null
          strategy_id?: string | null
          title?: string
          user_approach?: string | null
          user_id?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      website_analyses: {
        Row: {
          action_items: number | null
          analysis_data: Json
          analysis_topics: string[]
          created_at: string
          id: string
          market_opportunities: number | null
          updated_at: string
          user_id: string
          website_url: string
        }
        Insert: {
          action_items?: number | null
          analysis_data: Json
          analysis_topics?: string[]
          created_at?: string
          id?: string
          market_opportunities?: number | null
          updated_at?: string
          user_id: string
          website_url: string
        }
        Update: {
          action_items?: number | null
          analysis_data?: Json
          analysis_topics?: string[]
          created_at?: string
          id?: string
          market_opportunities?: number | null
          updated_at?: string
          user_id?: string
          website_url?: string
        }
        Relationships: []
      }
      weekly_stats: {
        Row: {
          id: string
          platform: string
          posts_count: number | null
          target_count: number | null
          updated_at: string
          user_id: string
          week_start_date: string
        }
        Insert: {
          id?: string
          platform: string
          posts_count?: number | null
          target_count?: number | null
          updated_at?: string
          user_id: string
          week_start_date: string
        }
        Update: {
          id?: string
          platform?: string
          posts_count?: number | null
          target_count?: number | null
          updated_at?: string
          user_id?: string
          week_start_date?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
