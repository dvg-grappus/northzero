/*
  # Positioning Module Schema

  1. New Tables
    - `positioning_documents` - Document header table for versioning
    - `positioning_items` - Items table for all positioning content
    - `positioning_item_events` - Event log for audit trail
  
  2. New Types
    - `pos_item_type` - Enum for different item types
    - `pos_state` - Enum for item states
    - `pos_source` - Enum for content source
    - `roadmap_slot` - Enum for roadmap timeline slots
  
  3. Security
    - Row Level Security enabled on all tables
    - Policies to ensure users can only access their own data
*/

-- ─────────────────────────────
-- ENUMs
-- ─────────────────────────────
CREATE TYPE pos_item_type AS ENUM (
  'WHAT','HOW','WHY',
  'OPPORTUNITY','CHALLENGE',
  'MILESTONE','VALUE',
  'WHILE_OTHERS','WE_ARE_THE_ONLY'
);

CREATE TYPE pos_state AS ENUM ('draft','selected','archived');
CREATE TYPE pos_source AS ENUM ('ai','user');
CREATE TYPE roadmap_slot AS ENUM ('now','1yr','3yr','5yr','10yr','unassigned');

-- ─────────────────────────────
-- DOCUMENT HEADER
-- one row per payload / version
-- ─────────────────────────────
CREATE TABLE positioning_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version       integer NOT NULL DEFAULT 1,
  brief         text NOT NULL,
  raw_payload   jsonb NOT NULL,
  created_by    uuid REFERENCES auth.users(id),
  created_at    timestamptz DEFAULT now()
);

-- convenience view / index for "latest"
CREATE UNIQUE INDEX positioning_latest_doc
ON positioning_documents(project_id, version DESC);

-- ─────────────────────────────
-- ATOMIC ITEMS
-- ─────────────────────────────
CREATE TABLE positioning_items (
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

CREATE INDEX pos_items_project_type_idx
  ON positioning_items(project_id, item_type);

-- partial UNIQUE → only one milestone may live in a given slot & version
CREATE UNIQUE INDEX pos_unique_slot
  ON positioning_items(document_id, slot)
  WHERE item_type = 'MILESTONE' AND state <> 'archived';

-- ─────────────────────────────
-- EVENT / AUDIT LOG
-- ─────────────────────────────
CREATE TABLE positioning_item_events (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id    uuid REFERENCES positioning_items(id) ON DELETE CASCADE,
  actor_id   uuid REFERENCES auth.users(id),
  action     text,         -- e.g. 'select', 'edit', 'move-slot'
  details    jsonb,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────
-- ROW-LEVEL SECURITY
-- ─────────────────────────────
ALTER TABLE positioning_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE positioning_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE positioning_item_events ENABLE ROW LEVEL SECURITY;

-- same policy reused on all three
CREATE POLICY positioning_rw
ON positioning_documents
FOR ALL
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY positioning_items_rw
ON positioning_items
FOR ALL
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY positioning_events_ro
ON positioning_item_events
FOR SELECT
USING (item_id IN (
  SELECT id FROM positioning_items
  WHERE project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
));