/*
  # Create departments table for database management

  1. New Tables
    - `departments`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `code` (text, unique)
      - `description` (text, optional)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `departments` table
    - Add policy for authenticated users to manage departments

  3. Default Data
    - Insert default departments for immediate use
*/

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Create policy for departments
CREATE POLICY "Allow all operations on departments"
  ON departments
  FOR ALL
  TO authenticated
  USING (true);

-- Insert default departments
INSERT INTO departments (name, code, description, is_active) VALUES
  ('Computer Science', 'CS', 'Computer Science and Engineering', true),
  ('Information Technology', 'IT', 'Information Technology', true),
  ('Electronics & Communication', 'EC', 'Electronics and Communication Engineering', true),
  ('Mechanical Engineering', 'ME', 'Mechanical Engineering', true),
  ('Civil Engineering', 'CE', 'Civil Engineering', true),
  ('Electrical Engineering', 'EE', 'Electrical Engineering', true),
  ('Chemical Engineering', 'CH', 'Chemical Engineering', true),
  ('Biotechnology', 'BT', 'Biotechnology', true)
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();