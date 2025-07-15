import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface DatabaseDepartment {
  id: string
  name: string
  code: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DatabaseStudent {
  id: string
  roll_number: string
  student_name: string
  email: string
  personal_email?: string
  mobile_number: string
  department: string
  section: string
  gender?: string
  date_of_birth?: string
  number_of_backlogs?: number
  resume_link?: string
  photo_url?: string
  mentor_id: string
  tenth_percentage: number
  twelfth_percentage: number
  ug_percentage: number
  cgpa?: number
  status: 'placed' | 'eligible' | 'higher_studies' | 'ineligible'
  created_at: string
  updated_at: string
}

export interface DatabasePlacementRecord {
  id: string
  student_id: string
  company: string
  package: number
  placement_date: string
  created_at: string
  updated_at: string
}

export interface DatabaseMentor {
  id: string
  username: string
  name: string
  email?: string
  phone?: string
  department?: string
  is_active: boolean
  created_at: string
  updated_at: string
}