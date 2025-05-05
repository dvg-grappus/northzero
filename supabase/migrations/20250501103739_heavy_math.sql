/*
  # Seed projects table with initial data

  1. New Data
    - Adds 6 sample projects to the projects table
    - Each project has a name, description, thumbnail, status, progress, and collaborators
  
  2. Purpose
    - Provides initial data for the brand hub
    - Demonstrates different project statuses and progress levels
    - Shows collaborator data structure
*/

-- Only insert if the table is empty
DO $$
DECLARE
  project_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO project_count FROM projects;
  
  IF project_count = 0 THEN
    INSERT INTO projects (name, description, thumbnail, created_at, updated_at, progress, status, collaborators)
    VALUES
      (
        'Refresh Beverage Co.',
        'Brand identity for organic juice line targeting urban professionals.',
        'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(249, 115, 22, 0.9) 100%)',
        '2025-01-15T00:00:00Z',
        '2025-04-01T00:00:00Z',
        85,
        'active',
        '[{"id": "1", "name": "Alex Morgan", "initials": "AM"}, {"id": "2", "name": "Taylor Swift", "initials": "TS"}]'
      ),
      (
        'NexTech Solutions',
        'Complete rebrand for a growing SaaS company focusing on AI tools.',
        'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(79, 70, 229, 0.9) 100%)',
        '2025-02-10T00:00:00Z',
        '2025-03-25T00:00:00Z',
        60,
        'active',
        '[{"id": "2", "name": "Taylor Swift", "initials": "TS"}, {"id": "3", "name": "Jordan Lee", "initials": "JL"}, {"id": "4", "name": "Casey Johnson", "initials": "CJ"}]'
      ),
      (
        'EcoSustain Products',
        'Sustainable packaging brand identity for eco-conscious consumers.',
        'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(34, 197, 94, 0.9) 100%)',
        '2025-03-05T00:00:00Z',
        '2025-04-10T00:00:00Z',
        40,
        'active',
        '[{"id": "1", "name": "Alex Morgan", "initials": "AM"}, {"id": "5", "name": "Morgan Freeman", "initials": "MF"}]'
      ),
      (
        'Metropolitan Gallery',
        'Brand refresh for a contemporary art space expanding to digital experiences.',
        'linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(236, 72, 153, 0.9) 100%)',
        '2025-02-28T00:00:00Z',
        '2025-03-15T00:00:00Z',
        100,
        'completed',
        '[{"id": "1", "name": "Alex Morgan", "initials": "AM"}, {"id": "4", "name": "Casey Johnson", "initials": "CJ"}, {"id": "5", "name": "Morgan Freeman", "initials": "MF"}]'
      ),
      (
        'Astral Coffee Shop',
        'Branding for a new coffee chain with an astronomy theme.',
        'linear-gradient(135deg, rgba(6, 182, 212, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)',
        '2025-04-01T00:00:00Z',
        '2025-04-15T00:00:00Z',
        25,
        'paused',
        '[{"id": "3", "name": "Jordan Lee", "initials": "JL"}]'
      ),
      (
        'Solace Wellness',
        'Brand system for a holistic health and meditation studio.',
        'linear-gradient(135deg, rgba(225, 29, 72, 0.9) 0%, rgba(236, 72, 153, 0.9) 100%)',
        '2025-03-20T00:00:00Z',
        '2025-04-10T00:00:00Z',
        15,
        'draft',
        '[{"id": "1", "name": "Alex Morgan", "initials": "AM"}, {"id": "2", "name": "Taylor Swift", "initials": "TS"}, {"id": "5", "name": "Morgan Freeman", "initials": "MF"}]'
      );
  END IF;
END $$;