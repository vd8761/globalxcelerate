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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          additional_answers: Json | null
          cover_letter: string | null
          created_at: string | null
          documents: Json | null
          id: string
          match_score_at_submission: number | null
          opportunity_id: string
          reference_number: string
          reviewed_by: string | null
          reviewer_notes: string | null
          status: Database["public"]["Enums"]["application_status_enum"]
          student_id: string
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          additional_answers?: Json | null
          cover_letter?: string | null
          created_at?: string | null
          documents?: Json | null
          id?: string
          match_score_at_submission?: number | null
          opportunity_id: string
          reference_number: string
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["application_status_enum"]
          student_id: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_answers?: Json | null
          cover_letter?: string | null
          created_at?: string | null
          documents?: Json | null
          id?: string
          match_score_at_submission?: number | null
          opportunity_id?: string
          reference_number?: string
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["application_status_enum"]
          student_id?: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      industries: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      match_scores: {
        Row: {
          computed_at: string | null
          dimension_scores: Json
          expires_at: string | null
          explanation: string | null
          gaps: Json | null
          id: string
          opportunity_id: string
          strengths: Json | null
          student_id: string
          total_score: number
        }
        Insert: {
          computed_at?: string | null
          dimension_scores?: Json
          expires_at?: string | null
          explanation?: string | null
          gaps?: Json | null
          id?: string
          opportunity_id: string
          strengths?: Json | null
          student_id: string
          total_score: number
        }
        Update: {
          computed_at?: string | null
          dimension_scores?: Json
          expires_at?: string | null
          explanation?: string | null
          gaps?: Json | null
          id?: string
          opportunity_id?: string
          strengths?: Json | null
          student_id?: string
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_scores_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          application_deadline: string | null
          application_fields: Json | null
          benefits: Json | null
          category: Database["public"]["Enums"]["opportunity_category_enum"]
          compensation_currency: string | null
          compensation_max: number | null
          compensation_min: number | null
          compensation_period: Database["public"]["Enums"]["compensation_period_enum"] | null
          compensation_type: Database["public"]["Enums"]["compensation_type_enum"] | null
          created_at: string | null
          description: string
          description_plain: string | null
          duration_unit: Database["public"]["Enums"]["duration_unit_enum"] | null
          duration_value: number | null
          end_date: string | null
          featured: boolean | null
          id: string
          industry: string | null
          location_city: string | null
          location_country: string
          organization_id: string
          posted_by: string | null
          published_at: string | null
          requirements: Json | null
          responsibilities: Json | null
          search_vector: unknown
          slug: string
          spots_available: number | null
          spots_filled: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["opportunity_status_enum"]
          title: string
          updated_at: string | null
          view_count: number | null
          visa_support: boolean | null
          work_mode: Database["public"]["Enums"]["work_mode_enum"]
        }
        Insert: {
          application_deadline?: string | null
          application_fields?: Json | null
          benefits?: Json | null
          category: Database["public"]["Enums"]["opportunity_category_enum"]
          compensation_currency?: string | null
          compensation_max?: number | null
          compensation_min?: number | null
          compensation_period?: Database["public"]["Enums"]["compensation_period_enum"] | null
          compensation_type?: Database["public"]["Enums"]["compensation_type_enum"] | null
          created_at?: string | null
          description: string
          description_plain?: string | null
          duration_unit?: Database["public"]["Enums"]["duration_unit_enum"] | null
          duration_value?: number | null
          end_date?: string | null
          featured?: boolean | null
          id?: string
          industry?: string | null
          location_city?: string | null
          location_country: string
          organization_id: string
          posted_by?: string | null
          published_at?: string | null
          requirements?: Json | null
          responsibilities?: Json | null
          search_vector?: unknown
          slug: string
          spots_available?: number | null
          spots_filled?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["opportunity_status_enum"]
          title: string
          updated_at?: string | null
          view_count?: number | null
          visa_support?: boolean | null
          work_mode?: Database["public"]["Enums"]["work_mode_enum"]
        }
        Update: {
          application_deadline?: string | null
          application_fields?: Json | null
          benefits?: Json | null
          category?: Database["public"]["Enums"]["opportunity_category_enum"]
          compensation_currency?: string | null
          compensation_max?: number | null
          compensation_min?: number | null
          compensation_period?: Database["public"]["Enums"]["compensation_period_enum"] | null
          compensation_type?: Database["public"]["Enums"]["compensation_type_enum"] | null
          created_at?: string | null
          description?: string
          description_plain?: string | null
          duration_unit?: Database["public"]["Enums"]["duration_unit_enum"] | null
          duration_value?: number | null
          end_date?: string | null
          featured?: boolean | null
          id?: string
          industry?: string | null
          location_city?: string | null
          location_country?: string
          organization_id?: string
          posted_by?: string | null
          published_at?: string | null
          requirements?: Json | null
          responsibilities?: Json | null
          search_vector?: unknown
          slug?: string
          spots_available?: number | null
          spots_filled?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["opportunity_status_enum"]
          title?: string
          updated_at?: string | null
          view_count?: number | null
          visa_support?: boolean | null
          work_mode?: Database["public"]["Enums"]["work_mode_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_analytics: {
        Row: {
          created_at: string | null
          event: Database["public"]["Enums"]["analytics_event_enum"]
          id: string
          metadata: Json | null
          opportunity_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event: Database["public"]["Enums"]["analytics_event_enum"]
          id?: string
          metadata?: Json | null
          opportunity_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event?: Database["public"]["Enums"]["analytics_event_enum"]
          id?: string
          metadata?: Json | null
          opportunity_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_analytics_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_skills: {
        Row: {
          id: string
          importance: Database["public"]["Enums"]["skill_importance_enum"]
          min_proficiency: number | null
          opportunity_id: string
          skill_id: string
        }
        Insert: {
          id?: string
          importance?: Database["public"]["Enums"]["skill_importance_enum"]
          min_proficiency?: number | null
          opportunity_id: string
          skill_id: string
        }
        Update: {
          id?: string
          importance?: Database["public"]["Enums"]["skill_importance_enum"]
          min_proficiency?: number | null
          opportunity_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_skills_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills_master"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          industry: string | null
          location_city: string | null
          location_country: string | null
          logo_url: string | null
          name: string
          opportunities_count: number | null
          size: string | null
          updated_at: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          location_city?: string | null
          location_country?: string | null
          logo_url?: string | null
          name: string
          opportunities_count?: number | null
          size?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          location_city?: string | null
          location_country?: string | null
          logo_url?: string | null
          name?: string
          opportunities_count?: number | null
          size?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      saved_opportunities: {
        Row: {
          id: string
          opportunity_id: string
          saved_at: string | null
          student_id: string
        }
        Insert: {
          id?: string
          opportunity_id: string
          saved_at?: string | null
          student_id: string
        }
        Update: {
          id?: string
          opportunity_id?: string
          saved_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      skills_master: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          career_goals: Json | null
          created_at: string | null
          current_city: string | null
          current_country: string | null
          degree_level: string | null
          email: string | null
          experience_months: number | null
          field_of_study: string | null
          first_name: string | null
          gpa: number | null
          id: string
          languages: Json | null
          last_name: string | null
          nationality: string | null
          onboarding_completed: boolean | null
          profile_completion: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          career_goals?: Json | null
          created_at?: string | null
          current_city?: string | null
          current_country?: string | null
          degree_level?: string | null
          email?: string | null
          experience_months?: number | null
          field_of_study?: string | null
          first_name?: string | null
          gpa?: number | null
          id?: string
          languages?: Json | null
          last_name?: string | null
          nationality?: string | null
          onboarding_completed?: boolean | null
          profile_completion?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          career_goals?: Json | null
          created_at?: string | null
          current_city?: string | null
          current_country?: string | null
          degree_level?: string | null
          email?: string | null
          experience_months?: number | null
          field_of_study?: string | null
          first_name?: string | null
          gpa?: number | null
          id?: string
          languages?: Json | null
          last_name?: string | null
          nationality?: string | null
          onboarding_completed?: boolean | null
          profile_completion?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      student_skills: {
        Row: {
          id: string
          proficiency_level: number | null
          skill_id: string
          student_id: string
        }
        Insert: {
          id?: string
          proficiency_level?: number | null
          skill_id: string
          student_id: string
        }
        Update: {
          id?: string
          proficiency_level?: number | null
          skill_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills_master"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_skills_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      analytics_event_enum:
        | "view"
        | "save"
        | "unsave"
        | "share"
        | "apply_start"
        | "apply_submit"
        | "click_from_card"
      application_status_enum:
        | "submitted"
        | "under_review"
        | "shortlisted"
        | "interview"
        | "offered"
        | "accepted"
        | "rejected"
        | "withdrawn"
      compensation_period_enum:
        | "hourly"
        | "weekly"
        | "monthly"
        | "annual"
        | "total"
      compensation_type_enum: "paid" | "stipend" | "unpaid" | "scholarship"
      duration_unit_enum: "weeks" | "months" | "years"
      opportunity_category_enum:
        | "internships"
        | "global_immersion"
        | "exchange"
        | "industry_projects"
        | "research"
        | "scholarships"
        | "graduate_careers"
      opportunity_status_enum:
        | "draft"
        | "pending_review"
        | "published"
        | "closed"
        | "archived"
      skill_importance_enum: "required" | "preferred" | "nice_to_have"
      work_mode_enum: "on_site" | "remote" | "hybrid"
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
      analytics_event_enum: [
        "view",
        "save",
        "unsave",
        "share",
        "apply_start",
        "apply_submit",
        "click_from_card",
      ],
      application_status_enum: [
        "submitted",
        "under_review",
        "shortlisted",
        "interview",
        "offered",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      compensation_period_enum: [
        "hourly",
        "weekly",
        "monthly",
        "annual",
        "total",
      ],
      compensation_type_enum: ["paid", "stipend", "unpaid", "scholarship"],
      duration_unit_enum: ["weeks", "months", "years"],
      opportunity_category_enum: [
        "internships",
        "global_immersion",
        "exchange",
        "industry_projects",
        "research",
        "scholarships",
        "graduate_careers",
      ],
      opportunity_status_enum: [
        "draft",
        "pending_review",
        "published",
        "closed",
        "archived",
      ],
      skill_importance_enum: ["required", "preferred", "nice_to_have"],
      work_mode_enum: ["on_site", "remote", "hybrid"],
    },
  },
} as const
