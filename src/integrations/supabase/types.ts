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
      material_items: {
        Row: {
          created_at: string
          id: string
          item_name: string
          quantity: number
          request_id: string
          unit: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          quantity: number
          request_id: string
          unit: string
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          quantity?: number
          request_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "material_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      material_requests: {
        Row: {
          created_at: string
          id: string
          images_url: string[] | null
          notes: string | null
          project_id: string
          request_code: string
          request_date: string
          requester_name: string
          status: string
          updated_at: string
          urgency: string
        }
        Insert: {
          created_at?: string
          id?: string
          images_url?: string[] | null
          notes?: string | null
          project_id: string
          request_code: string
          request_date?: string
          requester_name: string
          status?: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          created_at?: string
          id?: string
          images_url?: string[] | null
          notes?: string | null
          project_id?: string
          request_code?: string
          request_date?: string
          requester_name?: string
          status?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      material_tracking: {
        Row: {
          category: string
          created_at: string
          date_usage: Json | null
          description: string
          id: string
          project_id: string
          remaining_quantity: number | null
          total_quantity: number
          updated_at: string
          used_quantity: number
        }
        Insert: {
          category?: string
          created_at?: string
          date_usage?: Json | null
          description: string
          id?: string
          project_id: string
          remaining_quantity?: number | null
          total_quantity?: number
          updated_at?: string
          used_quantity?: number
        }
        Update: {
          category?: string
          created_at?: string
          date_usage?: Json | null
          description?: string
          id?: string
          project_id?: string
          remaining_quantity?: number | null
          total_quantity?: number
          updated_at?: string
          used_quantity?: number
        }
        Relationships: []
      }
      progress_updates: {
        Row: {
          created_at: string
          description: string
          id: string
          photos_url: string[] | null
          progress_percentage: number
          project_id: string
          update_date: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          photos_url?: string[] | null
          progress_percentage: number
          project_id: string
          update_date?: string
          updated_by: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          photos_url?: string[] | null
          progress_percentage?: number
          project_id?: string
          update_date?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          assigned_members: string[] | null
          budget: number
          created_at: string
          description: string | null
          end_date: string
          id: string
          location: string
          name: string
          progress: number
          start_date: string
          status: string
          team_name: string | null
          updated_at: string
        }
        Insert: {
          assigned_members?: string[] | null
          budget?: number
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          location: string
          name: string
          progress?: number
          start_date: string
          status?: string
          team_name?: string | null
          updated_at?: string
        }
        Update: {
          assigned_members?: string[] | null
          budget?: number
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          location?: string
          name?: string
          progress?: number
          start_date?: string
          status?: string
          team_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          email: string | null
          experience: string | null
          id: string
          join_date: string | null
          last_update: string | null
          name: string
          phone: string | null
          projects: string | null
          role: string | null
          specialty: string | null
          status: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          experience?: string | null
          id?: string
          join_date?: string | null
          last_update?: string | null
          name: string
          phone?: string | null
          projects?: string | null
          role?: string | null
          specialty?: string | null
          status?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          experience?: string | null
          id?: string
          join_date?: string | null
          last_update?: string | null
          name?: string
          phone?: string | null
          projects?: string | null
          role?: string | null
          specialty?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_request_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_team_member_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
