-- This migration modifies the unique constraint on positioning_items to allow multiple milestones per slot
-- by removing the existing constraint and creating a new one that's more flexible

-- Check if the old index exists and drop it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'pos_unique_slot') THEN
    DROP INDEX pos_unique_slot;
  END IF;
END $$;

-- Check if the new index exists and drop it if it does
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'pos_unique_milestone_slot') THEN
    DROP INDEX pos_unique_milestone_slot;
  END IF;
END $$;

-- Create a new index that allows multiple milestones per slot
-- This index ensures each milestone ID is unique within a document and slot combination
CREATE UNIQUE INDEX pos_unique_milestone_slot
ON positioning_items(id, document_id, slot)
WHERE item_type = 'MILESTONE' AND state <> 'archived';

-- Reset all milestone slots to unassigned to clean up any potential conflicts
UPDATE positioning_items
SET slot = 'unassigned'
WHERE item_type = 'MILESTONE';