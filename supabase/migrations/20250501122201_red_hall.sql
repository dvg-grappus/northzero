/*
  # Remove positioning_item_events table

  This migration removes the positioning_item_events table which is no longer needed.
  The table was used for audit logging but is being removed to simplify the database schema.
*/

-- Drop the table if it exists
DROP TABLE IF EXISTS positioning_item_events;

-- Drop any policies associated with the table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'positioning_item_events' 
    AND policyname = 'positioning_events_ro'
  ) THEN
    DROP POLICY IF EXISTS positioning_events_ro ON positioning_item_events;
  END IF;
END $$;