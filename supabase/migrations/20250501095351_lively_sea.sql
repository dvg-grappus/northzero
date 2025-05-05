/*
  # Create projects table

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, not null)
      - `thumbnail` (text, nullable)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      - `progress` (integer, default 0)
      - `status` (text, default 'draft')
      - `collaborators` (jsonb, nullable)
      - `user_id` (uuid, nullable, references auth.users)
  2. Security
    - Enable RLS on `projects` table
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to insert their own data
    - Add policy for authenticated users to update their own data
    - Add policy for authenticated users to delete their own data
*/

-- Create projects table
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

-- Create policies
CREATE POLICY "Users can read their own projects"
  ON projects
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);