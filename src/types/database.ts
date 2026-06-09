export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type StudyStatus = 'not_started' | 'in_progress' | 'completed'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type TestType = 'MCQ' | 'Coding' | 'Mixed'
export type TestStatus = 'pending' | 'in_progress' | 'completed' | 'abandoned'
export type TestDefinitionType = 'mcq' | 'subjective' | 'coding' | 'mixed'
export type TestScheduleType = 'revision_2d' | 'cumulative_5d' | 'manual'
export type TestQuestionType = 'mcq' | 'subjective' | 'coding'
export type TestAttemptStatus = 'in_progress' | 'completed' | 'auto_submitted' | 'abandoned'
export type ViolationEventType =
  | 'tab_switch'
  | 'window_blur'
  | 'copy_attempt'
  | 'paste_attempt'
  | 'idle_time'
  | 'fullscreen_exit'
export type AppRole = 'user' | 'admin'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          college: string | null
          target_role: string | null
          github_username: string | null
          app_role: AppRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          college?: string | null
          target_role?: string | null
          github_username?: string | null
          app_role?: AppRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          college?: string | null
          target_role?: string | null
          github_username?: string | null
          app_role?: AppRole
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      study_progress: {
        Row: {
          id: string
          user_id: string
          module_id: string
          module_name: string
          phase: string
          status: StudyStatus
          progress_percent: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          module_name: string
          phase: string
          status?: StudyStatus
          progress_percent?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          module_name?: string
          phase?: string
          status?: StudyStatus
          progress_percent?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'study_progress_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      dsa_progress: {
        Row: {
          id: string
          user_id: string
          problem_title: string
          platform: string
          difficulty: Difficulty
          pattern: string | null
          problem_url: string | null
          solved: boolean
          notes: string | null
          solved_at: string | null
          attempts: number
          time_taken_minutes: number | null
          status: string
          roadmap_item_id: string | null
          study_day: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          problem_title: string
          platform?: string
          difficulty: Difficulty
          pattern?: string | null
          problem_url?: string | null
          solved?: boolean
          notes?: string | null
          solved_at?: string | null
          attempts?: number
          time_taken_minutes?: number | null
          status?: string
          roadmap_item_id?: string | null
          study_day?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          problem_title?: string
          platform?: string
          difficulty?: Difficulty
          pattern?: string | null
          problem_url?: string | null
          solved?: boolean
          notes?: string | null
          solved_at?: string | null
          attempts?: number
          time_taken_minutes?: number | null
          status?: string
          roadmap_item_id?: string | null
          study_day?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'dsa_progress_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      tests: {
        Row: {
          id: string
          user_id: string
          title: string
          test_type: TestType
          difficulty: Difficulty | null
          score: number | null
          max_score: number
          duration_minutes: number | null
          status: TestStatus
          proctored: boolean
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          test_type: TestType
          difficulty?: Difficulty | null
          score?: number | null
          max_score?: number
          duration_minutes?: number | null
          status?: TestStatus
          proctored?: boolean
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          test_type?: TestType
          difficulty?: Difficulty | null
          score?: number | null
          max_score?: number
          duration_minutes?: number | null
          status?: TestStatus
          proctored?: boolean
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tests_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          tags: string[]
          linked_module_id: string | null
          linked_problem_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string
          tags?: string[]
          linked_module_id?: string | null
          linked_problem_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          tags?: string[]
          linked_module_id?: string | null
          linked_problem_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notes_linked_problem_id_fkey'
            columns: ['linked_problem_id']
            isOneToOne: false
            referencedRelation: 'dsa_progress'
            referencedColumns: ['id']
          },
        ]
      }
      github_reviews: {
        Row: {
          id: string
          user_id: string
          github_username: string
          repo_name: string
          repo_url: string | null
          language: string | null
          stars: number
          score: number | null
          documentation_score: number | null
          structure_score: number | null
          engineering_score: number | null
          summary: string | null
          report: Json
          repo_metadata: Json
          strengths: Json
          improvements: Json
          reviewed_at: string
          created_at: string
          study_day: number | null
          assignment_id: string | null
          assignment_title: string | null
        }
        Insert: {
          id?: string
          user_id: string
          github_username: string
          repo_name: string
          repo_url?: string | null
          language?: string | null
          stars?: number
          score?: number | null
          documentation_score?: number | null
          structure_score?: number | null
          engineering_score?: number | null
          summary?: string | null
          report?: Json
          repo_metadata?: Json
          strengths?: Json
          improvements?: Json
          reviewed_at?: string
          created_at?: string
          study_day?: number | null
          assignment_id?: string | null
          assignment_title?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          github_username?: string
          repo_name?: string
          repo_url?: string | null
          language?: string | null
          stars?: number
          score?: number | null
          documentation_score?: number | null
          structure_score?: number | null
          engineering_score?: number | null
          summary?: string | null
          report?: Json
          repo_metadata?: Json
          strengths?: Json
          improvements?: Json
          reviewed_at?: string
          created_at?: string
          study_day?: number | null
          assignment_id?: string | null
          assignment_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'github_reviews_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      analytics: {
        Row: {
          id: string
          user_id: string
          metric_date: string
          problems_solved: number
          study_hours: number
          tests_completed: number
          streak_days: number
          readiness_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          metric_date: string
          problems_solved?: number
          study_hours?: number
          tests_completed?: number
          streak_days?: number
          readiness_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          metric_date?: string
          problems_solved?: number
          study_hours?: number
          tests_completed?: number
          streak_days?: number
          readiness_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'analytics_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      study_day_progress: {
        Row: {
          id: string
          user_id: string
          day_number: number
          notes: string
          time_spent_minutes: number
          completed_items: Json
          status: StudyStatus
          progress_percent: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          day_number: number
          notes?: string
          time_spent_minutes?: number
          completed_items?: Json
          status?: StudyStatus
          progress_percent?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          day_number?: number
          notes?: string
          time_spent_minutes?: number
          completed_items?: Json
          status?: StudyStatus
          progress_percent?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'study_day_progress_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          topic: string | null
          provider: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          topic?: string | null
          provider?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          topic?: string | null
          provider?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_conversations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      ai_messages: {
        Row: {
          id: string
          conversation_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_messages_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'ai_conversations'
            referencedColumns: ['id']
          },
        ]
      }
      test_definitions: {
        Row: {
          id: string
          title: string
          description: string | null
          test_type: TestDefinitionType
          schedule_type: TestScheduleType
          duration_minutes: number
          difficulty: Difficulty | null
          topics: Json
          max_score: number
          is_active: boolean
          covered_study_days: number[]
          sections: Json
          max_attempts: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          test_type: TestDefinitionType
          schedule_type?: TestScheduleType
          duration_minutes?: number
          difficulty?: Difficulty | null
          topics?: Json
          max_score?: number
          is_active?: boolean
          covered_study_days?: number[]
          sections?: Json
          max_attempts?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          test_type?: TestDefinitionType
          schedule_type?: TestScheduleType
          duration_minutes?: number
          difficulty?: Difficulty | null
          topics?: Json
          max_score?: number
          is_active?: boolean
          covered_study_days?: number[]
          sections?: Json
          max_attempts?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      dsa_practice_attempts: {
        Row: {
          id: string
          user_id: string
          question_id: string
          test_definition_id: string | null
          language: string
          code: string
          time_complexity: string
          space_complexity: string
          visible_results: Json
          hidden_results: Json
          score: number
          max_score: number
          complexity_time_correct: boolean
          complexity_space_correct: boolean
          ai_analysis: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          test_definition_id?: string | null
          language?: string
          code: string
          time_complexity?: string
          space_complexity?: string
          visible_results?: Json
          hidden_results?: Json
          score?: number
          max_score?: number
          complexity_time_correct?: boolean
          complexity_space_correct?: boolean
          ai_analysis?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          test_definition_id?: string | null
          language?: string
          code?: string
          time_complexity?: string
          space_complexity?: string
          visible_results?: Json
          hidden_results?: Json
          score?: number
          max_score?: number
          complexity_time_correct?: boolean
          complexity_space_correct?: boolean
          ai_analysis?: string | null
          created_at?: string
        }
        Relationships: []
      }
      test_questions: {
        Row: {
          id: string
          test_definition_id: string
          question_type: TestQuestionType
          title: string
          body: string
          options: Json | null
          correct_answer: string | null
          rubric: string | null
          starter_code: string | null
          metadata: Json
          points: number
          order_index: number
          study_day: number | null
          topic: string | null
          created_at: string
        }
        Insert: {
          id?: string
          test_definition_id: string
          question_type: TestQuestionType
          title: string
          body?: string
          options?: Json | null
          correct_answer?: string | null
          rubric?: string | null
          starter_code?: string | null
          metadata?: Json
          points?: number
          order_index?: number
          study_day?: number | null
          topic?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          test_definition_id?: string
          question_type?: TestQuestionType
          title?: string
          body?: string
          options?: Json | null
          correct_answer?: string | null
          rubric?: string | null
          starter_code?: string | null
          metadata?: Json
          points?: number
          order_index?: number
          study_day?: number | null
          topic?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'test_questions_test_definition_id_fkey'
            columns: ['test_definition_id']
            isOneToOne: false
            referencedRelation: 'test_definitions'
            referencedColumns: ['id']
          },
        ]
      }
      test_attempts: {
        Row: {
          id: string
          user_id: string
          test_definition_id: string
          status: TestAttemptStatus
          score: number | null
          max_score: number
          started_at: string
          completed_at: string | null
          time_spent_seconds: number | null
          expires_at: string
          answers: Json
          selected_question_ids: string[]
          auto_submitted: boolean
          schedule_day: number | null
          covered_study_days: number[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          test_definition_id: string
          status?: TestAttemptStatus
          score?: number | null
          max_score: number
          started_at?: string
          completed_at?: string | null
          time_spent_seconds?: number | null
          expires_at: string
          answers?: Json
          selected_question_ids?: string[]
          auto_submitted?: boolean
          schedule_day?: number | null
          covered_study_days?: number[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          test_definition_id?: string
          status?: TestAttemptStatus
          score?: number | null
          max_score?: number
          started_at?: string
          completed_at?: string | null
          time_spent_seconds?: number | null
          expires_at?: string
          answers?: Json
          selected_question_ids?: string[]
          auto_submitted?: boolean
          schedule_day?: number | null
          covered_study_days?: number[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'test_attempts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'test_attempts_test_definition_id_fkey'
            columns: ['test_definition_id']
            isOneToOne: false
            referencedRelation: 'test_definitions'
            referencedColumns: ['id']
          },
        ]
      }
      test_violations: {
        Row: {
          id: string
          user_id: string
          test_attempt_id: string | null
          event_type: ViolationEventType
          occurred_at: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          test_attempt_id?: string | null
          event_type: ViolationEventType
          occurred_at?: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          test_attempt_id?: string | null
          event_type?: ViolationEventType
          occurred_at?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'test_violations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'test_violations_test_attempt_id_fkey'
            columns: ['test_attempt_id']
            isOneToOne: false
            referencedRelation: 'test_attempts'
            referencedColumns: ['id']
          },
        ]
      }
      study_plans: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      study_plan_days: {
        Row: {
          id: string
          plan_id: string
          day_number: number
          title: string
          subtitle: string
          estimated_minutes: number
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          day_number: number
          title: string
          subtitle?: string
          estimated_minutes?: number
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          day_number?: number
          title?: string
          subtitle?: string
          estimated_minutes?: number
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'study_plan_days_plan_id_fkey'
            columns: ['plan_id']
            isOneToOne: false
            referencedRelation: 'study_plans'
            referencedColumns: ['id']
          },
        ]
      }
      study_plan_items: {
        Row: {
          id: string
          day_id: string
          section: string
          title: string
          description: string | null
          sort_order: number
          leetcode_slug: string | null
          difficulty: string | null
          topic: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          day_id: string
          section: string
          title: string
          description?: string | null
          sort_order?: number
          leetcode_slug?: string | null
          difficulty?: string | null
          topic?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          day_id?: string
          section?: string
          title?: string
          description?: string | null
          sort_order?: number
          leetcode_slug?: string | null
          difficulty?: string | null
          topic?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'study_plan_items_day_id_fkey'
            columns: ['day_id']
            isOneToOne: false
            referencedRelation: 'study_plan_days'
            referencedColumns: ['id']
          },
        ]
      }
      study_plan_item_resources: {
        Row: {
          id: string
          item_id: string
          title: string
          url: string
          resource_type: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          item_id: string
          title: string
          url: string
          resource_type?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          title?: string
          url?: string
          resource_type?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'study_plan_item_resources_item_id_fkey'
            columns: ['item_id']
            isOneToOne: false
            referencedRelation: 'study_plan_items'
            referencedColumns: ['id']
          },
        ]
      }
      study_plan_prompts: {
        Row: {
          id: string
          day_id: string
          title: string
          prompt_text: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          day_id: string
          title: string
          prompt_text: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          day_id?: string
          title?: string
          prompt_text?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'study_plan_prompts_day_id_fkey'
            columns: ['day_id']
            isOneToOne: false
            referencedRelation: 'study_plan_days'
            referencedColumns: ['id']
          },
        ]
      }
      resource_catalog: {
        Row: {
          id: string
          title: string
          url: string
          provider: string
          category: string
          status: string
          fallback_url: string | null
          fallback_title: string | null
          last_checked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          url: string
          provider?: string
          category?: string
          status?: string
          fallback_url?: string | null
          fallback_title?: string | null
          last_checked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          url?: string
          provider?: string
          category?: string
          status?: string
          fallback_url?: string | null
          fallback_title?: string | null
          last_checked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_prompts: {
        Row: {
          id: string
          category: string
          title: string
          description: string | null
          prompt_text: string
          metadata: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id: string
          category?: string
          title: string
          description?: string | null
          prompt_text: string
          metadata?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          category?: string
          title?: string
          description?: string | null
          prompt_text?: string
          metadata?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      prompt_library_items: {
        Row: {
          id: string
          title: string
          category: string
          description: string
          prompt: string
          tags: string[]
          is_published: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          category: string
          description?: string
          prompt: string
          tags?: string[]
          is_published?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          description?: string
          prompt?: string
          tags?: string[]
          is_published?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      delete_study_plan_day_and_renumber: {
        Args: { p_plan_id: string; p_day_number: number }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type UserRow = Database['public']['Tables']['users']['Row']
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type StudyProgressRow = Database['public']['Tables']['study_progress']['Row']
export type DsaProgressRow = Database['public']['Tables']['dsa_progress']['Row']
export type DsaProgressInsert = Database['public']['Tables']['dsa_progress']['Insert']
export type DsaProgressUpdate = Database['public']['Tables']['dsa_progress']['Update']
export type TestRow = Database['public']['Tables']['tests']['Row']
export type NoteRow = Database['public']['Tables']['notes']['Row']
export type GithubReviewRow = Database['public']['Tables']['github_reviews']['Row']
export type AnalyticsRow = Database['public']['Tables']['analytics']['Row']
export type StudyDayProgressRow = Database['public']['Tables']['study_day_progress']['Row']
export type StudyDayProgressInsert = Database['public']['Tables']['study_day_progress']['Insert']
export type StudyDayProgressUpdate = Database['public']['Tables']['study_day_progress']['Update']
export type AiConversationRow = Database['public']['Tables']['ai_conversations']['Row']
export type AiMessageRow = Database['public']['Tables']['ai_messages']['Row']
export type TestDefinitionRow = Database['public']['Tables']['test_definitions']['Row']
export type TestQuestionRow = Database['public']['Tables']['test_questions']['Row']
export type TestAttemptRow = Database['public']['Tables']['test_attempts']['Row']
export type TestAttemptInsert = Database['public']['Tables']['test_attempts']['Insert']
export type TestAttemptUpdate = Database['public']['Tables']['test_attempts']['Update']
export type TestViolationRow = Database['public']['Tables']['test_violations']['Row']
export type TestViolationInsert = Database['public']['Tables']['test_violations']['Insert']
