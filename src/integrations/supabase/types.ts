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
      daily_outcomes: {
        Row: {
          accomplishments: string[] | null
          created_at: string | null
          date: string
          id: string
          lessons_learned: string | null
          performance_rating: number | null
          prev_day_tasks: Json | null
          today_focus: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accomplishments?: string[] | null
          created_at?: string | null
          date?: string
          id?: string
          lessons_learned?: string | null
          performance_rating?: number | null
          prev_day_tasks?: Json | null
          today_focus?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accomplishments?: string[] | null
          created_at?: string | null
          date?: string
          id?: string
          lessons_learned?: string | null
          performance_rating?: number | null
          prev_day_tasks?: Json | null
          today_focus?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          recipient_id: string | null
          sender_id: string
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id?: string | null
          sender_id: string
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id?: string | null
          sender_id?: string
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          completed_onboarding: boolean
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          completed_onboarding?: boolean
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          completed_onboarding?: boolean
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reverse_planning: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          milestone_title: string
          order_index: number | null
          status: string
          task_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          milestone_title: string
          order_index?: number | null
          status?: string
          task_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          milestone_title?: string
          order_index?: number | null
          status?: string
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reverse_planning_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_breakdowns: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          order_index: number | null
          parent_task_id: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          parent_task_id: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          parent_task_id?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_breakdowns_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          achievable: boolean | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          due_time: string | null
          has_reverse_plan: boolean | null
          has_subtasks: boolean | null
          id: string
          measurable: string | null
          priority: string
          progress: number | null
          relevant: string | null
          reminder_set: boolean | null
          reminder_time: string | null
          specific: string | null
          start_date: string | null
          status: string
          tags: string[] | null
          time_bound: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          achievable?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          has_reverse_plan?: boolean | null
          has_subtasks?: boolean | null
          id?: string
          measurable?: string | null
          priority?: string
          progress?: number | null
          relevant?: string | null
          reminder_set?: boolean | null
          reminder_time?: string | null
          specific?: string | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          time_bound?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          achievable?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          has_reverse_plan?: boolean | null
          has_subtasks?: boolean | null
          id?: string
          measurable?: string | null
          priority?: string
          progress?: number | null
          relevant?: string | null
          reminder_set?: boolean | null
          reminder_time?: string | null
          specific?: string | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          time_bound?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_tasks: {
        Row: {
          created_at: string
          id: string
          task_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          task_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          task_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      timer_sessions: {
        Row: {
          break_duration: number | null
          completed: boolean | null
          created_at: string | null
          end_time: string | null
          id: string
          notes: string | null
          start_time: string
          task_id: string | null
          user_id: string
          work_duration: number | null
        }
        Insert: {
          break_duration?: number | null
          completed?: boolean | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time: string
          task_id?: string | null
          user_id: string
          work_duration?: number | null
        }
        Update: {
          break_duration?: number | null
          completed?: boolean | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string
          task_id?: string | null
          user_id?: string
          work_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "timer_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_outcomes: {
        Row: {
          created_at: string | null
          education_goals: string[] | null
          education_steps: string[] | null
          health_goals: string[] | null
          health_steps: string[] | null
          id: string
          reflection: string | null
          updated_at: string | null
          user_id: string
          week_start_date: string
          work_goals: string[] | null
          work_steps: string[] | null
        }
        Insert: {
          created_at?: string | null
          education_goals?: string[] | null
          education_steps?: string[] | null
          health_goals?: string[] | null
          health_steps?: string[] | null
          id?: string
          reflection?: string | null
          updated_at?: string | null
          user_id: string
          week_start_date: string
          work_goals?: string[] | null
          work_steps?: string[] | null
        }
        Update: {
          created_at?: string | null
          education_goals?: string[] | null
          education_steps?: string[] | null
          health_goals?: string[] | null
          health_steps?: string[] | null
          id?: string
          reflection?: string | null
          updated_at?: string | null
          user_id?: string
          week_start_date?: string
          work_goals?: string[] | null
          work_steps?: string[] | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
