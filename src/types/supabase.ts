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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          action_type: string | null
          admin_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          action_type?: string | null
          admin_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          action_type?: string | null
          admin_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      collection_cards: {
        Row: {
          card_id: string
          collection_id: string | null
          condition: string | null
          created_at: string | null
          date_added: string | null
          id: string
          image_url: string | null
          is_first_edition: boolean | null
          is_foil: boolean | null
          name: string | null
          notes: string | null
          quantity: number
          set_name: string | null
          updated_at: string | null
        }
        Insert: {
          card_id: string
          collection_id?: string | null
          condition?: string | null
          created_at?: string | null
          date_added?: string | null
          id?: string
          image_url?: string | null
          is_first_edition?: boolean | null
          is_foil?: boolean | null
          name?: string | null
          notes?: string | null
          quantity?: number
          set_name?: string | null
          updated_at?: string | null
        }
        Update: {
          card_id?: string
          collection_id?: string | null
          condition?: string | null
          created_at?: string | null
          date_added?: string | null
          id?: string
          image_url?: string | null
          is_first_edition?: boolean | null
          is_foil?: boolean | null
          name?: string | null
          notes?: string | null
          quantity?: number
          set_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_cards_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_changes: {
        Row: {
          change_date: string | null
          created_at: string | null
          id: string
          new_plan: Database["public"]["Enums"]["subscription_plan_type"] | null
          old_plan: Database["public"]["Enums"]["subscription_plan_type"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          change_date?: string | null
          created_at?: string | null
          id?: string
          new_plan?:
            | Database["public"]["Enums"]["subscription_plan_type"]
            | null
          old_plan?:
            | Database["public"]["Enums"]["subscription_plan_type"]
            | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          change_date?: string | null
          created_at?: string | null
          id?: string
          new_plan?:
            | Database["public"]["Enums"]["subscription_plan_type"]
            | null
          old_plan?:
            | Database["public"]["Enums"]["subscription_plan_type"]
            | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_overrides: {
        Row: {
          admin_user_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          original_value: string | null
          override_type: string
          override_value: string | null
          reason: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_user_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          original_value?: string | null
          override_type: string
          override_value?: string | null
          reason?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_user_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          original_value?: string | null
          override_type?: string
          override_value?: string | null
          reason?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string | null
          current_period_end: string
          id: string
          is_active: boolean
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string | null
          current_period_end: string
          id?: string
          is_active?: boolean
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          status: string
          stripe_customer_id?: string | null
          stripe_price_id: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string | null
          current_period_end?: string
          id?: string
          is_active?: boolean
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          id: string
          last_activity_at: string | null
          registration_completed_at: string | null
          total_cards: number | null
          total_collections: number | null
          total_wishlist_items: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          last_activity_at?: string | null
          registration_completed_at?: string | null
          total_cards?: number | null
          total_collections?: number | null
          total_wishlist_items?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          last_activity_at?: string | null
          registration_completed_at?: string | null
          total_cards?: number | null
          total_collections?: number | null
          total_wishlist_items?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          has_seen_onboarding: boolean | null
          id: string
          is_active: boolean | null
          is_admin: boolean | null
          last_login_at: string | null
          level: string | null
          login_count: number | null
          notes: string | null
          preferred_lang: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          has_seen_onboarding?: boolean | null
          id: string
          is_active?: boolean | null
          is_admin?: boolean | null
          last_login_at?: string | null
          level?: string | null
          login_count?: number | null
          notes?: string | null
          preferred_lang?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          has_seen_onboarding?: boolean | null
          id?: string
          is_active?: boolean | null
          is_admin?: boolean | null
          last_login_at?: string | null
          level?: string | null
          login_count?: number | null
          notes?: string | null
          preferred_lang?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string | null
          event_data: Json
          event_type: string
          id: string
          processed_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_data: Json
          event_type: string
          id?: string
          processed_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          processed_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wishlist_cards: {
        Row: {
          card_id: string
          created_at: string | null
          date_added: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          card_id: string
          created_at?: string | null
          date_added?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          card_id?: string
          created_at?: string | null
          date_added?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_get_all_users: {
        Args: { page_num?: number; page_size?: number; search_email?: string }
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          is_admin: boolean
          last_login_at: string
          login_count: number
          total_count: number
          updated_at: string
        }[]
      }
      create_new_user: {
        Args: {
          p_email: string
          p_full_name?: string
          p_preferred_lang?: string
          p_user_id: string
        }
        Returns: string
      }
      create_stripe_free_subscription: {
        Args: { p_user_id: string }
        Returns: string
      }
      create_user_subscription: {
        Args: {
          p_plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          p_stripe_customer_id?: string
          p_stripe_price_id?: string
          p_stripe_subscription_id?: string
          p_user_id: string
        }
        Returns: string
      }
      delete_user: { Args: never; Returns: undefined }
      delete_user_data: { Args: { user_id_param: string }; Returns: undefined }
      fix_subscription_price_ids: { Args: never; Returns: number }
      get_subscription_changes: {
        Args: { p_limit?: number; p_user_id?: string }
        Returns: {
          change_reason: string
          changed_at: string
          id: string
          new_plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          old_plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          user_id: string
        }[]
      }
      get_user_collection_stats: {
        Args: { p_user_id: string }
        Returns: {
          last_activity_at: string
          total_cards: number
          total_collections: number
          total_wishlist_items: number
        }[]
      }
      handle_subscription_activation: {
        Args: {
          p_plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          p_stripe_customer_id: string
          p_stripe_price_id: string
          p_stripe_subscription_id: string
          p_user_id: string
        }
        Returns: string
      }
      is_current_user_admin: { Args: never; Returns: boolean }
      log_admin_action: {
        Args: {
          action_type: string
          admin_user_id: string
          metadata?: Json
          new_values?: Json
          old_values?: Json
          resource_id: string
          resource_type: string
          target_user_id: string
        }
        Returns: string
      }
      log_subscription_change: {
        Args: {
          p_change_reason?: string
          p_new_plan: Database["public"]["Enums"]["subscription_plan_type"]
          p_old_plan: Database["public"]["Enums"]["subscription_plan_type"]
          p_user_id: string
        }
        Returns: string
      }
      trim_collection_cards: {
        Args: { p_max_cards: number; p_user_id: string }
        Returns: number
      }
      trim_collections: {
        Args: { p_max_collections: number; p_user_id: string }
        Returns: number
      }
      trim_wishlist: {
        Args: { p_max_items: number; p_user_id: string }
        Returns: number
      }
      update_user_statistics: {
        Args: { target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      subscription_plan_type: "aprendiz" | "entrenador" | "maestro"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      subscription_plan_type: ["aprendiz", "entrenador", "maestro"],
    },
  },
} as const
