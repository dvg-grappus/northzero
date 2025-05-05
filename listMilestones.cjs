const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://qwjwdnovswqdfqvkvbww.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3andkbm92c3dxZGZxdmt2Ynd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMjkxNzEsImV4cCI6MjA2MTYwNTE3MX0.dYJSEOIyxP8H2g_dHPG1gA9xT12KI9rmO9EpVCxwIEs'
);

(async () => {
  const { data: docs, error: docErr } = await supabase
    .from('positioning_documents')
    .select('id, version')
    .eq('project_id', '31d6151c-c084-4af7-8ba3-7cbc9d5910b8')
    .order('version', { ascending: false });
  if (docErr) { console.error(docErr); process.exit(1); }
  if (!docs || docs.length === 0) { console.log('No document found'); process.exit(0); }
  const docId = docs[0].id;
  const { data: milestones, error: err2 } = await supabase
    .from('positioning_items')
    .select('id,content,slot,state')
    .eq('document_id', docId)
    .eq('item_type', 'MILESTONE');
  if (err2) { console.error(err2); process.exit(1); }
  console.log(milestones);
})(); 