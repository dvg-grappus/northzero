import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qwjwdnovswqdfqvkvbww.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3andkbm92c3dxZGZxdmt2Ynd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMjkxNzEsImV4cCI6MjA2MTYwNTE3MX0.dYJSEOIyxP8H2g_dHPG1gA9xT12KI9rmO9EpVCxwIEs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deletePositioningItems() {
  const documentId = 'e5107b76-4687-42f8-9575-bae6e87d8ada'; // ID from previous script

  const { error } = await supabase
    .from('positioning_items')
    .delete()
    .eq('document_id', documentId);

  if (error) {
    console.error('Error deleting items:', error);
    return;
  }

  console.log('Successfully deleted all positioning items for the document');
}

deletePositioningItems(); 