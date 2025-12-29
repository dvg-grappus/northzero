import { llmConfigService } from './llmConfig';
import { openAIService } from './openai';
import {
  POSITIONING_GOLDEN_CIRCLE_PROMPT,
  POSITIONING_OPP_CHALLENGE_PROMPT,
  POSITIONING_MILESTONES_PROMPT,
  POSITIONING_VALUES_PROMPT,
  POSITIONING_DIFFERENTIATORS_PROMPT,
  POSITIONING_STATEMENTS_PROMPT_STEP,
} from '@/constants/positioningPrompts';
import {
  POSITIONING_JSON_PROMPT,
  POSITIONING_REST_PROMPT,
} from '@/constants/archivedPositioningPrompts';

const OPENAI_BASE_URL =
  import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com';
const OPENAI_CHAT_URL = `${OPENAI_BASE_URL}/v1/chat/completions`;
const OPENAI_COMPLETION_URL = `${OPENAI_BASE_URL}/v1/completions`;
const OPENAI_REASONING_URL = `${OPENAI_BASE_URL}/v1/responses`;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

const sanitizeJsonString = (raw: string) => {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  if (fenced && fenced[1]) return fenced[1].trim();
  return trimmed;
};

const parseJsonContent = (content: unknown) => {
  if (typeof content === 'object' && content !== null) return content;
  if (typeof content !== 'string') throw new Error('Invalid response format');
  const cleaned = sanitizeJsonString(content);
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse JSON from OpenAI response');
  }
};

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
  const promptTemplate =
    (await llmConfigService.getPromptByName(
      'POSITIONING_JSON_PROMPT',
      'positioning'
    )) || POSITIONING_JSON_PROMPT;
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
    return parseJsonContent(content);
  } catch (e) {
    throw new Error('Failed to parse JSON from OpenAI response');
  }
}

export async function generatePositioningStatementsJson(inputJson: Record<string, any>): Promise<any> {
  console.log('[DEBUG] generatePositioningStatementsJson CALLED');
  console.log('[DEBUG] Input JSON:', JSON.stringify(inputJson, null, 2));
  const promptTemplate =
    (await llmConfigService.getPromptByName(
      'POSITIONING_STATEMENTS_PROMPT_STEP',
      'positioning',
    )) || POSITIONING_STATEMENTS_PROMPT_STEP;
  if (!promptTemplate) throw new Error('Prompt not found in DB: POSITIONING_STATEMENTS_PROMPT_STEP');
  const prompt = promptTemplate.replace('{SELECTIONS_JSON}', JSON.stringify(inputJson));
  console.log('[DEBUG] Prompt being sent:', prompt.substring(0, 500) + '...');
  const { model, model_type } = await getModelConfig();
  console.log('[DEBUG] Using model:', model, '| model_type:', model_type);
  const content = await callOpenAI({
    model,
    model_type,
    systemPrompt: 'You are a senior brand strategist famed for crafting concise, differentiated positioning.',
    userPrompt: prompt,
    temperature: 0.7,
    max_tokens: 2048
  });
  console.log('[DEBUG] Raw OpenAI response content:', content);
  console.log('[DEBUG] Content type:', typeof content);
  try {
    if (model_type === 'reasoning' && typeof content === 'object') {
      const extracted = extractReasoningJson(content);
      console.log('[DEBUG] Final extracted result (reasoning):', extracted);
      if (extracted) return extracted;
    }
    const parsed = parseJsonContent(content);
    console.log('[DEBUG] Parsed JSON result:', JSON.stringify(parsed, null, 2));
    console.log('[DEBUG] Has internal?', !!parsed?.internal);
    console.log('[DEBUG] Has external?', !!parsed?.external);
    console.log('[DEBUG] Internal keys:', parsed?.internal ? Object.keys(parsed.internal) : 'N/A');
    console.log('[DEBUG] External keys:', parsed?.external ? Object.keys(parsed.external) : 'N/A');
    return parsed;
  } catch (e) {
    console.error('[DEBUG] Error parsing JSON:', e);
    console.error('[DEBUG] Raw content that failed:', content);
    throw new Error('Failed to parse JSON from OpenAI response');
  }
}

