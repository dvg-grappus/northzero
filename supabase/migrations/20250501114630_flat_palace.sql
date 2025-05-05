/*
  # Positioning Module Schema

  1. New Types
    - `pos_item_type` - Types of positioning items (WHAT, HOW, WHY, etc.)
    - `pos_state` - Item states (draft, selected, archived)
    - `pos_source` - Content sources (ai, user)
    - `roadmap_slot` - Timeline slots (now, 1yr, 3yr, etc.)
  
  2. New Tables
    - `positioning_documents` - Stores document versions and raw payloads
    - `positioning_items` - Stores individual positioning elements
    - `positioning_item_events` - Audit log for positioning actions
  
  3. Indexes
    - Unique index for latest document version
    - Index for efficient querying by project and item type
    - Partial unique index for milestone slots
  
  4. Security
    - RLS disabled for all tables as requested
    - Policies created but not active
*/

-- ─────────────────────────────
-- ENUMs - Check if they exist first
-- ─────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pos_item_type') THEN
    CREATE TYPE pos_item_type AS ENUM (
      'WHAT','HOW','WHY',
      'OPPORTUNITY','CHALLENGE',
      'MILESTONE','VALUE',
      'WHILE_OTHERS','WE_ARE_THE_ONLY'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pos_state') THEN
    CREATE TYPE pos_state AS ENUM ('draft','selected','archived');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pos_source') THEN
    CREATE TYPE pos_source AS ENUM ('ai','user');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'roadmap_slot') THEN
    CREATE TYPE roadmap_slot AS ENUM ('now','1yr','3yr','5yr','10yr','unassigned');
  END IF;
END $$;

-- ─────────────────────────────
-- DOCUMENT HEADER
-- one row per payload / version
-- ─────────────────────────────
CREATE TABLE IF NOT EXISTS positioning_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version       integer NOT NULL DEFAULT 1,
  brief         text NOT NULL,
  raw_payload   jsonb NOT NULL,
  created_by    uuid REFERENCES auth.users(id),
  created_at    timestamptz DEFAULT now()
);

-- convenience view / index for "latest"
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'positioning_latest_doc') THEN
    CREATE UNIQUE INDEX positioning_latest_doc
    ON positioning_documents(project_id, version DESC);
  END IF;
END $$;

-- ─────────────────────────────
-- ATOMIC ITEMS
-- ─────────────────────────────
CREATE TABLE IF NOT EXISTS positioning_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES positioning_documents(id) ON DELETE CASCADE,
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  item_type   pos_item_type NOT NULL,
  content     text NOT NULL,          -- sentence or VALUE title
  extra_json  jsonb,                  -- { "blurb":"" } etc.
  slot        roadmap_slot DEFAULT 'unassigned', -- milestones only
  idx         smallint NOT NULL,      -- display order
  state       pos_state DEFAULT 'draft',
  source      pos_source DEFAULT 'ai',

  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Create index if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'pos_items_project_type_idx') THEN
    CREATE INDEX pos_items_project_type_idx
    ON positioning_items(project_id, item_type);
  END IF;
END $$;

-- partial UNIQUE → only one milestone may live in a given slot & version
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'pos_unique_slot') THEN
    CREATE UNIQUE INDEX pos_unique_slot
    ON positioning_items(document_id, slot)
    WHERE item_type = 'MILESTONE' AND state <> 'archived';
  END IF;
END $$;

-- ─────────────────────────────
-- EVENT / AUDIT LOG
-- ─────────────────────────────
CREATE TABLE IF NOT EXISTS positioning_item_events (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id    uuid REFERENCES positioning_items(id) ON DELETE CASCADE,
  actor_id   uuid REFERENCES auth.users(id),
  action     text,         -- e.g. 'select', 'edit', 'move-slot'
  details    jsonb,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────
-- DISABLE ROW-LEVEL SECURITY
-- ─────────────────────────────
-- Explicitly disable RLS for all tables as requested
ALTER TABLE positioning_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE positioning_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE positioning_item_events DISABLE ROW LEVEL SECURITY;

-- Create policies anyway (they won't be active until RLS is enabled)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'positioning_rw') THEN
    CREATE POLICY positioning_rw
    ON positioning_documents
    FOR ALL
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'positioning_items_rw') THEN
    CREATE POLICY positioning_items_rw
    ON positioning_items
    FOR ALL
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'positioning_events_ro') THEN
    CREATE POLICY positioning_events_ro
    ON positioning_item_events
    FOR SELECT
    USING (item_id IN (
      SELECT id FROM positioning_items
      WHERE project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    ));
  END IF;
END $$;