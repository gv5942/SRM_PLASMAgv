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

-- 1. Create the 'departments' table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policy to allow full access to authenticated users
DROP POLICY IF EXISTS "Allow all operations on departments" ON departments;

CREATE POLICY "Allow all operations on departments"
  ON departments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Create function to auto-update 'updated_at' on row updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger that uses the function
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Insert default departments
INSERT INTO departments (name, code, description, is_active)
VALUES
  ('Computer Science', 'CS', 'Computer Science and Engineering', true),
  ('Information Technology', 'IT', 'Information Technology', true),
  ('Electronics & Communication', 'EC', 'Electronics and Communication Engineering', true),
  ('Mechanical Engineering', 'ME', 'Mechanical Engineering', true),
  ('Civil Engineering', 'CE', 'Civil Engineering', true),
  ('Electrical Engineering', 'EE', 'Electrical Engineering', true),
  ('Chemical Engineering', 'CH', 'Chemical Engineering', true),
  ('Biotechnology', 'BT', 'Biotechnology', true)
ON CONFLICT (name) DO NOTHING;
