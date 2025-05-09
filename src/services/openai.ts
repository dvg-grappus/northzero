import { supabase } from '../lib/supabase';

export interface OpenAIModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: any[];
  root: string;
  parent: string | null;
}

function getModelType(modelId: string): 'chat' | 'completion' | 'reasoning' {
  if (modelId.startsWith('o')) return 'reasoning';
  if (modelId.startsWith('gpt-') || modelId.includes('turbo') || modelId.includes('4o')) return 'chat';
  return 'completion';
}

export const openAIService = {
  async getAvailableModels(): Promise<OpenAIModel[]> {
    // First try to get the API key from environment
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.error('No OpenAI API key found in environment variables');
      throw new Error('OpenAI API key not configured');
    }

    try {
      console.log('Fetching models from OpenAI API...');
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('OpenAI API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('OpenAI API response:', data);

      if (!data.data || !Array.isArray(data.data)) {
        console.error('Unexpected API response:', data);
        throw new Error('Invalid response from OpenAI API');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  },

  // Helper function to format models for display
  getDisplayModels(models: OpenAIModel[]) {
    return models
      .map(model => ({
        id: model.id,
        name: model.id.toUpperCase().replace(/-/g, ' '),
        created: new Date(model.created * 1000).toLocaleDateString(),
        model_type: getModelType(model.id)
      }))
      .sort((a, b) => {
        // Sort by model type (gpt-4 first, then gpt-3.5, then others)
        if (a.id.includes('gpt-4') && !b.id.includes('gpt-4')) return -1;
        if (!a.id.includes('gpt-4') && b.id.includes('gpt-4')) return 1;
        if (a.id.includes('gpt-3.5') && !b.id.includes('gpt-3.5')) return -1;
        if (!a.id.includes('gpt-3.5') && b.id.includes('gpt-3.5')) return 1;
        return 0;
      });
  },

  async getSelectedModel(): Promise<string> {
    const { data, error } = await supabase
      .from('llm_config')
      .select('model_id')
      .single();

    if (error) {
      console.error('Error fetching selected model:', error);
      return 'gpt-4-turbo-preview'; // Fallback to a default model
    }

    return data?.model_id || 'gpt-4-turbo-preview';
  }
}; 