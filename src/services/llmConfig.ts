import { supabase } from '../lib/supabase';

export interface LLMConfig {
  id: string;
  user_id: string;
  model_id?: string;
  model_type?: string;
  config_type: string;
  prompt_type?: string;
  prompt_name?: string;
  prompt_text?: string;
  prompt_description?: string;
  created_at: string;
  updated_at: string;
}

export const llmConfigService = {
  async getCurrentConfig(): Promise<LLMConfig | null> {
    const { data, error } = await supabase
      .from('llm_config')
      .select('*')
      .eq('config_type', 'selected_model')
      .maybeSingle();

    if (error) {
      console.error('Error fetching LLM config:', error);
      return null;
    }

    return data;
  },

  async updateModel(modelId: string, modelType?: string): Promise<LLMConfig | null> {
    const { data: existingConfig } = await supabase
      .from('llm_config')
      .select('*')
      .eq('config_type', 'selected_model')
      .maybeSingle();

    if (existingConfig) {
      // Update existing config
      const { data, error } = await supabase
        .from('llm_config')
        .update({ model_id: modelId, model_type: modelType, config_type: 'selected_model' })
        .eq('id', existingConfig.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating LLM config:', error);
        return null;
      }

      return data;
    } else {
      // Create new config
      const { data, error } = await supabase
        .from('llm_config')
        .insert({ model_id: modelId, model_type: modelType, config_type: 'selected_model' })
        .select()
        .single();

      if (error) {
        console.error('Error creating LLM config:', error);
        return null;
      }

      return data;
    }
  },

  async getPrompts(promptType: string): Promise<LLMConfig[]> {
    const { data, error } = await supabase
      .from('llm_config')
      .select('*')
      .eq('config_type', 'prompt')
      .eq('prompt_type', promptType);
    if (error) {
      console.error('Error fetching prompts:', error);
      return [];
    }
    return data || [];
  },

  async updatePrompt(promptName: string, promptType: string, promptText: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('llm_config')
      .select('*')
      .eq('config_type', 'prompt')
      .eq('prompt_type', promptType)
      .eq('prompt_name', promptName)
      .maybeSingle();
    if (!existing) return false;
    const { error } = await supabase
      .from('llm_config')
      .update({ prompt_text: promptText })
      .eq('id', existing.id);
    if (error) {
      console.error('Error updating prompt:', error);
      return false;
    }
    return true;
  },

  async getPromptByName(promptName: string, promptType: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('llm_config')
      .select('prompt_text')
      .eq('config_type', 'prompt')
      .eq('prompt_type', promptType)
      .eq('prompt_name', promptName)
      .maybeSingle();
    if (error) {
      console.error('Error fetching prompt:', error);
      return null;
    }
    return data?.prompt_text || null;
  },
}; 