export async function generateGoldenCircle(briefText: string, selections: any = {}) {
  const selectionJson = JSON.stringify(selections || {});
  const prompt = POSITIONING_GOLDEN_CIRCLE_PROMPT
    .replace('{BRIEF_TEXT}', briefText)
    .replace('{SELECTIONS_JSON}', selectionJson);
  const { model, model_type } = await getModelConfig();
  const content = await callOpenAI({
    model,
    model_type,
    systemPrompt:
      'You are a senior brand strategist famed for crafting concise, differentiated positioning.',
    userPrompt: prompt,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return parseJsonContent(content);
}

export async function generateRemainingPositioningSections(
  briefText: string,
  goldenCircle: {
    whatStatements?: string[];
    howStatements?: string[];
    whyStatements?: string[];
  },
) {
  const prompt = POSITIONING_REST_PROMPT
    .replace('{BRIEF_TEXT}', briefText)
    .replace('{GOLDEN_CIRCLE_JSON}', JSON.stringify(goldenCircle || {}));

  const { model, model_type } = await getModelConfig();
  const content = await callOpenAI({
    model,
    model_type,
    systemPrompt:
      'You are a senior brand strategist famed for crafting concise, differentiated positioning.',
    userPrompt: prompt,
    temperature: 0.7,
    max_tokens: 4096,
  });

  return parseJsonContent(content);
}

export async function generateOpportunitiesAndChallenges(
  briefText: string,
  goldenCircle: {
    whatStatements?: string[];
    howStatements?: string[];
    whyStatements?: string[];
  },
) {
  const prompt = POSITIONING_OPP_CHALLENGE_PROMPT
    .replace('{BRIEF_TEXT}', briefText)
    .replace('{GOLDEN_CIRCLE_JSON}', JSON.stringify(goldenCircle || {}));

  const { model, model_type } = await getModelConfig();
  const content = await callOpenAI({
    model,
    model_type,
    systemPrompt:
      'You are a senior brand strategist famed for crafting concise, differentiated positioning.',
    userPrompt: prompt,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return parseJsonContent(content);
}

export async function generateMilestones(
  briefText: string,
  selections: {
    what?: string[];
    how?: string[];
    why?: string[];
    opportunities?: string[];
    challenges?: string[];
  },
) {
  const selectionJson = JSON.stringify({
    what: selections.what || [],
    how: selections.how || [],
    why: selections.why || [],
    opportunities: selections.opportunities || [],
    challenges: selections.challenges || [],
  });

  const prompt = POSITIONING_MILESTONES_PROMPT
    .replace('{BRIEF_TEXT}', briefText)
    .replace('{SELECTIONS_JSON}', selectionJson);

  const { model, model_type } = await getModelConfig();
  const content = await callOpenAI({
    model,
    model_type,
    systemPrompt:
      'You are a senior brand strategist famed for crafting concise, differentiated positioning.',
    userPrompt: prompt,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return parseJsonContent(content);
}

export async function generateValues(
  briefText: string,
  selections: {
    what?: string[];
    how?: string[];
    why?: string[];
    opportunities?: string[];
    challenges?: string[];
    milestones?: string[];
  },
) {
  const selectionJson = JSON.stringify({
    what: selections.what || [],
    how: selections.how || [],
    why: selections.why || [],
    opportunities: selections.opportunities || [],
    challenges: selections.challenges || [],
    milestones: selections.milestones || [],
  });

  const prompt = POSITIONING_VALUES_PROMPT
    .replace('{BRIEF_TEXT}', briefText)
    .replace('{SELECTIONS_JSON}', selectionJson);

  const { model, model_type } = await getModelConfig();
  const content = await callOpenAI({
    model,
    model_type,
    systemPrompt:
      'You are a senior brand strategist famed for crafting concise, differentiated positioning.',
    userPrompt: prompt,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return parseJsonContent(content);
}

export async function generateDifferentiators(
  briefText: string,
  selections: {
    what?: string[];
    how?: string[];
    why?: string[];
    opportunities?: string[];
    challenges?: string[];
    milestones?: string[];
    values?: { title: string; blurb: string }[];
  },
) {
  const selectionJson = JSON.stringify({
    what: selections.what || [],
    how: selections.how || [],
    why: selections.why || [],
    opportunities: selections.opportunities || [],
    challenges: selections.challenges || [],
    milestones: selections.milestones || [],
    values: selections.values || [],
  });

  const prompt = POSITIONING_DIFFERENTIATORS_PROMPT
    .replace('{BRIEF_TEXT}', briefText)
    .replace('{SELECTIONS_JSON}', selectionJson);

  const { model, model_type } = await getModelConfig();
  const content = await callOpenAI({
    model,
    model_type,
    systemPrompt:
      'You are a senior brand strategist famed for crafting concise, differentiated positioning.',
    userPrompt: prompt,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return parseJsonContent(content);
}

export async function generateStatements(
  briefText: string,
  selections: any,
) {
  const selectionJson = JSON.stringify(selections || {});

  const prompt = POSITIONING_STATEMENTS_PROMPT_STEP
    .replace('{SELECTIONS_JSON}', selectionJson);

  const { model, model_type } = await getModelConfig();
  const content = await callOpenAI({
    model,
    model_type,
    systemPrompt:
      'You are a senior brand strategist famed for crafting concise, differentiated positioning.',
    userPrompt: prompt,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return parseJsonContent(content);
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
    } else {
      parsed = parseJsonContent(content);
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
    return parseJsonContent(content);
  } catch (e) {
    throw new Error('Failed to parse JSON from OpenAI response');
  }
}
