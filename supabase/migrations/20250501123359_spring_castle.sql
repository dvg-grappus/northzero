-- This migration modifies the unique constraint on positioning_items to allow multiple milestones per slot
-- by removing the existing constraint and creating a new one that's more flexible

-- First, drop the existing unique index if it exists
DROP INDEX IF EXISTS pos_unique_slot;

-- Create a new index that allows multiple milestones per slot but still enforces uniqueness per milestone
CREATE UNIQUE INDEX pos_unique_milestone_slot
ON positioning_items(id, document_id, slot)
WHERE item_type = 'MILESTONE' AND state <> 'archived';

-- Reset all milestone slots to unassigned to clean up any potential conflicts
UPDATE positioning_items
SET slot = 'unassigned'
WHERE item_type = 'MILESTONE';