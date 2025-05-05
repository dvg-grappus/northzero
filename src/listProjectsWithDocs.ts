import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qwjwdnovswqdfqvkvbww.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3andkbm92c3dxZGZxdmt2Ynd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMjkxNzEsImV4cCI6MjA2MTYwNTE3MX0.dYJSEOIyxP8H2g_dHPG1gA9xT12KI9rmO9EpVCxwIEs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data || [];
}

async function getLatestPositioningDocument(projectId: string) {
  const { data, error } = await supabase
    .from('positioning_documents')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    console.error('Error fetching positioning document:', error);
    return null;
  }

  return data;
}

(async () => {
  const projects = await getProjects();
  console.log('Projects in DB:');
  for (const project of projects) {
    const doc = await getLatestPositioningDocument(project.id);
    console.log(`- ${project.name} (ID: ${project.id}) | Positioning Doc: ${doc ? 'YES' : 'NO'}`);
  }
})(); 