import { supabase } from '@/lib/supabase';
import { openAIService } from './openai';
import { llmConfigService } from './llmConfig';
import { getModelConfig, callOpenAI, extractReasoningJson } from './openaiService';
import type { Cohort as UIMacroLandscapeCohort } from '@/components/audience/MacroLandscape';

interface AudienceInput {
  projectName: string;
  brief: string;
  selectedWhat: string[];
  selectedHow: string[];
  selectedWhy: string[];
  selectedOpportunities: string[];
  selectedChallenges: string[];
  selectedMilestones: string[];
  selectedValues: { title: string; blurb: string }[];
  selectedDifferentiators: {
    whileOthers: string[];
    weAreTheOnly: string[];
  };
  internalPositioning: {
    what: string;
    how: string;
    who: string;
    where: string;
    why: string;
    when: string;
  };
  externalPositioning: {
    proposition: string;
    benefit: string;
    outcome: string;
  };
}

interface AudienceCohort {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
}

interface AudiencePlotPlacement {
  cohortId: string;
  x: number;
  y: number;
}

interface AudiencePlot {
  label: 'Plot α' | 'Plot β' | 'Plot γ';
  x1: string;
  x2: string;
  y1: string;
  y2: string;
  placements: AudiencePlotPlacement[];
  selected_cohort_ids?: string[];
}

// Add this interface for clarity in the service
export interface WinningCohortSelection {
  primary: string | null;
  secondary: string | null;
  tertiary: string | null;
}

interface AudienceResponse {
  cohorts: AudienceCohort[];
  plots: AudiencePlot[];
}

interface AIGeneratedCohort {
  id: string;        // kebab-case, ≤24 chars
  title: string;     // 2–4 plain-English words
  description: string; // 5–8 words, literal
  whyItMatters: string; // 8–12 words, brand-specific benefit
}

