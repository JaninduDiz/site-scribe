// src/types/supabase.ts
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
      attendance: {
        Row: {
          date: string
          employee_id: string
          status: string
          allowance: number | null
        }
        Insert: {
          date: string
          employee_id: string
          status: string
          allowance?: number | null
        }
        Update: {
          date?: string
          employee_id?: string
          status?: string
          allowance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          id: string
          name: string
          phone: string | null
          age: number | null
          address: string | null
          created_at: string
          daily_allowance: number | null
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          age?: number | null
          address?: string | null
          created_at?: string
          daily_allowance?: number | null
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          age?: number | null
          address?: string | null
          created_at?: string
          daily_allowance?: number | null
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
