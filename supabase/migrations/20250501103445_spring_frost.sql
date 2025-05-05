/*
  # Create projects table

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, not null)
      - `thumbnail` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
      - `progress` (integer, default 0)
      - `status` (text, default 'draft')
      - `collaborators` (jsonb)
      - `user_id` (uuid, references auth.users)
  2. Security
    - Enable RLS on `projects` table
    - Add policies for users to manage their own projects
*/

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  thumbnail text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  progress integer DEFAULT 0,
  status text DEFAULT 'draft',
  collaborators jsonb,
  user_id uuid REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
  -- Check if the SELECT policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can read their own projects'
  ) THEN
    CREATE POLICY "Users can read their own projects"
      ON projects
      FOR SELECT
      USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;

  -- Check if the INSERT policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can insert their own projects'
  ) THEN
    CREATE POLICY "Users can insert their own projects"
      ON projects
      FOR INSERT
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;

  -- Check if the UPDATE policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can update their own projects'
  ) THEN
    CREATE POLICY "Users can update their own projects"
      ON projects
      FOR UPDATE
      USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;

  -- Check if the DELETE policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can delete their own projects'
  ) THEN
    CREATE POLICY "Users can delete their own projects"
      ON projects
      FOR DELETE
      USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;