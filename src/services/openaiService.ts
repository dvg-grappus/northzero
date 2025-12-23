import { llmConfigService } from './llmConfig';
import { openAIService } from './openai';

const OPENAI_BASE_URL =
  import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com';
const OPENAI_CHAT_URL = `${OPENAI_BASE_URL}/v1/chat/completions`;
const OPENAI_COMPLETION_URL = `${OPENAI_BASE_URL}/v1/completions`;
const OPENAI_REASONING_URL = `${OPENAI_BASE_URL}/v1/responses`;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

export async function getModelConfig() {
  const config = await llmConfigService.getCurrentConfig();
  if (config && config.model_id) {
    return { model: config.model_id, model_type: config.model_type || 'chat' };
  }
  // fallback for legacy getSelectedModel
  const model = typeof openAIService.getSelectedModel === 'function' ? await openAIService.getSelectedModel() : 'gpt-4-turbo-preview';
  return { model, model_type: 'chat' };
}

export async function callOpenAI({ model, model_type, systemPrompt, userPrompt, temperature = 0.7, max_tokens = 2048 }) {
  console.log('[DEBUG] callOpenAI CALLED with model:', model, '| model_type:', model_type);
  let endpoint, payload;
  if (model_type === 'reasoning') {
    endpoint = OPENAI_REASONING_URL;
    payload = {
      model,
      input: `${systemPrompt ? `SYSTEM:\n${systemPrompt}\n` : ''}USER:\n${userPrompt}`,
      max_output_tokens: 8192
    };
  } else if (model_type === 'chat') {
    endpoint = OPENAI_CHAT_URL;
    payload = {
      model,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: userPrompt }
      ],
      temperature,
      max_tokens
    };
  } else {
    endpoint = OPENAI_COMPLETION_URL;
    payload = {
      model,
      prompt: `${systemPrompt ? `SYSTEM:\n${systemPrompt}\n` : ''}USER:\n${userPrompt}`,
      temperature,
      max_tokens
    };
  }
  console.log('[DEBUG] Using model:', model, '| type:', model_type, '| endpoint:', endpoint);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error('OpenAI API error: ' + response.statusText);
  }
  const data = await response.json();
  if (model_type === 'reasoning') {
    // Find the output text in the response
    const output = data.output?.[0]?.content?.find?.(c => c.type === 'output_text')?.text || data.output?.[0]?.content?.[0]?.text;
    return data;
  } else if (model_type === 'chat') {
    return data.choices?.[0]?.message?.content;
  } else {
    return data.choices?.[0]?.text;
  }
}

export function extractReasoningJson(response) {
  console.log('[DEBUG] extractReasoningJson CALLED');
  console.log('[DEBUG] Full reasoning response:', response);
  const message = (response.output || []).find(o => o.type === 'message');
  console.log('[DEBUG] Message object:', message);
  if (!message) return undefined;
  const outputText = (message.content || []).find(c => c.type === 'output_text');
  console.log('[DEBUG] Output text object:', outputText);
  if (!outputText) return undefined;
  try {
    const parsed = JSON.parse(outputText.text);
    console.log('[DEBUG] Parsed JSON from output_text:', parsed);
    return parsed;
  } catch (e) {
    console.log('[DEBUG] Failed to parse output_text.text as JSON:', outputText.text);
    return undefined;
  }
}

export async function generatePositioningJson(briefText: string): Promise<any> {
  console.log('[DEBUG] generatePositioningJson CALLED');
  const promptTemplate = await llmConfigService.getPromptByName('POSITIONING_JSON_PROMPT', 'positioning');
  if (!promptTemplate) throw new Error('Prompt not found in DB: POSITIONING_JSON_PROMPT');
  const prompt = promptTemplate.replace('{BRIEF_TEXT}', briefText);
  const { model, model_type } = await getModelConfig();
  const content = await callOpenAI({
    model,
    model_type,
    systemPrompt: 'You are a senior brand strategist famed for crafting concise, differentiated positioning.',
    userPrompt: prompt,
    temperature: 0.7,
    max_tokens: 2048
  });
  try {
    if (model_type === 'reasoning' && typeof content === 'object') {
      const extracted = extractReasoningJson(content);
      console.log('[DEBUG] Final extracted result:', extracted);
      if (extracted) return extracted;
    }
    if (typeof content === 'string') {
    return JSON.parse(content);
    } else if (typeof content === 'object') {
      return content;
    }
  } catch (e) {
    if (typeof content === 'string') {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
      }
    }
    throw new Error('Failed to parse JSON from OpenAI response');
  }
}

