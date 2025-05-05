export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string
          thumbnail: string | null
          created_at: string
          updated_at: string
          progress: number
          status: string
          collaborators: Json | null
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          thumbnail?: string | null
          created_at?: string
          updated_at?: string
          progress?: number
          status?: string
          collaborators?: Json | null
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          thumbnail?: string | null
          created_at?: string
          updated_at?: string
          progress?: number
          status?: string
          collaborators?: Json | null
          user_id?: string | null
        }
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
  }
}