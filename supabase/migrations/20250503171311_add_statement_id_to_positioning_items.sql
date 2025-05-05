ALTER TABLE positioning_items ADD COLUMN statement_id uuid REFERENCES positioning_statements(id);
