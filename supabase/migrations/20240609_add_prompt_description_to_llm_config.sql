-- Add prompt_description and module columns to llm_config
ALTER TABLE llm_config ADD COLUMN IF NOT EXISTS prompt_description TEXT;
ALTER TABLE llm_config ADD COLUMN IF NOT EXISTS module TEXT; 