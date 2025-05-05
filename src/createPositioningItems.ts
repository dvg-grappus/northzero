import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qwjwdnovswqdfqvkvbww.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3andkbm92c3dxZGZxdmt2Ynd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMjkxNzEsImV4cCI6MjA2MTYwNTE3MX0.dYJSEOIyxP8H2g_dHPG1gA9xT12KI9rmO9EpVCxwIEs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createPositioningItems() {
  const documentId = 'e5107b76-4687-42f8-9575-bae6e87d8ada'; // ID from previous script
  const projectId = 'e74bf53a-b5c7-4497-807a-0be23c473456'; // North of Zero's ID

  // First, get the document to access its raw_payload
  const { data: doc, error: docError } = await supabase
    .from('positioning_documents')
    .select('raw_payload')
    .eq('id', documentId)
    .single();

  if (docError) {
    console.error('Error fetching document:', docError);
    return;
  }

  const rawPayload = doc.raw_payload;
  const itemsToInsert: any[] = [];
  const now = new Date().toISOString();
  let idx = 0;

  // Helper to add items
  const addItems = (type: string, arr: any[], extra?: (item: any) => any) => {
    arr.forEach((content: any, i: number) => {
      let slot = undefined;
      if (type === 'MILESTONE') {
        if (typeof content === 'object' && content.slot && content.slot !== null) {
          slot = content.slot;
        } else {
          slot = 'unassigned';
        }
      }
      itemsToInsert.push({
        document_id: documentId,
        project_id: projectId,
        item_type: type,
        content: typeof content === 'string' ? content : content.title || content.content || '',
        extra_json: extra ? extra(content) : undefined,
        slot,
        idx: idx++,
        state: 'draft', // All items start as draft
        source: 'ai',
        created_at: now,
        updated_at: now
      });
    });
  };

  // Add all items
  if (rawPayload.whatStatements) addItems('WHAT', rawPayload.whatStatements);
  if (rawPayload.howStatements) addItems('HOW', rawPayload.howStatements);
  if (rawPayload.whyStatements) addItems('WHY', rawPayload.whyStatements);
  if (rawPayload.opportunities) addItems('OPPORTUNITY', rawPayload.opportunities);
  if (rawPayload.challenges) addItems('CHALLENGE', rawPayload.challenges);
  if (rawPayload.milestones) addItems('MILESTONE', rawPayload.milestones);
  if (rawPayload.values) addItems('VALUE', rawPayload.values, (v: any) => ({ blurb: v.blurb }));
  if (rawPayload.differentiators?.whileOthers) addItems('WHILE_OTHERS', rawPayload.differentiators.whileOthers);
  if (rawPayload.differentiators?.weAreTheOnly) addItems('WE_ARE_THE_ONLY', rawPayload.differentiators.weAreTheOnly);

  if (itemsToInsert.length === 0) {
    console.log('No items to insert');
    return;
  }

  const { error: insertError } = await supabase
    .from('positioning_items')
    .insert(itemsToInsert);

  if (insertError) {
    console.error('Error inserting items:', insertError);
  } else {
    console.log(`Successfully created ${itemsToInsert.length} positioning items`);
  }
}

createPositioningItems(); 