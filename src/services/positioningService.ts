import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Types for positioning data
export interface PositioningDocument {
  id: string;
  project_id: string;
  version: number;
  brief: string;
  raw_payload: any;
  created_by?: string;
  created_at: string;
}

export interface PositioningItem {
  id: string;
  document_id: string;
  project_id: string;
  item_type: 'WHAT' | 'HOW' | 'WHY' | 'OPPORTUNITY' | 'CHALLENGE' | 'MILESTONE' | 'VALUE' | 'WHILE_OTHERS' | 'WE_ARE_THE_ONLY';
  content: string;
  extra_json?: any;
  slot?: 'now' | '1yr' | '3yr' | '5yr' | '10yr' | 'unassigned';
  idx: number;
  state: 'draft' | 'selected' | 'archived';
  source: 'ai' | 'user';
  created_at: string;
  updated_at: string;
}

// Utility function to validate UUID
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(id);
};

// Get the latest positioning document for a project
export const getLatestPositioningDocument = async (projectId: string): Promise<PositioningDocument | null> => {
  try {
    const { data, error } = await supabase
      .from('positioning_documents')
      .select('*')
      .eq('project_id', projectId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    return null;
  }
};

// Get all positioning items for a document
export const getPositioningItems = async (documentId: string): Promise<PositioningItem[]> => {
  try {
    const { data, error } = await supabase
      .from('positioning_items')
      .select('*')
      .eq('document_id', documentId)
      .order('idx');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    return [];
  }
};

// Get all positioning items for a project (latest version)
export const getProjectPositioningItems = async (projectId: string): Promise<PositioningItem[]> => {
  try {
    // First get the latest document
    const latestDoc = await getLatestPositioningDocument(projectId);
    if (!latestDoc) {
      return [];
    }

    // Then get all items for that document
    return await getPositioningItems(latestDoc.id);
  } catch (error) {
    return [];
  }
};

// Get selected items by type
export const getSelectedItemsByType = async (
  projectId: string, 
  itemType: PositioningItem['item_type']
): Promise<PositioningItem[]> => {
  try {
    const latestDoc = await getLatestPositioningDocument(projectId);
    if (!latestDoc) {
      return [];
    }

    const { data, error } = await supabase
      .from('positioning_items')
      .select('*')
      .eq('document_id', latestDoc.id)
      .eq('item_type', itemType)
      .eq('state', 'selected')
      .order('idx');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    return [];
  }
};

// Update an item's state (select/deselect)
export const updateItemState = async (
  itemId: string, 
  state: 'draft' | 'selected' | 'archived'
): Promise<boolean> => {
  try {
    // Check if the itemId is a valid UUID before proceeding
    if (!isValidUUID(itemId)) {
      return true; // Return true to prevent UI errors for mock data
    }

    const { error } = await supabase
      .from('positioning_items')
      .update({ state, updated_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    toast.error('Failed to update item');
    return false;
  }
};

// Update a milestone's slot
export const updateMilestoneSlot = async (
  itemId: string, 
  slot: 'now' | '1yr' | '3yr' | '5yr' | '10yr' | 'unassigned'
): Promise<boolean> => {
  try {
    // Check if the itemId is a valid UUID before proceeding
    if (!isValidUUID(itemId)) {
      return true; // Return true to prevent UI errors for mock data
    }

    // Update the milestone to the new slot
    const { error } = await supabase
      .from('positioning_items')
      .update({ 
        slot,
        state: slot === 'unassigned' ? 'draft' : 'selected', // Set state based on slot
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (error) {
      toast.error('Error updating milestone slot: ' + error.message);
      return false;
    }

    return true;
  } catch (error) {
    toast.error('Error updating milestone slot: ' + (error as any).message);
    return false;
  }
};

// Get a formatted positioning summary for a project
export const getPositioningSummary = async (projectId: string) => {
  try {
    const items = await getProjectPositioningItems(projectId);
    
    // Group by item type and filter for selected items
    const summary: Record<string, any> = {};
    
    items.forEach(item => {
      if (item.state === 'selected') {
        if (!summary[item.item_type]) {
          summary[item.item_type] = [];
        }
        
        if (item.item_type === 'VALUE') {
          summary[item.item_type].push({
            title: item.content,
            blurb: item.extra_json?.blurb || ''
          });
        } else if (item.item_type === 'MILESTONE') {
          summary[item.item_type].push({
            content: item.content,
            slot: item.slot
          });
        } else {
          summary[item.item_type].push(item.content);
        }
      }
    });
    
    return summary;
  } catch (error) {
    return null;
  }
};

// Create positioning_items from a document's JSON
export const createPositioningItemsFromDocument = async (
  documentId: string,
  projectId: string,
  rawPayload: any
): Promise<boolean> => {
  try {
    const itemsToInsert: any[] = [];
    const now = new Date().toISOString();
    let idx = 0;

    // Helper to add items
    const addItems = (type: string, arr: any[], extra?: (item: any) => any) => {
      arr.forEach((content: any) => {
        const extraFields = extra ? extra(content) : {};
        itemsToInsert.push({
          document_id: documentId,
          project_id: projectId,
          item_type: type,
          content: typeof content === 'string' ? content : content.title || content.content || '',
          extra_json: extraFields.extra_json,
          slot: extraFields.slot,
          idx: idx++,
          state: content.state || 'draft',
          source: 'ai',
          created_at: now,
          updated_at: now
        });
      });
    };

    // WHAT, HOW, WHY
    if (rawPayload.whatStatements) addItems('WHAT', rawPayload.whatStatements);
    if (rawPayload.howStatements) addItems('HOW', rawPayload.howStatements);
    if (rawPayload.whyStatements) addItems('WHY', rawPayload.whyStatements);
    // Opportunities & Challenges
    if (rawPayload.opportunities) addItems('OPPORTUNITY', rawPayload.opportunities);
    if (rawPayload.challenges) addItems('CHALLENGE', rawPayload.challenges);
    // Milestones
    if (rawPayload.milestones) addItems('MILESTONE', rawPayload.milestones, (m: any) => {
      if (typeof m === 'object' && m.slot && m.slot !== null) {
        return { slot: m.slot };
      }
      return { slot: 'unassigned' };
    });
    // Values
    if (rawPayload.values) addItems('VALUE', rawPayload.values, (v: any) => ({ extra_json: { blurb: v.blurb } }));
    // Differentiators
    if (rawPayload.differentiators?.whileOthers) addItems('WHILE_OTHERS', rawPayload.differentiators.whileOthers);
    if (rawPayload.differentiators?.weAreTheOnly) addItems('WE_ARE_THE_ONLY', rawPayload.differentiators.weAreTheOnly);

    if (itemsToInsert.length === 0) return true;

    const { error } = await supabase
      .from('positioning_items')
      .insert(itemsToInsert);

    if (error) throw error;
    return true;
  } catch (error) {
    toast.error('Failed to create positioning items');
    return false;
  }
};

// Create a new positioning document from AI JSON and seed items
export const createPositioningDocumentFromAI = async (projectId: string, aiJson: any) => {
  // Get latest version
  const latestDoc = await getLatestPositioningDocument(projectId);
  const newVersion = latestDoc ? (latestDoc.version + 1) : 1;
  const now = new Date().toISOString();
  // Insert new document
  const { data: doc, error } = await supabase
    .from('positioning_documents')
    .insert({
      project_id: projectId,
      version: newVersion,
      brief: aiJson.brief,
      raw_payload: aiJson,
      created_at: now
    })
    .select()
    .single();
  if (error) throw error;
  // Seed items
  await createPositioningItemsFromDocument(doc.id, projectId, aiJson);
  return doc;
};

// Delete the existing positioning document and items for a project, then create a new one
export const replacePositioningDocumentForProject = async (projectId: string, aiJson: any) => {
  // Delete ALL documents for this project
  const { error: delErr } = await supabase
    .from('positioning_documents')
    .delete()
    .eq('project_id', projectId);
  if (delErr) throw delErr;

  // Create new document (no versioning)
  const now = new Date().toISOString();
  const { data: doc, error } = await supabase
    .from('positioning_documents')
    .insert({
      project_id: projectId,
      version: 1,
      brief: aiJson.brief,
      raw_payload: aiJson,
      created_at: now
    })
    .select()
    .single();
  if (error) throw error;

  // Seed items
  await createPositioningItemsFromDocument(doc.id, projectId, aiJson);
  return doc;
};

export async function createStatementItemsFromAI(statementId: string, documentId: string, projectId: string, aiJson: any) {
  const now = new Date().toISOString();
  let idx = 0;
  const itemsToInsert: any[] = [];

  // Internal slots
  ['WHAT', 'HOW', 'WHY', 'WHO', 'WHERE', 'WHEN'].forEach(slot => {
    const slotData = aiJson.internal?.[slot];
    if (!slotData) return;
    // Preferred
    itemsToInsert.push({
      statement_id: statementId,
      document_id: documentId,
      project_id: projectId,
      item_type: `STATEMENT_${slot}`,
      content: slotData.preferred,
      idx: idx++,
      state: 'selected',
      created_at: now,
      updated_at: now
    });
    // Alternatives
    (slotData.alternatives || []).forEach((alt: string) => {
      itemsToInsert.push({
        statement_id: statementId,
        document_id: documentId,
        project_id: projectId,
        item_type: `STATEMENT_${slot}`,
        content: alt,
        idx: idx++,
        state: 'draft',
        created_at: now,
        updated_at: now
      });
    });
  });

  // External slots
  ['PROPOSITION', 'BENEFIT', 'OUTCOME'].forEach(slot => {
    const slotData = aiJson.external?.[slot];
    if (!slotData) return;
    // Preferred
    itemsToInsert.push({
      statement_id: statementId,
      document_id: documentId,
      project_id: projectId,
      item_type: `STATEMENT_${slot}`,
      content: slotData.preferred,
      idx: idx++,
      state: 'selected',
      created_at: now,
      updated_at: now
    });
    // Alternatives
    (slotData.alternatives || []).forEach((alt: string) => {
      itemsToInsert.push({
        statement_id: statementId,
        document_id: documentId,
        project_id: projectId,
        item_type: `STATEMENT_${slot}`,
        content: alt,
        idx: idx++,
        state: 'draft',
        created_at: now,
        updated_at: now
      });
    });
  });

  if (itemsToInsert.length > 0) {
    const { error, data } = await supabase.from('positioning_items').insert(itemsToInsert);
    if (error) {
      toast.error('Failed to insert statement items: ' + error.message);
    } else {
    }
  }
}

// --- Positioning Statements Table ---

// Insert or replace the statements for a project (delete old, insert new)
export async function savePositioningStatements(projectId: string, statementsJson: any) {
  // Delete all old statements for this project
  const { error: delError } = await supabase.from('positioning_statements').delete().eq('project_id', projectId);
  if (delError) {
    throw delError;
  }
  // Add a small delay to help avoid race conditions
  await new Promise(res => setTimeout(res, 100));
  // Insert new
  const { data, error } = await supabase.from('positioning_statements').insert({
    project_id: projectId,
    statements_json: statementsJson,
    created_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return data;
}

// Fetch the latest statements for a project
export async function getPositioningStatements(projectId: string) {
  const { data, error } = await supabase
    .from('positioning_statements')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}