export async function generatePositioningStatementsJson(inputJson: Record<string, any>): Promise<any> {
  console.log('[DEBUG] generatePositioningStatementsJson CALLED');
  const promptTemplate = await llmConfigService.getPromptByName('POSITIONING_STATEMENTS_PROMPT', 'positioning');
  if (!promptTemplate) throw new Error('Prompt not found in DB: POSITIONING_STATEMENTS_PROMPT');
  const prompt = promptTemplate.replace('<<<INPUT_JSON_GOES_HERE>>>', JSON.stringify(inputJson));
  const { model, model_type } = await getModelConfig();
  const content = await callOpenAI({
    model,
    model_type,
    systemPrompt: 'You are a senior brand strategist famed for crafting concise, differentiated positioning.',
    userPrompt: prompt,
    temperature: 0.7,
    max_tokens: 2048
  });
  try {
    if (model_type === 'reasoning' && typeof content === 'object') {
      const extracted = extractReasoningJson(content);
      console.log('[DEBUG] Final extracted result:', extracted);
      if (extracted) return extracted;
    }
    if (typeof content === 'string') {
      return JSON.parse(content);
    } else if (typeof content === 'object') {
      return content;
    }
  } catch (e) {
    if (typeof content === 'string') {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    }
    throw new Error('Failed to parse JSON from OpenAI response');
  }
}

export async function generateMoreOptions(type: string, contextJson: any, extraNote?: string): Promise<any[]> {
  console.log('[DEBUG] generateMoreOptions CALLED');
  const promptTemplate = await llmConfigService.getPromptByName('GENERATE_MORE_OPTIONS_PROMPT', 'positioning');
  if (!promptTemplate) throw new Error('Prompt not found in DB: GENERATE_MORE_OPTIONS_PROMPT');
  let prompt;
  if (type === 'VALUE') {
    prompt = promptTemplate
      .replace('<<<TYPE>>>', 'VALUES')
      .replace('<<<INPUT_JSON>>>', JSON.stringify(contextJson))
      .replace('<<<OPTIONAL_USER_NOTE_OR_NULL>>>', extraNote ? JSON.stringify(extraNote) : 'null');
  } else {
    prompt = promptTemplate
      .replace('<<<TYPE>>>', type)
      .replace('<<<INPUT_JSON>>>', JSON.stringify(contextJson))
      .replace('<<<OPTIONAL_USER_NOTE_OR_NULL>>>', extraNote ? JSON.stringify(extraNote) : 'null');
  }
  const { model, model_type } = await getModelConfig();
  const content = await callOpenAI({
    model,
    model_type,
    systemPrompt: 'You are a senior brand strategist who excels at inventing sharply differentiated positioning language.',
    userPrompt: prompt,
    temperature: 0.7,
    max_tokens: 512
  });
  try {
    let parsed;
    if (model_type === 'reasoning' && typeof content === 'object') {
      parsed = extractReasoningJson(content);
      console.log('[DEBUG] Final extracted result:', parsed);
      if (!parsed) throw new Error('Failed to extract reasoning output');
    } else if (typeof content === 'string') {
      parsed = JSON.parse(content);
    } else if (typeof content === 'object') {
      parsed = content;
    }
    if (type === 'VALUE') {
      if (Array.isArray(parsed.newOptions) && parsed.newOptions.every(opt => typeof opt.title === 'string' && typeof opt.blurb === 'string')) {
        return parsed.newOptions;
      }
      throw new Error('Invalid response format for VALUES');
    } else {
      if (Array.isArray(parsed.newOptions)) {
        return parsed.newOptions;
      }
      throw new Error('Invalid response format');
    }
  } catch (e) {
    if (typeof content === 'string') {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (type === 'VALUE') {
        if (Array.isArray(parsed.newOptions) && parsed.newOptions.every(opt => typeof opt.title === 'string' && typeof opt.blurb === 'string')) {
          return parsed.newOptions;
        }
      } else {
        if (Array.isArray(parsed.newOptions)) {
          return parsed.newOptions;
          }
        }
      }
    }
    throw new Error('Failed to parse newOptions from OpenAI response');
  }
}

export interface InsightAgentResponse {
  type: 'contradiction' | 'hot-tip' | 'cliché-alert' | 'praise';
  message: string;
  references?: string[];
}

export async function getInsightFromOpenAI(contextJson: any): Promise<InsightAgentResponse> {
  console.log('[DEBUG] getInsightFromOpenAI CALLED');
  const promptTemplate = await llmConfigService.getPromptByName('INSIGHT_AGENT_PROMPT', 'positioning');
  if (!promptTemplate) throw new Error('Prompt not found in DB: INSIGHT_AGENT_PROMPT');
  const prompt = promptTemplate;
  const { model, model_type } = await getModelConfig();
  const content = await callOpenAI({
    model,
    model_type,
    systemPrompt: prompt.split('USER')[0].trim(),
    userPrompt: prompt.split('USER')[1].trim() + '\n\ncontext\n' + JSON.stringify(contextJson),
    temperature: 0.7,
    max_tokens: 512
  });
  try {
    if (model_type === 'reasoning' && typeof content === 'object') {
      const extracted = extractReasoningJson(content);
      console.log('[DEBUG] Final extracted result:', extracted);
      if (extracted) return extracted;
    }
    if (typeof content === 'string') {
      return JSON.parse(content);
    } else if (typeof content === 'object') {
      return content;
    }
  } catch (e) {
    if (typeof content === 'string') {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    }
    throw new Error('Failed to parse JSON from OpenAI response');
  }
}
