import { createClient } from '@supabase/supabase-js';

// Use Vite/React env variables (must start with VITE_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

export type InsightType =
  | 'contradiction'
  | 'tip'
  | 'cliché-alert'
  | 'redundant'
  | 'praise'
  | 'fresh-angle';

export interface Insight {
  id: string;
  project_id: string;
  type: string; // e.g. 'positioning'
  insight_type: InsightType;
  message: string;
  insight_references?: string[];
  section: string;
  created_at: string;
}

export interface NewInsight {
  project_id: string;
  type: string;
  insight_type: InsightType;
  message: string;
  insight_references?: string[];
  section: string;
}

export async function addInsight(insight: NewInsight): Promise<Insight | null> {
  const { data, error } = await supabase
    .from('insights')
    .insert([{ ...insight }])
    .select()
    .single();
  if (error) {
    console.error('Error adding insight:', error);
    return null;
  }
  return data as Insight;
}

export async function getLatestInsights(projectId: string, type: string, limit = 10): Promise<Insight[]> {
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('project_id', projectId)
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Error fetching insights:', error);
    return [];
  }
  return data as Insight[];
} 