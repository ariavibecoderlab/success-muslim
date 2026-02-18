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
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          title?: string
        }
        Relationships: []
      }
      app_stats: {
        Row: {
          id: string
          stat_key: string
          stat_value: number
          updated_at: string
        }
        Insert: {
          id?: string
          stat_key: string
          stat_value?: number
          updated_at?: string
        }
        Update: {
          id?: string
          stat_key?: string
          stat_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      budget_periods: {
        Row: {
          created_at: string
          end_date: string
          expense_limit: number
          id: string
          income_target: number
          name: string
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          expense_limit?: number
          id?: string
          income_target?: number
          name: string
          start_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          expense_limit?: number
          id?: string
          income_target?: number
          name?: string
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_tasks: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          id: string
          is_mit: boolean
          text: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date: string
          id?: string
          is_mit?: boolean
          text: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          id?: string
          is_mit?: boolean
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      dhikr_sessions: {
        Row: {
          count: number
          created_at: string
          date: string
          id: string
          preset_id: string
          target: number
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          date: string
          id?: string
          preset_id: string
          target?: number
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
          id?: string
          preset_id?: string
          target?: number
          user_id?: string
        }
        Relationships: []
      }
      fasting_log: {
        Row: {
          created_at: string
          date: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      fidyah_history: {
        Row: {
          created_at: string
          entry: Json
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry: Json
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry?: Json
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      habit_log: {
        Row: {
          created_at: string
          date: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_log_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      health_bmi: {
        Row: {
          activity_level: string
          age: number
          bmi: number
          gender: string
          height: number
          id: string
          tdee: number
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          activity_level?: string
          age: number
          bmi: number
          gender: string
          height: number
          id?: string
          tdee: number
          updated_at?: string
          user_id: string
          weight: number
        }
        Update: {
          activity_level?: string
          age?: number
          bmi?: number
          gender?: string
          height?: number
          id?: string
          tdee?: number
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      hydration_log: {
        Row: {
          created_at: string
          cups: number
          date: string
          goal: number
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cups?: number
          date: string
          goal?: number
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cups?: number
          date?: string
          goal?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      if_sessions: {
        Row: {
          completed: boolean
          created_at: string
          end_time: string | null
          fasting_hours: number
          id: string
          mode: string
          start_time: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          end_time?: string | null
          fasting_hours?: number
          id?: string
          mode: string
          start_time: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          end_time?: string | null
          fasting_hours?: number
          id?: string
          mode?: string
          start_time?: string
          user_id?: string
        }
        Relationships: []
      }
      life_area_scores: {
        Row: {
          area: string
          created_at: string
          date: string
          id: string
          score: number
          user_id: string
        }
        Insert: {
          area: string
          created_at?: string
          date: string
          id?: string
          score?: number
          user_id: string
        }
        Update: {
          area?: string
          created_at?: string
          date?: string
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      page_overrides: {
        Row: {
          element_key: string
          id: string
          override_type: string
          page: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          element_key: string
          id?: string
          override_type: string
          page: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          element_key?: string
          id?: string
          override_type?: string
          page?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          display_name: string | null
          gender: string | null
          id: string
          is_disabled: boolean
          updated_at: string
          weight_goal: number | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id: string
          is_disabled?: boolean
          updated_at?: string
          weight_goal?: number | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id?: string
          is_disabled?: boolean
          updated_at?: string
          weight_goal?: number | null
        }
        Relationships: []
      }
      qada_solat: {
        Row: {
          id: string
          progress: Json
          setup: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          progress?: Json
          setup?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          progress?: Json
          setup?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quran_log: {
        Row: {
          created_at: string
          date: string
          id: string
          juz_number: number | null
          notes: string | null
          pages_read: number
          surah_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          juz_number?: number | null
          notes?: string | null
          pages_read?: number
          surah_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          juz_number?: number | null
          notes?: string | null
          pages_read?: number
          surah_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ramadhan_qada: {
        Row: {
          id: string
          progress: Json
          setup: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          progress?: Json
          setup?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          progress?: Json
          setup?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      salah_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          logged_at: string | null
          prayer_name: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          logged_at?: string | null
          prayer_name: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          logged_at?: string | null
          prayer_name?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      savings_contributions: {
        Row: {
          amount: number
          created_at: string
          date: string
          goal_id: string
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          goal_id: string
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          goal_id?: string
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          created_at: string
          current_amount: number
          deadline: string | null
          goal_type: string
          icon: string
          id: string
          name: string
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          goal_type?: string
          icon?: string
          id?: string
          name: string
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          goal_type?: string
          icon?: string
          id?: string
          name?: string
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sleep_log: {
        Row: {
          bedtime: string
          created_at: string
          date: string
          duration: number
          id: string
          user_id: string
          wake_time: string
        }
        Insert: {
          bedtime: string
          created_at?: string
          date: string
          duration: number
          id?: string
          user_id: string
          wake_time: string
        }
        Update: {
          bedtime?: string
          created_at?: string
          date?: string
          duration?: number
          id?: string
          user_id?: string
          wake_time?: string
        }
        Relationships: []
      }
      sunnah_log: {
        Row: {
          completed_items: Json
          created_at: string
          date: string
          id: string
          user_id: string
        }
        Insert: {
          completed_items?: Json
          created_at?: string
          date: string
          id?: string
          user_id: string
        }
        Update: {
          completed_items?: Json
          created_at?: string
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          module: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          module: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          module?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weight_log: {
        Row: {
          created_at: string
          date: string
          id: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          user_id?: string
          weight?: number
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