export async function generateAudienceData(projectId: string): Promise<void> {
  try {
    console.log('[DEBUG] generateAudienceData called for projectId:', projectId);
    
    // 1. Get positioning data from positioning_items that are in 'selected' state
    const { data: positioningItems, error: positioningError } = await supabase
      .from('positioning_items')
      .select('*')
      .eq('project_id', projectId)
      .eq('state', 'selected');

    if (positioningError) throw positioningError;
    if (!positioningItems || positioningItems.length === 0) {
      console.error('[DEBUG] No selected positioning items found for project:', projectId);
      throw new Error('No selected positioning items found. Please complete the Positioning module first.');
    }

    console.log(`[DEBUG] Found ${positioningItems.length} selected positioning items`);
    
    // 2. Construct input for OpenAI - mapping item_type to the expected input structure
    // First, retrieve project name and brief from any source possible
    let projectName = '';
    let brief = '';
    
    // Look for project name in the content field of items that might contain it
    const projectNameItem = positioningItems.find(item => 
      item.item_type === 'STATEMENT_WHAT' || 
      item.item_type === 'WHAT'
    );
    if (projectNameItem && projectNameItem.content) {
      projectName = projectNameItem.content;
    }
    
    // Look for brief in the content field of items that might contain it
    const briefItem = positioningItems.find(item => 
      item.item_type === 'STATEMENT_WHY' || 
      item.item_type === 'WHY'
    );
    if (briefItem && briefItem.content) {
      brief = briefItem.content;
    }

    // Map the item types to their respective categories in the input JSON
    const input: AudienceInput = {
      projectName,
      brief,
      selectedWhat: positioningItems
        .filter(item => item.item_type === 'WHAT')
        .map(item => item.content || ''),
      selectedHow: positioningItems
        .filter(item => item.item_type === 'HOW')
        .map(item => item.content || ''),
      selectedWhy: positioningItems
        .filter(item => item.item_type === 'WHY')
        .map(item => item.content || ''),
      selectedOpportunities: positioningItems
        .filter(item => item.item_type === 'OPPORTUNITY')
        .map(item => item.content || ''),
      selectedChallenges: positioningItems
        .filter(item => item.item_type === 'CHALLENGE')
        .map(item => item.content || ''),
      selectedMilestones: positioningItems
        .filter(item => item.item_type === 'MILESTONE')
        .map(item => item.content || ''),
      selectedValues: positioningItems
        .filter(item => item.item_type === 'VALUE')
        .map(item => {
          // Parse extra_json if it exists, otherwise use empty values
          let blurb = '';
          if (item.extra_json) {
            try {
              const parsed = JSON.parse(item.extra_json);
              blurb = parsed.blurb || '';
            } catch (e) {
              console.error('[DEBUG] Error parsing extra_json for VALUE item:', e);
            }
          }
          return {
            title: item.content || '',
            blurb
          };
        }),
      selectedDifferentiators: {
        whileOthers: positioningItems
          .filter(item => item.item_type === 'WHILE_OTHERS')
          .map(item => item.content || ''),
        weAreTheOnly: positioningItems
          .filter(item => item.item_type === 'WE_ARE_THE_ONLY')
          .map(item => item.content || '')
      },
      internalPositioning: {
        what: positioningItems.find(item => item.item_type === 'STATEMENT_WHAT')?.content || '',
        how: positioningItems.find(item => item.item_type === 'STATEMENT_HOW')?.content || '',
        who: positioningItems.find(item => item.item_type === 'STATEMENT_WHO')?.content || '',
        where: positioningItems.find(item => item.item_type === 'STATEMENT_WHERE')?.content || '',
        why: positioningItems.find(item => item.item_type === 'STATEMENT_WHY')?.content || '',
        when: positioningItems.find(item => item.item_type === 'STATEMENT_WHEN')?.content || ''
      },
      externalPositioning: {
        proposition: positioningItems.find(item => item.item_type === 'STATEMENT_PROPOSITION')?.content || '',
        benefit: positioningItems.find(item => item.item_type === 'STATEMENT_BENEFIT')?.content || '',
        outcome: positioningItems.find(item => item.item_type === 'STATEMENT_OUTCOME')?.content || ''
      }
    };

    // Validate that we have at least some data to work with
    if (!input.projectName && !input.brief && 
        input.selectedWhat.length === 0 && 
        input.selectedHow.length === 0 && 
        input.selectedWhy.length === 0 &&
        input.internalPositioning.what === '' &&
        input.internalPositioning.how === '' &&
        input.internalPositioning.why === '') {
      console.error('[DEBUG] Not enough positioning data to generate meaningful audience segments');
      throw new Error('Not enough positioning data. Please add more content in the Positioning module.');
    }

    console.log('[DEBUG] Constructed input for OpenAI:', JSON.stringify(input));

    // 3. Get the audience prompt from llm_config
    console.log('[DEBUG] Fetching prompt for AUDIENCE_LANDSCAPE_PROMPT');
    const promptTemplate = await llmConfigService.getPromptByName('AUDIENCE_LANDSCAPE_PROMPT', 'audience');
    if (!promptTemplate) {
      console.error('[DEBUG] Prompt not found in DB: AUDIENCE_LANDSCAPE_PROMPT');
      throw new Error('Prompt not found in DB: AUDIENCE_LANDSCAPE_PROMPT');
    }
    console.log('[DEBUG] Prompt fetched successfully');

    // 4. Call OpenAI
    const { model, model_type } = await getModelConfig();
    const userPrompt = promptTemplate.replace('<<<INPUT_JSON_GOES_HERE>>>', JSON.stringify(input));
    console.log('[DEBUG] Calling OpenAI with model:', model, 'model_type:', model_type);
    const content = await callOpenAI({
      model,
      model_type,
      systemPrompt: 'You are a senior brand strategist famed for identifying and analyzing audience segments.',
      userPrompt,
      temperature: 0.7,
      max_tokens: 2048
    });
    console.log('[DEBUG] OpenAI response received');

    // 5. Parse the response
    let parsedResponse: AudienceResponse;
    try {
      if (model_type === 'reasoning' && typeof content === 'object') {
        const extracted = extractReasoningJson(content);
        if (extracted) {
          parsedResponse = extracted;
        } else {
          throw new Error('Failed to extract reasoning output');
        }
      } else if (typeof content === 'string') {
        parsedResponse = JSON.parse(content);
      } else if (typeof content === 'object') {
        parsedResponse = content;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (e) {
      if (typeof content === 'string') {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          parsedResponse = JSON.parse(match[0]);
        } else {
          throw new Error('Failed to parse JSON from OpenAI response');
        }
      } else {
        throw new Error('Failed to parse response');
      }
    }

    // 6. Check if a document already exists for this project
    const { data: existingDocument, error: docError } = await supabase
      .from('audience_documents')
      .select('id, version')
      .eq('project_id', projectId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    let version = 1;
    let documentId: string;

    if (existingDocument) {
      // Update existing document
      version = (existingDocument.version || 0) + 1;
      documentId = existingDocument.id;
      
      const { error: updateError } = await supabase
        .from('audience_documents')
        .update({
          raw_payload: content,
          version: version,
          brief: brief
        })
        .eq('id', documentId);
        
      if (updateError) throw updateError;
      console.log(`[DEBUG] Updated audience document ${documentId} with version ${version}`);
    } else {
      // Create new document
      const { data: documentData, error: insertError } = await supabase
        .from('audience_documents')
        .insert({
          project_id: projectId,
          raw_payload: content,
          version: version,
          brief: brief
        })
        .select();

      if (insertError) throw insertError;
      if (!documentData || documentData.length === 0) {
        throw new Error('Failed to create audience document.');
      }
      
      documentId = documentData[0].id;
      console.log(`[DEBUG] Created new audience document ${documentId} with version ${version}`);
    }

    // 7. Delete any existing items for this document and create new ones
    console.log('[DEBUG] Clearing existing audience items for document:', documentId);
    await supabase
      .from('audience_items')
      .delete()
      .eq('document_id', documentId);

    // 8. Store the parsed items in audience_items with proper state management
    let idx = 0;
    
    // Cohort items - Selected state for the first 8, draft for the rest
    const cohortItems = parsedResponse.cohorts.map((cohort, index) => {
      const state = index < 8 ? 'selected' : 'draft';
      return {
        document_id: documentId,
        project_id: projectId,
        item_type: 'cohort',
        content: cohort.title,
        extra_json: {
          description: cohort.description,
          whyItMatters: cohort.whyItMatters,
          id: cohort.id
        },
        item_data: cohort,
        state: state,
        source: 'openai',
        idx: idx++
      };
    });

    // Plot items - All draft by default
    const plotItems = parsedResponse.plots.map((plot, index) => {
      return {
        document_id: documentId,
        project_id: projectId,
        item_type: 'plot',
        content: `Plot ${index + 1}`,
        extra_json: {
          label: plot.label,
          x1: plot.x1,
          x2: plot.x2,
          y1: plot.y1,
          y2: plot.y2,
          placements: plot.placements
        },
        item_data: plot,
        state: 'draft',
        source: 'openai',
        idx: idx++
      };
    });

    const items = [...cohortItems, ...plotItems];
    console.log(`[DEBUG] Inserting ${items.length} audience items`);

    // Insert in batches if needed (to avoid size limits)
    const batchSize = 50;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const { error: itemsError } = await supabase
        .from('audience_items')
        .insert(batch);

      if (itemsError) {
        console.error('[DEBUG] Error inserting audience items batch:', itemsError);
        throw itemsError;
      }
    }

    console.log('[DEBUG] Successfully generated and saved audience data');

  } catch (error) {
    console.error('Error generating audience data:', error);
    throw error;
  }
}

export async function getAudienceData(projectId: string) {
  try {
    console.log('[DEBUG] getAudienceData called for projectId:', projectId);
    
    // 1. Check if audience items exist for this project
    const { data: items, error: itemsError } = await supabase
      .from('audience_items')
      .select('*')
      .eq('project_id', projectId)
      .in('item_type', ['cohort', 'plot'])
      .in('state', ['selected', 'draft']);

    // If no items found or error, generate new data
    if (itemsError || !items || items.length === 0) {
      console.log('[DEBUG] No audience items found for project:', projectId);
      console.log('[DEBUG] Generating new audience data...');
      
      // Generate new data
      await generateAudienceData(projectId);
      
      // Fetch the newly generated items
      const { data: newItems, error: newItemsError } = await supabase
        .from('audience_items')
        .select('*')
        .eq('project_id', projectId)
        .in('item_type', ['cohort', 'plot'])
        .in('state', ['selected', 'draft']);
        
      if (newItemsError || !newItems || newItems.length === 0) {
        console.error('[DEBUG] Failed to generate audience data:', newItemsError);
        return { cohorts: [], plots: [] };
      }
      
      // Process the newly generated items
      return processAudienceItems(newItems);
    }
    
    // Process existing items
    return processAudienceItems(items);
    
  } catch (error) {
    console.error('Error fetching audience data:', error);
    throw error;
  }
}

// Helper function to process audience items into the expected format
function processAudienceItems(items: any[]) {
  // Extract cohorts from items - include ALL cohorts
  const cohorts = items
    .filter(item => item.item_type === 'cohort')
    .map(item => {
      const extraData = item.extra_json || {};
      return {
        id: extraData.id || item.id,
        title: item.content || '',
        description: extraData.description || '',
        whyItMatters: extraData.whyItMatters || '',
        state: item.state // Keep the original state (selected/draft)
      };
    });

  console.log(`[DEBUG] Processing ${cohorts.length} total cohorts from database`);

  // Get ALL plots, regardless of state
  const allPlots = items
    .filter(item => item.item_type === 'plot')
    .map(item => {
      const extraData = item.extra_json || {};
      return {
        label: extraData.label || item.content,
        x1: extraData.x1 || '',
        x2: extraData.x2 || '',
        y1: extraData.y1 || '',
        y2: extraData.y2 || '',
        placements: extraData.placements || [],
        selected_cohort_ids: extraData.selected_cohort_ids || []
      };
    });
    
  console.log(`[DEBUG] Processing ${allPlots.length} plots from database:`, allPlots);

  // Return all cohorts and plots
  return {
    cohorts,
    plots: allPlots
  };
}

// Function to get the selected winning cohorts for a project
export async function getWinningCohorts(projectId: string): Promise<WinningCohortSelection | null> {
  try {
    const { data, error } = await supabase
      .from('audience_items')
      .select('extra_json')
      .eq('project_id', projectId)
      .eq('item_type', 'winning_cohorts')
      .maybeSingle(); // We expect at most one such item per project

    if (error) {
      console.error('[ERROR] Failed to fetch winning cohorts:', error);
      throw error;
    }

    if (data && data.extra_json) {
      // Validate the structure, providing defaults if fields are missing
      const selection = data.extra_json as any;
      return {
        primary: selection.primary || null,
        secondary: selection.secondary || null,
        tertiary: selection.tertiary || null,
      };
    }
    return null; // No selection found or data is malformed
  } catch (err) {
    console.error('[ERROR] Exception in getWinningCohorts:', err);
    return null;
  }
}

// Function to save the selected winning cohorts for a project
export async function saveWinningCohorts(projectId: string, selection: WinningCohortSelection): Promise<void> {
  try {
    console.log(`[audienceService] saveWinningCohorts called for projectId: ${projectId}`, selection);

    // 1. Get the latest audience_document_id for the project
    const { data: latestDocument, error: docError } = await supabase
      .from('audience_documents')
      .select('id')
      .eq('project_id', projectId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (docError) {
      console.error('[ERROR] Failed to fetch latest audience document:', docError);
      throw new Error('Could not find project document to associate winning cohorts.');
    }
    if (!latestDocument) {
      console.error('[ERROR] No audience document found for project_id:', projectId);
      throw new Error('Project audience data has not been initialized. Cannot save winning cohorts.');
    }
    const documentId = latestDocument.id;
    console.log(`[audienceService] Using document_id: ${documentId} for winning cohorts.`);

    // 2. Check if a 'winning_cohorts' item already exists for this project AND document
    const { data: existingItem, error: fetchError } = await supabase
      .from('audience_items')
      .select('id')
      .eq('project_id', projectId) // Keep this for specificity, though document_id should be enough
      .eq('document_id', documentId) // Ensure it's tied to the correct document version context
      .eq('item_type', 'winning_cohorts')
      .maybeSingle();

    if (fetchError) {
      console.error('[ERROR] Failed to check for existing winning cohorts item:', fetchError);
      throw fetchError;
    }

    const itemPayload = {
      project_id: projectId,
      document_id: documentId, 
      item_type: 'winning_cohorts',
      content: 'Selected Winning Cohorts', 
      extra_json: selection,
      item_data: selection,
      state: 'selected', 
      source: 'user',
      idx: 0,
    };
    console.log('[audienceService] Winning cohorts payload:', itemPayload);

    if (existingItem) {
      console.log(`[audienceService] Updating existing winning_cohorts item ID: ${existingItem.id}`);
      const { error: updateError } = await supabase
        .from('audience_items')
        .update({ 
          extra_json: selection, 
          item_data: selection,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id);

      if (updateError) {
        console.error('[ERROR] Failed to update winning cohorts:', updateError);
        throw updateError;
      }
      console.log('[DEBUG] Successfully updated winning cohorts for project:', projectId);
    } else {
      console.log('[audienceService] Inserting new winning_cohorts item.');
      const { error: insertError } = await supabase
        .from('audience_items')
        .insert(itemPayload);

      if (insertError) {
        console.error('[ERROR] Failed to insert winning cohorts:', insertError);
        throw insertError;
      }
      console.log('[DEBUG] Successfully saved new winning cohorts for project:', projectId);
    }
  } catch (err) {
    console.error('[ERROR] Exception in saveWinningCohorts:', err);
    // Ensure the error is re-thrown so UI can catch it for user feedback
    throw err; 
  }
}

// Interface for the data expected when adding a custom cohort
export interface CustomCohortData {
  title: string;
  description?: string;
  whyItMatters?: string;
  id?: string; // ID can be pre-generated for AI suggestions
}

// Function to add a custom/generated audience cohort to the database
export async function addAudienceCohortItem(
  projectId: string, 
  cohortData: CustomCohortData,
  source: 'user' | 'ai' | 'ai_suggested' = 'user' // Default to user, allow overriding for AI
): Promise<string | null> {
  try {
    console.log(`[audienceService] addAudienceCohortItem called for projectId: ${projectId}`, cohortData, `Source: ${source}`);

    // 1. Get the latest audience_document_id for the project
    const { data: latestDocument, error: docError } = await supabase
      .from('audience_documents')
      .select('id')
      .eq('project_id', projectId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (docError) {
      console.error('[ERROR] Failed to fetch latest audience document for cohort item:', docError);
      throw new Error('Could not find project document to associate cohort item.');
    }
    if (!latestDocument) {
      console.error('[ERROR] No audience document found for project_id:', projectId);
      throw new Error('Project audience data has not been initialized. Cannot add cohort item.');
    }
    const documentId = latestDocument.id;

    // 2. Prepare the new cohort item payload
    const cohortId = cohortData.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    const newItemPayload = {
      project_id: projectId,
      document_id: documentId,
      item_type: 'cohort',
      content: cohortData.title, 
      extra_json: {
        id: cohortId, 
        title: cohortData.title,
        description: cohortData.description || '', 
        whyItMatters: cohortData.whyItMatters || '', 
      },
      item_data: { 
        id: cohortId,
        title: cohortData.title,
        description: cohortData.description || '',
        whyItMatters: cohortData.whyItMatters || '',
      },
      state: 'draft', 
      source: source, // Use the provided source
      idx: 0 
    };

    const { data: existingCohorts, error: countError } = await supabase
      .from('audience_items')
      .select('idx')
      .eq('document_id', documentId)
      .eq('item_type', 'cohort')
      .order('idx', { ascending: false })
      .limit(1);

    if (countError) {
      console.warn('[WARN] Could not fetch existing cohorts to determine next idx:', countError);
      newItemPayload.idx = Math.floor(Date.now() / 1000); 
    } else {
      newItemPayload.idx = (existingCohorts && existingCohorts.length > 0 && existingCohorts[0].idx != null) ? existingCohorts[0].idx + 1 : 0;
    }
    
    console.log('[audienceService] New cohort item payload:', newItemPayload);

    const { data: insertedData, error: insertError } = await supabase
      .from('audience_items')
      .insert(newItemPayload)
      .select('id') 
      .single();

    if (insertError) {
      console.error('[ERROR] Failed to insert cohort item:', insertError);
      throw insertError;
    }
    
    console.log('[DEBUG] Successfully saved new cohort item. DB response:', insertedData);
    return cohortId;

  } catch (err) {
    console.error('[ERROR] Exception in addAudienceCohortItem:', err);
    throw err; 
  }
}

// Function to PERMANENTLY DELETE an audience cohort
export async function deleteAudienceCohort(projectId: string, cohortIdToDelete: string): Promise<void> {
  try {
    console.log(`[audienceService] deleteAudienceCohort called for projectId: ${projectId}, cohortIdToDelete: ${cohortIdToDelete}`);

    // 1. Find the audience_item corresponding to the cohortIdToDelete.
    const { data: items, error: findError } = await supabase
      .from('audience_items')
      .select('id, extra_json') // Select id to perform the delete
      .eq('project_id', projectId)
      .eq('item_type', 'cohort');

    if (findError) {
      console.error('[ERROR] Failed to fetch cohorts for deletion:', findError);
      throw findError;
    }

    if (!items || items.length === 0) {
      console.warn('[WARN] No cohort items found for project, cannot delete.');
      return; 
    }

    const itemToDelete = items.find(item => {
      try {
        const extra = typeof item.extra_json === 'string' ? JSON.parse(item.extra_json) : item.extra_json;
        return extra && extra.id === cohortIdToDelete;
      } catch (e) {
        console.error('[ERROR] Failed to parse extra_json for cohort item during delete search:', item.id, e);
        return false;
      }
    });

    if (!itemToDelete) {
      console.error(`[ERROR] Cohort with ID ${cohortIdToDelete} not found in project ${projectId} for deletion.`);
      throw new Error(`Cohort with ID ${cohortIdToDelete} not found.`);
    }

    // 2. Delete the found item from the database
    console.log(`[audienceService] Deleting cohort item ID: ${itemToDelete.id} (user-facing ID: ${cohortIdToDelete})`);
    const { error: deleteError } = await supabase
      .from('audience_items')
      .delete()
      .eq('id', itemToDelete.id);

    if (deleteError) {
      console.error('[ERROR] Failed to delete cohort:', deleteError);
      throw deleteError;
    }

    console.log(`[DEBUG] Successfully deleted cohort: ${cohortIdToDelete} (DB item ID: ${itemToDelete.id})`);

  } catch (err) {
    console.error('[ERROR] Exception in deleteAudienceCohort:', err);
    throw err;
  }
}

// Function to generate more cohort suggestions using AI
export async function generateMoreCohorts(
  projectId: string, 
  existingCohorts: UIMacroLandscapeCohort[], // Use the imported type
  extraNote?: string
): Promise<CustomCohortData[]> {
  try {
    console.log(`[audienceService] generateMoreCohorts called for projectId: ${projectId}`, { existingCohortsCount: existingCohorts.length, extraNote });

    // 1. Get the prompt template
    const promptName = 'AUDIENCE_COHORT_GENERATION_MORE';
    const promptTemplate = await llmConfigService.getPromptByName(promptName, 'audience');
    if (!promptTemplate) {
      console.error(`[ERROR] Prompt not found in DB: ${promptName}`);
      throw new Error(`Prompt not found: ${promptName}`);
    }

    // 2. Prepare the context for the prompt
    // The prompt expects existing cohorts to be in a specific structure if needed, adjust as per prompt.
    // For the provided sample prompt, it expects a "dataset" key with the existing audience JSON.
    // Let's simplify and pass only titles, descriptions, whyItMatters, and IDs for existing cohorts.
    const simplifiedExistingCohorts = existingCohorts.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      whyItMatters: c.whyItMatters
    }));

    const context = {
      dataset: simplifiedExistingCohorts, // Pass the current cohorts as context
      extraNote: extraNote?.trim() || null, // Ensure empty string becomes null
    };
    const contextString = JSON.stringify(context);
    console.log("[audienceService] Context for AI:", contextString);

    // 3. Inject context into the prompt
    let userPrompt = promptTemplate.replace('<<<EXISTING_AUDIENCE_JSON>>>', JSON.stringify(context.dataset));
    userPrompt = userPrompt.replace('<<<OPTIONAL_USER_NOTE_OR_NULL>>>', context.extraNote ? JSON.stringify(context.extraNote) : 'null');
    
    // 4. Call OpenAI (using existing openaiService helpers)
    const { model, model_type } = await getModelConfig(); 
    console.log('[DEBUG] Calling OpenAI for more cohorts with model:', model, 'model_type:', model_type);
    
    const aiResponseContent = await callOpenAI({
      model,
      model_type,
      systemPrompt: 'You are a senior audience strategist who excels at inventing clear, real-world market segments.', // This can also be part of the llm_config prompt if desired
      userPrompt,
      temperature: 0.7,
      max_tokens: 1024, // Adjust as needed, cohorts are relatively small
    });
    console.log('[DEBUG] OpenAI response for more cohorts received');

    // 5. Parse the response
    let parsedAiResponse: { newOptions: CustomCohortData[] };
    try {
      if (typeof aiResponseContent === 'string') {
        // Attempt to find JSON within ```json ... ``` block or as plain JSON
        const jsonMatch = aiResponseContent.match(/```json\n([\s\S]*?)\n```/);
        const contentToParse = jsonMatch ? jsonMatch[1] : aiResponseContent;
        parsedAiResponse = JSON.parse(contentToParse);
      } else if (typeof aiResponseContent === 'object' && aiResponseContent !== null) {
        // If it's already an object (e.g. from reasoning models that directly output JSON objects)
        parsedAiResponse = aiResponseContent as { newOptions: CustomCohortData[] };
      } else {
        throw new Error('Invalid AI response format: not string or object.');
      }

      if (!parsedAiResponse || !Array.isArray(parsedAiResponse.newOptions)) {
        console.error("[ERROR] AI response for more cohorts is not in the expected format { newOptions: [] }", parsedAiResponse);
        throw new Error("AI response for more cohorts is not in the expected format.");
      }
    } catch (e: any) {
      console.error('[ERROR] Failed to parse AI response for more cohorts:', e, "Raw response:", aiResponseContent);
      throw new Error(`Failed to parse AI suggestions: ${e.message}`);
    }

    // Validate and ensure IDs are kebab-case if not already provided by AI adhering to spec
    const validatedNewCohorts = parsedAiResponse.newOptions.map(cohort => {
      let newId = cohort.id;
      if (!newId || typeof newId !== 'string') {
        newId = cohort.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 24);
      }
      if (newId.length > 24) {
        newId = newId.substring(0, 24);
      }
      // Ensure it doesn't randomly start/end with hyphen if we generated it
      if (newId.startsWith('-')) newId = newId.substring(1);
      if (newId.endsWith('-')) newId = newId.slice(0, -1);
      if (!newId) newId = `ai-${Date.now().toString().slice(-5)}`; // Ultimate fallback for ID

      return {
        ...cohort,
        id: newId,
        title: cohort.title || "Untitled AI Cohort",
        description: cohort.description || "",
        whyItMatters: cohort.whyItMatters || "",
      };
    });

    console.log('[audienceService] Generated new cohorts:', validatedNewCohorts);
    return validatedNewCohorts;

  } catch (err) {
    console.error('[ERROR] Exception in generateMoreCohorts:', err);
    throw err; // Re-throw to be caught by UI
  }
} 