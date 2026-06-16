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
  public: {
    Tables: {
      events: {
        Row: {
          base_price: number
          capacity: number | null
          category: string | null
          city: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          event_date: string
          event_time: string
          gallery: Json
          id: string
          image: string | null
          organizer: string | null
          policies: string | null
          status: string
          title: string
          updated_at: string
          venue: string
          venue_type: string
        }
        Insert: {
          base_price?: number
          capacity?: number | null
          category?: string | null
          city: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          event_date: string
          event_time: string
          gallery?: Json
          id: string
          image?: string | null
          organizer?: string | null
          policies?: string | null
          status?: string
          title: string
          updated_at?: string
          venue: string
          venue_type?: string
        }
        Update: {
          base_price?: number
          capacity?: number | null
          category?: string | null
          city?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          event_date?: string
          event_time?: string
          gallery?: Json
          id?: string
          image?: string | null
          organizer?: string | null
          policies?: string | null
          status?: string
          title?: string
          updated_at?: string
          venue?: string
          venue_type?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          event_id: string
          id: string
          payment_method: string | null
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          payment_method?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          payment_method?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seats: {
        Row: {
          created_at: string
          event_id: string
          held_by: string | null
          held_until: string | null
          id: string
          row_label: string
          seat_number: string
          section_id: string
          status: string
          updated_at: string
          x: number
          y: number
        }
        Insert: {
          created_at?: string
          event_id: string
          held_by?: string | null
          held_until?: string | null
          id?: string
          row_label: string
          seat_number: string
          section_id: string
          status?: string
          updated_at?: string
          x?: number
          y?: number
        }
        Update: {
          created_at?: string
          event_id?: string
          held_by?: string | null
          held_until?: string | null
          id?: string
          row_label?: string
          seat_number?: string
          section_id?: string
          status?: string
          updated_at?: string
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "seats_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seats_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "venue_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string
          event_category: string | null
          event_city: string
          event_date: string
          event_id: string
          event_image: string | null
          event_time: string
          event_title: string
          event_venue: string
          id: string
          order_id: string | null
          price_paid: number | null
          qr_code: string
          quantity: number
          seat: string
          seat_id: string | null
          section: string
          section_id: string | null
          status: string
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_category?: string | null
          event_city: string
          event_date: string
          event_id: string
          event_image?: string | null
          event_time: string
          event_title: string
          event_venue: string
          id?: string
          order_id?: string | null
          price_paid?: number | null
          qr_code: string
          quantity?: number
          seat: string
          seat_id?: string | null
          section: string
          section_id?: string | null
          status?: string
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_category?: string | null
          event_city?: string
          event_date?: string
          event_id?: string
          event_image?: string | null
          event_time?: string
          event_title?: string
          event_venue?: string
          id?: string
          order_id?: string | null
          price_paid?: number | null
          qr_code?: string
          quantity?: number
          seat?: string
          seat_id?: string | null
          section?: string
          section_id?: string | null
          status?: string
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "venue_sections"
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
      venue_sections: {
        Row: {
          capacity: number
          color: string
          created_at: string
          display_order: number
          event_id: string
          geometry: Json
          id: string
          name: string
          price: number
          section_type: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          color?: string
          created_at?: string
          display_order?: number
          event_id: string
          geometry?: Json
          id?: string
          name: string
          price?: number
          section_type?: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          color?: string
          created_at?: string
          display_order?: number
          event_id?: string
          geometry?: Json
          id?: string
          name?: string
          price?: number
          section_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_sections_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "user" | "organizer"
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
      app_role: ["admin", "user", "organizer"],
    },
  },
} as const
