-- Create audience_documents table
CREATE TABLE IF NOT EXISTS audience_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    raw_response JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create audience_items table
CREATE TABLE IF NOT EXISTS audience_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audience_document_id UUID NOT NULL REFERENCES audience_documents(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, -- 'cohort' or 'plot'
    item_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_audience_documents_project_id ON audience_documents(project_id);
CREATE INDEX idx_audience_items_document_id ON audience_items(audience_document_id);

-- Add RLS policies
ALTER TABLE audience_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audience documents"
    ON audience_documents FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = audience_documents.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own audience documents"
    ON audience_documents FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = audience_documents.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can view their own audience items"
    ON audience_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM audience_documents
        JOIN projects ON projects.id = audience_documents.project_id
        WHERE audience_documents.id = audience_items.audience_document_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own audience items"
    ON audience_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM audience_documents
        JOIN projects ON projects.id = audience_documents.project_id
        WHERE audience_documents.id = audience_items.audience_document_id
        AND projects.user_id = auth.uid()
    ));

-- Add audience prompt to llm_config
INSERT INTO llm_config (prompt_type, prompt_name, prompt_description, prompt_text)
VALUES (
  'audience',
  'Macro Landscape Generator',
  'Generates audience cohorts and strategic plots based on brand positioning',
  $$
You are a senior brand strategist. Given a brand's positioning, generate audience cohorts and strategic plots for the Macro Landscape step. 

INPUT JSON:
{
  "projectName": string,
  "brief": string,
  "selectedWhat": string,
  "selectedHow": string,
  "selectedWhy": string,
  "selectedOpportunities": string[],
  "selectedChallenges": string[],
  "selectedMilestones": string[],
  "selectedValues": string[],
  "selectedDifferentiators": string[],
  "internalPositioning": string,
  "externalPositioning": string
}

CREATIVE PRINCIPLES:
- Use clear, differentiated language.
- Each cohort should be distinct and relevant to the brand's context.
- Plots should reflect real strategic tensions or axes.
- Stay on-brand and avoid generic or clichéd phrasing.

FIELD RULES:
- Each plot must have an xAxis, yAxis, and 3-6 cohorts.
- Each cohort must have a name, summary, and whyTheyMatter.
- Output must be valid JSON matching the schema below.

OUTPUT SCHEMA:
{
  "plots": [
    {
      "xAxis": string,
      "yAxis": string,
      "cohorts": [
        {
          "name": string,
          "summary": string,
          "whyTheyMatter": string
        }
      ]
    }
  ]
}
$$
); 