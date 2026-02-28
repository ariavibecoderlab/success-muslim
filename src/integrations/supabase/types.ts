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
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
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
      dakwah_posters: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          id: string
          image_url: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          image_url: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          image_url?: string
          title?: string
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
      families: {
        Row: {
          created_at: string
          created_by: string
          group_type: string
          id: string
          invite_code: string
          invite_link: string | null
          mode: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          group_type?: string
          id?: string
          invite_code: string
          invite_link?: string | null
          mode?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          group_type?: string
          id?: string
          invite_code?: string
          invite_link?: string | null
          mode?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      family_activity_feed: {
        Row: {
          activity_type: string
          created_at: string
          family_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          family_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          family_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_activity_feed_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_announcements: {
        Row: {
          admin_id: string
          created_at: string
          family_id: string
          id: string
          message: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          family_id: string
          id?: string
          message: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          family_id?: string
          id?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_announcements_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          family_id: string
          id: string
          is_visible: boolean
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          family_id: string
          id?: string
          is_visible?: boolean
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          family_id?: string
          id?: string
          is_visible?: boolean
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_privacy_settings: {
        Row: {
          ghost_mode: boolean
          id: string
          show_fasting: boolean
          show_health: boolean
          show_on_leaderboard: boolean
          show_prayer: boolean
          show_quran: boolean
          show_streaks: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          ghost_mode?: boolean
          id?: string
          show_fasting?: boolean
          show_health?: boolean
          show_on_leaderboard?: boolean
          show_prayer?: boolean
          show_quran?: boolean
          show_streaks?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          ghost_mode?: boolean
          id?: string
          show_fasting?: boolean
          show_health?: boolean
          show_on_leaderboard?: boolean
          show_prayer?: boolean
          show_quran?: boolean
          show_streaks?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      family_reactions: {
        Row: {
          created_at: string
          feed_id: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feed_id: string
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          feed_id?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_reactions_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "family_activity_feed"
            referencedColumns: ["id"]
          },
        ]
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
      hajj_umrah_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          journey_type: string
          notes: string | null
          packing_checklist: Json
          started_at: string | null
          steps: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          journey_type?: string
          notes?: string | null
          packing_checklist?: Json
          started_at?: string | null
          steps?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          journey_type?: string
          notes?: string | null
          packing_checklist?: Json
          started_at?: string | null
          steps?: Json
          updated_at?: string
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
      prayer_settings: {
        Row: {
          adhan_settings: Json | null
          calculation_method: number | null
          city: string | null
          country: string | null
          created_at: string
          id: string
          latitude: number | null
          location_method: string | null
          longitude: number | null
          madhab: string | null
          mosque_asr: string | null
          mosque_dhuhr: string | null
          mosque_enabled: boolean | null
          mosque_fajr: string | null
          mosque_isha: string | null
          mosque_maghrib: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adhan_settings?: Json | null
          calculation_method?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          location_method?: string | null
          longitude?: number | null
          madhab?: string | null
          mosque_asr?: string | null
          mosque_dhuhr?: string | null
          mosque_enabled?: boolean | null
          mosque_fajr?: string | null
          mosque_isha?: string | null
          mosque_maghrib?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adhan_settings?: Json | null
          calculation_method?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          location_method?: string | null
          longitude?: number | null
          madhab?: string | null
          mosque_asr?: string | null
          mosque_dhuhr?: string | null
          mosque_enabled?: boolean | null
          mosque_fajr?: string | null
          mosque_isha?: string | null
          mosque_maghrib?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          consistency_level: string | null
          country: string | null
          created_at: string
          display_name: string | null
          focus_areas: Json | null
          gender: string | null
          id: string
          is_disabled: boolean
          notification_enabled: boolean | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          updated_at: string
          weight_goal: number | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          consistency_level?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          focus_areas?: Json | null
          gender?: string | null
          id: string
          is_disabled?: boolean
          notification_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          updated_at?: string
          weight_goal?: number | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          consistency_level?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          focus_areas?: Json | null
          gender?: string | null
          id?: string
          is_disabled?: boolean
          notification_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
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
      qiyam_log: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          performed: boolean
          sleep_time: string | null
          tahajjud_start: string | null
          user_id: string
          wake_time: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          performed?: boolean
          sleep_time?: string | null
          tahajjud_start?: string | null
          user_id: string
          wake_time?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          performed?: boolean
          sleep_time?: string | null
          tahajjud_start?: string | null
          user_id?: string
          wake_time?: string | null
        }
        Relationships: []
      }
      qiyam_settings: {
        Row: {
          alarm_enabled: boolean
          alarm_minutes_before_fajr: number
          created_at: string
          default_sleep_time: string
          default_wake_time: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alarm_enabled?: boolean
          alarm_minutes_before_fajr?: number
          created_at?: string
          default_sleep_time?: string
          default_wake_time?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alarm_enabled?: boolean
          alarm_minutes_before_fajr?: number
          created_at?: string
          default_sleep_time?: string
          default_wake_time?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quran_bookmarks: {
        Row: {
          ayah_number: number
          created_at: string
          id: string
          note: string | null
          surah_number: number
          user_id: string
        }
        Insert: {
          ayah_number: number
          created_at?: string
          id?: string
          note?: string | null
          surah_number: number
          user_id: string
        }
        Update: {
          ayah_number?: number
          created_at?: string
          id?: string
          note?: string | null
          surah_number?: number
          user_id?: string
        }
        Relationships: []
      }
      quran_daily_log: {
        Row: {
          ayah_number: number | null
          created_at: string
          date: string
          id: string
          surah_number: number | null
          target_met: boolean
          user_id: string
        }
        Insert: {
          ayah_number?: number | null
          created_at?: string
          date?: string
          id?: string
          surah_number?: number | null
          target_met?: boolean
          user_id: string
        }
        Update: {
          ayah_number?: number | null
          created_at?: string
          date?: string
          id?: string
          surah_number?: number | null
          target_met?: boolean
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
      quran_memorization: {
        Row: {
          ayah_number: number
          id: string
          memorized_at: string
          surah_number: number
          user_id: string
        }
        Insert: {
          ayah_number: number
          id?: string
          memorized_at?: string
          surah_number: number
          user_id: string
        }
        Update: {
          ayah_number?: number
          id?: string
          memorized_at?: string
          surah_number?: number
          user_id?: string
        }
        Relationships: []
      }
      quran_preferences: {
        Row: {
          created_at: string
          daily_goal_pages: number | null
          daily_memo_goal: number | null
          daily_target_type: string | null
          font_size: number | null
          id: string
          last_ayah: number | null
          last_surah: number | null
          memorization_enabled: boolean | null
          monthly_page_goal: number | null
          night_mode: boolean | null
          target_selected_at: string | null
          tracker_enabled: boolean | null
          translation_lang: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_goal_pages?: number | null
          daily_memo_goal?: number | null
          daily_target_type?: string | null
          font_size?: number | null
          id?: string
          last_ayah?: number | null
          last_surah?: number | null
          memorization_enabled?: boolean | null
          monthly_page_goal?: number | null
          night_mode?: boolean | null
          target_selected_at?: string | null
          tracker_enabled?: boolean | null
          translation_lang?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_goal_pages?: number | null
          daily_memo_goal?: number | null
          daily_target_type?: string | null
          font_size?: number | null
          id?: string
          last_ayah?: number | null
          last_surah?: number | null
          memorization_enabled?: boolean | null
          monthly_page_goal?: number | null
          night_mode?: boolean | null
          target_selected_at?: string | null
          tracker_enabled?: boolean | null
          translation_lang?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quran_reading_log: {
        Row: {
          ayah_count: number
          created_at: string
          date: string
          end_ayah: number
          end_surah: number
          id: string
          juz_segments: Json | null
          log_type: string
          page_count: number
          start_ayah: number
          start_surah: number
          user_id: string
        }
        Insert: {
          ayah_count?: number
          created_at?: string
          date?: string
          end_ayah: number
          end_surah: number
          id?: string
          juz_segments?: Json | null
          log_type?: string
          page_count?: number
          start_ayah: number
          start_surah: number
          user_id: string
        }
        Update: {
          ayah_count?: number
          created_at?: string
          date?: string
          end_ayah?: number
          end_surah?: number
          id?: string
          juz_segments?: Json | null
          log_type?: string
          page_count?: number
          start_ayah?: number
          start_surah?: number
          user_id?: string
        }
        Relationships: []
      }
      quran_reading_sessions: {
        Row: {
          ayahs_read: number | null
          created_at: string
          date: string
          duration_seconds: number | null
          end_ayah: number
          end_surah: number
          id: string
          pages_read: number | null
          start_ayah: number
          start_surah: number
          user_id: string
        }
        Insert: {
          ayahs_read?: number | null
          created_at?: string
          date?: string
          duration_seconds?: number | null
          end_ayah: number
          end_surah: number
          id?: string
          pages_read?: number | null
          start_ayah: number
          start_surah: number
          user_id: string
        }
        Update: {
          ayahs_read?: number | null
          created_at?: string
          date?: string
          duration_seconds?: number | null
          end_ayah?: number
          end_surah?: number
          id?: string
          pages_read?: number | null
          start_ayah?: number
          start_surah?: number
          user_id?: string
        }
        Relationships: []
      }
      ramadan_daily_log: {
        Row: {
          charity_amount: number
          created_at: string
          date: string
          dhikr_count: number
          fasted: boolean
          id: string
          notes: string | null
          quran_pages: number
          selawat_count: number
          sunnah_solat: Json
          tarawih_rakaat: number
          user_id: string
        }
        Insert: {
          charity_amount?: number
          created_at?: string
          date: string
          dhikr_count?: number
          fasted?: boolean
          id?: string
          notes?: string | null
          quran_pages?: number
          selawat_count?: number
          sunnah_solat?: Json
          tarawih_rakaat?: number
          user_id: string
        }
        Update: {
          charity_amount?: number
          created_at?: string
          date?: string
          dhikr_count?: number
          fasted?: boolean
          id?: string
          notes?: string | null
          quran_pages?: number
          selawat_count?: number
          sunnah_solat?: Json
          tarawih_rakaat?: number
          user_id?: string
        }
        Relationships: []
      }
      ramadan_settings: {
        Row: {
          created_at: string
          daily_dhikr_goal: number
          daily_quran_goal: number
          id: string
          iftar_alarm: boolean
          suhoor_alarm: boolean
          suhoor_minutes_before_fajr: number
          tarawih_target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_dhikr_goal?: number
          daily_quran_goal?: number
          id?: string
          iftar_alarm?: boolean
          suhoor_alarm?: boolean
          suhoor_minutes_before_fajr?: number
          tarawih_target?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_dhikr_goal?: number
          daily_quran_goal?: number
          id?: string
          iftar_alarm?: boolean
          suhoor_alarm?: boolean
          suhoor_minutes_before_fajr?: number
          tarawih_target?: number
          updated_at?: string
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
      sadaqah_donations: {
        Row: {
          amount: number
          category: string
          created_at: string
          currency: string
          date: string
          id: string
          notes: string | null
          recipient: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string
          currency?: string
          date?: string
          id?: string
          notes?: string | null
          recipient?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          currency?: string
          date?: string
          id?: string
          notes?: string | null
          recipient?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sadaqah_goals: {
        Row: {
          created_at: string
          currency: string
          id: string
          monthly_target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          monthly_target?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          monthly_target?: number
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
      steps_logs: {
        Row: {
          activity_type: string
          calories_burned: number
          created_at: string
          date: string
          distance_meters: number
          id: string
          logged_at: string
          source: string
          steps: number
          user_id: string
        }
        Insert: {
          activity_type?: string
          calories_burned?: number
          created_at?: string
          date: string
          distance_meters?: number
          id?: string
          logged_at?: string
          source?: string
          steps: number
          user_id: string
        }
        Update: {
          activity_type?: string
          calories_burned?: number
          created_at?: string
          date?: string
          distance_meters?: number
          id?: string
          logged_at?: string
          source?: string
          steps?: number
          user_id?: string
        }
        Relationships: []
      }
      steps_preferences: {
        Row: {
          created_at: string
          daily_target: number
          id: string
          reminder_enabled: boolean
          reminder_time: string | null
          stride_length_cm: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_target?: number
          id?: string
          reminder_enabled?: boolean
          reminder_time?: string | null
          stride_length_cm?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_target?: number
          id?: string
          reminder_enabled?: boolean
          reminder_time?: string | null
          stride_length_cm?: number
          updated_at?: string
          user_id?: string
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
          is_recurring: boolean
          recurrence_interval: string | null
          recurring_parent_id: string | null
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
          is_recurring?: boolean
          recurrence_interval?: string | null
          recurring_parent_id?: string | null
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
          is_recurring?: boolean
          recurrence_interval?: string | null
          recurring_parent_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_recurring_parent_id_fkey"
            columns: ["recurring_parent_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
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
      user_health_profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          bmi: number | null
          completed_at: string | null
          created_at: string
          eating_habits: string | null
          fasting_experience: string | null
          gender: string | null
          goal: string | null
          goal_weight_kg: number | null
          height_cm: number | null
          id: string
          recommended_protocol: string | null
          sleep_hours: string | null
          tdee: number | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          bmi?: number | null
          completed_at?: string | null
          created_at?: string
          eating_habits?: string | null
          fasting_experience?: string | null
          gender?: string | null
          goal?: string | null
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: string
          recommended_protocol?: string | null
          sleep_hours?: string | null
          tdee?: number | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          bmi?: number | null
          completed_at?: string | null
          created_at?: string
          eating_habits?: string | null
          fasting_experience?: string | null
          gender?: string | null
          goal?: string | null
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: string
          recommended_protocol?: string | null
          sleep_hours?: string | null
          tdee?: number | null
          user_id?: string
          weight_kg?: number | null
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
      widget_preferences: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          position: number
          size: string
          updated_at: string
          user_id: string
          widget_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          position?: number
          size?: string
          updated_at?: string
          user_id: string
          widget_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          position?: number
          size?: string
          updated_at?: string
          user_id?: string
          widget_id?: string
        }
        Relationships: []
      }
      zakat_history: {
        Row: {
          created_at: string
          date: string
          id: string
          input: Json
          is_paid: boolean
          meets_nisab: boolean
          net_zakatable: number
          nisab_gold: number
          nisab_silver: number
          paid_date: string | null
          total_wealth: number
          user_id: string
          zakat_amount: number
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          input?: Json
          is_paid?: boolean
          meets_nisab?: boolean
          net_zakatable?: number
          nisab_gold?: number
          nisab_silver?: number
          paid_date?: string | null
          total_wealth?: number
          user_id: string
          zakat_amount?: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          input?: Json
          is_paid?: boolean
          meets_nisab?: boolean
          net_zakatable?: number
          nisab_gold?: number
          nisab_silver?: number
          paid_date?: string | null
          total_wealth?: number
          user_id?: string
          zakat_amount?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      admin_module_usage: {
        Args: never
        Returns: {
          module: string
          unique_users: number
          usage_count: number
        }[]
      }
      admin_overview_stats: { Args: never; Returns: Json }
      admin_retention_cohorts: {
        Args: never
        Returns: {
          cohort_size: number
          cohort_week: string
          d1: number
          d14: number
          d3: number
          d30: number
          d7: number
        }[]
      }
      admin_signup_chart: {
        Args: { _days?: number }
        Returns: {
          signup_count: number
          signup_date: string
        }[]
      }
      admin_user_breakdown: { Args: never; Returns: Json }
      admin_user_last_active: {
        Args: never
        Returns: {
          last_active: string
          user_id: string
        }[]
      }
      get_family_leaderboard: {
        Args: { p_family_id: string }
        Returns: {
          avatar_url: string
          display_name: string
          fasting_days_this_week: number
          ghost_mode: boolean
          iman_score: number
          prayers_this_week: number
          quran_days_this_week: number
          quran_streak: number
          show_on_leaderboard: boolean
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_family_admin: { Args: { p_family_id: string }; Returns: boolean }
      is_family_member: { Args: { p_family_id: string }; Returns: boolean }
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
