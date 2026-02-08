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
      alerts: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          project_id: string
          severity: string
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          project_id: string
          severity: string
          status?: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          project_id?: string
          severity?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_alerts_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alerts_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_feedback: {
        Row: {
          anonymous_id: string
          category_id: string
          content: string
          created_at: string | null
          id: string
          is_flagged: boolean | null
          project_id: string
          read_by: string[] | null
          sentiment: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          anonymous_id: string
          category_id: string
          content: string
          created_at?: string | null
          id?: string
          is_flagged?: boolean | null
          project_id: string
          read_by?: string[] | null
          sentiment?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          anonymous_id?: string
          category_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_flagged?: boolean | null
          project_id?: string
          read_by?: string[] | null
          sentiment?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_feedback_anonymous_id_fkey"
            columns: ["anonymous_id"]
            isOneToOne: false
            referencedRelation: "anonymous_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anonymous_feedback_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "feedback_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anonymous_feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anonymous_feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_identities: {
        Row: {
          avatar_seed: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          owner_hash: string
          project_id: string
          pseudonym: string
          reputation_score: number | null
        }
        Insert: {
          avatar_seed?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          owner_hash: string
          project_id: string
          pseudonym: string
          reputation_score?: number | null
        }
        Update: {
          avatar_seed?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          owner_hash?: string
          project_id?: string
          pseudonym?: string
          reputation_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_identities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anonymous_identities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      baloria_answers: {
        Row: {
          author_id: string
          content: string
          created_at: string
          hearts_count: number
          id: string
          is_accepted: boolean
          question_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          hearts_count?: number
          id?: string
          is_accepted?: boolean
          question_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          hearts_count?: number
          id?: string
          is_accepted?: boolean
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "baloria_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "baloria_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      baloria_chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "baloria_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "baloria_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      baloria_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant_one: string
          participant_two: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_one: string
          participant_two: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_one?: string
          participant_two?: string
        }
        Relationships: []
      }
      baloria_hearts: {
        Row: {
          created_at: string
          id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      baloria_questions: {
        Row: {
          answers_count: number
          author_id: string
          created_at: string
          hearts_count: number
          id: string
          is_anonymous: boolean
          project_id: string
          question: string
          status: string
          theme: string
          theme_color: string
          updated_at: string
        }
        Insert: {
          answers_count?: number
          author_id: string
          created_at?: string
          hearts_count?: number
          id?: string
          is_anonymous?: boolean
          project_id: string
          question: string
          status?: string
          theme?: string
          theme_color?: string
          updated_at?: string
        }
        Update: {
          answers_count?: number
          author_id?: string
          created_at?: string
          hearts_count?: number
          id?: string
          is_anonymous?: boolean
          project_id?: string
          question?: string
          status?: string
          theme?: string
          theme_color?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "baloria_questions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baloria_questions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      baloria_themes: {
        Row: {
          color: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          questions_count: number
          sort_order: number
        }
        Insert: {
          color: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          questions_count?: number
          sort_order?: number
        }
        Update: {
          color?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          questions_count?: number
          sort_order?: number
        }
        Relationships: []
      }
      baloria_user_stats: {
        Row: {
          answers_count: number
          hearts_received: number
          id: string
          level: number
          points: number
          questions_count: number
          streak_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          answers_count?: number
          hearts_received?: number
          id?: string
          level?: number
          points?: number
          questions_count?: number
          streak_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          answers_count?: number
          hearts_received?: number
          id?: string
          level?: number
          points?: number
          questions_count?: number
          streak_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      baztion_feedback: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          feedback_type: string
          id: string
          is_resolved: boolean | null
          project_id: string
          sentiment: string | null
          target_user_id: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          feedback_type: string
          id?: string
          is_resolved?: boolean | null
          project_id: string
          sentiment?: string | null
          target_user_id?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          feedback_type?: string
          id?: string
          is_resolved?: boolean | null
          project_id?: string
          sentiment?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "baztion_feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baztion_feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      baztion_metrics: {
        Row: {
          id: string
          metric_type: string
          percentage: number | null
          project_id: string
          recorded_at: string | null
          trend: string | null
          value: number
        }
        Insert: {
          id?: string
          metric_type: string
          percentage?: number | null
          project_id: string
          recorded_at?: string | null
          trend?: string | null
          value: number
        }
        Update: {
          id?: string
          metric_type?: string
          percentage?: number | null
          project_id?: string
          recorded_at?: string | null
          trend?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "baztion_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baztion_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      baztion_posts: {
        Row: {
          author_id: string | null
          category: string | null
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          post_type: string
          project_id: string
          status: string | null
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          post_type: string
          project_id: string
          status?: string | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          post_type?: string
          project_id?: string
          status?: string | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "baztion_posts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baztion_posts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_ips: {
        Row: {
          auto_blocked: boolean | null
          block_count: number | null
          blocked_at: string
          blocked_by: string | null
          blocked_until: string | null
          expires_at: string | null
          id: string
          ip_address: string
          is_permanent: boolean | null
          reason: string
        }
        Insert: {
          auto_blocked?: boolean | null
          block_count?: number | null
          blocked_at?: string
          blocked_by?: string | null
          blocked_until?: string | null
          expires_at?: string | null
          id?: string
          ip_address: string
          is_permanent?: boolean | null
          reason: string
        }
        Update: {
          auto_blocked?: boolean | null
          block_count?: number | null
          blocked_at?: string
          blocked_by?: string | null
          blocked_until?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string
          is_permanent?: boolean | null
          reason?: string
        }
        Relationships: []
      }
      category_managers: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          category_id: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          category_id: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          category_id?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_managers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "feedback_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_managers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_managers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      company_codes: {
        Row: {
          code: string
          company_name: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_users: number | null
          project_id: string
          used_count: number | null
        }
        Insert: {
          code: string
          company_name: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_users?: number | null
          project_id: string
          used_count?: number | null
        }
        Update: {
          code?: string
          company_name?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_users?: number | null
          project_id?: string
          used_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_codes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_codes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          project_id: string
          project_source: string
          replied_at: string | null
          replied_by: string | null
          reply_message: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          project_id: string
          project_source: string
          replied_at?: string | null
          replied_by?: string | null
          reply_message?: string | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          project_id?: string
          project_source?: string
          replied_at?: string | null
          replied_by?: string | null
          reply_message?: string | null
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_contact_messages_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contact_messages_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      echo_score_sync: {
        Row: {
          contributions: number | null
          created_at: string
          id: string
          level: number
          missions_completed: number | null
          score: number
          synced_at: string
          user_id: string | null
        }
        Insert: {
          contributions?: number | null
          created_at?: string
          id?: string
          level: number
          missions_completed?: number | null
          score: number
          synced_at?: string
          user_id?: string | null
        }
        Update: {
          contributions?: number | null
          created_at?: string
          id?: string
          level?: number
          missions_completed?: number | null
          score?: number
          synced_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      employee_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          created_by: string
          department: string | null
          display_name: string
          email: string
          id: string
          invitation_code: string
          job_title: string | null
          location: string | null
          manager_id: string | null
          phone: string | null
          project_id: string
          revoked_at: string | null
          revoked_by: string | null
          start_date: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          created_by: string
          department?: string | null
          display_name: string
          email: string
          id?: string
          invitation_code: string
          job_title?: string | null
          location?: string | null
          manager_id?: string | null
          phone?: string | null
          project_id: string
          revoked_at?: string | null
          revoked_by?: string | null
          start_date?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          created_by?: string
          department?: string | null
          display_name?: string
          email?: string
          id?: string
          invitation_code?: string
          job_title?: string | null
          location?: string | null
          manager_id?: string | null
          phone?: string | null
          project_id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          start_date?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_invitations_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          project_id: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          project_id: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          project_id?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_categories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_categories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_bridge: {
        Row: {
          access_reason: string | null
          accessed_at: string | null
          anonymous_id: string
          created_at: string | null
          encrypted_user_id: string
          id: string
          project_id: string
        }
        Insert: {
          access_reason?: string | null
          accessed_at?: string | null
          anonymous_id: string
          created_at?: string | null
          encrypted_user_id: string
          id?: string
          project_id: string
        }
        Update: {
          access_reason?: string | null
          accessed_at?: string | null
          anonymous_id?: string
          created_at?: string | null
          encrypted_user_id?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_bridge_anonymous_id_fkey"
            columns: ["anonymous_id"]
            isOneToOne: false
            referencedRelation: "anonymous_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_bridge_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_bridge_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      kudos: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          message: string
          project_id: string
          recipient_id: string
          sender_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          message: string
          project_id: string
          recipient_id: string
          sender_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          message?: string
          project_id?: string
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kudos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reads: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          archived_at: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean
          message_type: string
          priority: string
          project_id: string
          read_at: string | null
          recipient_id: string | null
          sender_id: string
          subject: string
        }
        Insert: {
          archived_at?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          priority?: string
          project_id: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id: string
          subject: string
        }
        Update: {
          archived_at?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          priority?: string
          project_id?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          project_id: string
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          project_id: string
          related_id?: string | null
          related_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          project_id?: string
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          created_at: string | null
          id: string
          option_text: string
          poll_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_text: string
          poll_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_text?: string
          poll_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string | null
          created_by: string
          deadline: string | null
          description: string | null
          id: string
          is_anonymous: boolean | null
          project_id: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_anonymous?: boolean | null
          project_id: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_anonymous?: boolean | null
          project_id?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polls_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polls_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_profile_id: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_profile_id: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_profile_id?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_reports_reported_profile_id_fkey"
            columns: ["reported_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          full_name: string | null
          id: string
        }
        Insert: {
          full_name?: string | null
          id?: string
        }
        Update: {
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      project_health_logs: {
        Row: {
          active_users: number | null
          created_at: string
          health_score: number
          id: string
          metadata: Json | null
          project_id: string
          sentiment_score: number | null
          total_users: number | null
        }
        Insert: {
          active_users?: number | null
          created_at?: string
          health_score: number
          id?: string
          metadata?: Json | null
          project_id: string
          sentiment_score?: number | null
          total_users?: number | null
        }
        Update: {
          active_users?: number | null
          created_at?: string
          health_score?: number
          id?: string
          metadata?: Json | null
          project_id?: string
          sentiment_score?: number | null
          total_users?: number | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          health: number | null
          id: string
          last_updated: string | null
          name: string
          slug: string
          status: string
          theme: string | null
        }
        Insert: {
          health?: number | null
          id?: string
          last_updated?: string | null
          name: string
          slug: string
          status?: string
          theme?: string | null
        }
        Update: {
          health?: number | null
          id?: string
          last_updated?: string | null
          name?: string
          slug?: string
          status?: string
          theme?: string | null
        }
        Relationships: []
      }
      reputation_history: {
        Row: {
          change: number | null
          created_at: string
          id: string
          project_source: string | null
          reason: string | null
          score: number
          user_id: string | null
        }
        Insert: {
          change?: number | null
          created_at?: string
          id?: string
          project_source?: string | null
          reason?: string | null
          score: number
          user_id?: string | null
        }
        Update: {
          change?: number | null
          created_at?: string
          id?: string
          project_source?: string | null
          reason?: string | null
          score?: number
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          blocked: boolean | null
          created_at: string
          endpoint: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          project_id: string
          project_source: string | null
          reason: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          user_agent: string | null
        }
        Insert: {
          blocked?: boolean | null
          created_at?: string
          endpoint?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          project_id: string
          project_source?: string | null
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          user_agent?: string | null
        }
        Update: {
          blocked?: boolean | null
          created_at?: string
          endpoint?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          project_id?: string
          project_source?: string | null
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_security_events_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_security_events_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      stats: {
        Row: {
          active_now: number | null
          id: string
          page_views_24h: number | null
          popular_lab: string | null
          total_users: number | null
          updated_at: string | null
        }
        Insert: {
          active_now?: number | null
          id?: string
          page_views_24h?: number | null
          popular_lab?: string | null
          total_users?: number | null
          updated_at?: string | null
        }
        Update: {
          active_now?: number | null
          id?: string
          page_views_24h?: number | null
          popular_lab?: string | null
          total_users?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          department: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          job_title: string | null
          location: string | null
          manager_id: string | null
          phone: string | null
          project_id: string
          start_date: string | null
          updated_at: string | null
          user_id: string
          visible_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          location?: string | null
          manager_id?: string | null
          phone?: string | null
          project_id: string
          start_date?: string | null
          updated_at?: string | null
          user_id: string
          visible_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          location?: string | null
          manager_id?: string | null
          phone?: string | null
          project_id?: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
          visible_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_project_access: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_project_access_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_project_access_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_projects: {
        Row: {
          health: number | null
          id: string | null
          last_updated: string | null
          name: string | null
          role: string | null
          slug: string | null
          status: string | null
          theme: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_invitation_code: { Args: never; Returns: string }
      generate_owner_hash: {
        Args: { _project_id: string; _user_id: string }
        Returns: string
      }
      get_my_owner_hash: { Args: { _project_id: string }; Returns: string }
      get_project_id: { Args: { _slug: string }; Returns: string }
      get_project_id_by_slug: { Args: { slug_param: string }; Returns: string }
      get_user_project_ids: {
        Args: { user_id_param: string }
        Returns: {
          project_id: string
        }[]
      }
      has_role: {
        Args: {
          _project_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_anonymous_identity_owner: {
        Args: { _identity_id: string; _owner_hash: string }
        Returns: boolean
      }
      user_has_project_access: {
        Args: { project_id_param: string; user_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin" | "moderator"
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
      app_role: ["user", "admin", "moderator"],
    },
  },
} as const
