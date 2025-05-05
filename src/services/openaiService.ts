import { POSITIONING_JSON_PROMPT, POSITIONING_STATEMENTS_PROMPT, GENERATE_MORE_OPTIONS_PROMPT } from '@/constants/openaiPrompts';
import { INSIGHT_AGENT_PROMPT } from './openaiPrompts';

const OPENAI_API_KEY = 'REMOVED';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function generatePositioningJson(briefText: string): Promise<any> {
  const prompt = POSITIONING_JSON_PROMPT.replace('{BRIEF_TEXT}', briefText);

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a senior brand strategist famed for crafting concise, differentiated positioning.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    throw new Error('OpenAI API error: ' + response.statusText);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  try {
    // Try to parse the JSON directly
    return JSON.parse(content);
  } catch (e) {
    // Try to extract JSON from the response if there is extra text
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Failed to parse JSON from OpenAI response');
  }
}

export async function generatePositioningStatementsJson(inputJson: Record<string, any>): Promise<any> {
  const prompt = POSITIONING_STATEMENTS_PROMPT.replace('<<<INPUT_JSON_GOES_HERE>>>', JSON.stringify(inputJson));

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a senior brand strategist famed for crafting concise, differentiated positioning.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    throw new Error('OpenAI API error: ' + response.statusText);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  try {
    // Try to parse the JSON directly
    return JSON.parse(content);
  } catch (e) {
    // Try to extract JSON from the response if there is extra text
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Failed to parse JSON from OpenAI response');
  }
}

export async function generateMoreOptions(type: string, contextJson: any, extraNote?: string): Promise<any[]> {
  let prompt;
  if (type === 'VALUE') {
    // Use the updated prompt for VALUES
    prompt = GENERATE_MORE_OPTIONS_PROMPT
      .replace('<<<TYPE>>>', 'VALUES')
      .replace('<<<INPUT_JSON>>>', JSON.stringify(contextJson))
      .replace('<<<OPTIONAL_USER_NOTE_OR_NULL>>>', extraNote ? JSON.stringify(extraNote) : 'null');
  } else {
    prompt = GENERATE_MORE_OPTIONS_PROMPT
      .replace('<<<TYPE>>>', type)
      .replace('<<<INPUT_JSON>>>', JSON.stringify(contextJson))
      .replace('<<<OPTIONAL_USER_NOTE_OR_NULL>>>', extraNote ? JSON.stringify(extraNote) : 'null');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a senior brand strategist who excels at inventing sharply differentiated positioning language.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 512
    })
  });

  if (!response.ok) {
    throw new Error('OpenAI API error: ' + response.statusText);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  try {
    const parsed = JSON.parse(content);
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
    // Try to extract JSON from the response if there is extra text
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
    throw new Error('Failed to parse newOptions from OpenAI response');
  }
}

export interface InsightAgentResponse {
  type: 'contradiction' | 'tip' | 'cliché-alert' | 'redundant' | 'praise' | 'fresh-angle';
  message: string;
  references?: string[];
}

export async function getInsightFromOpenAI(contextJson: any): Promise<InsightAgentResponse> {
  const prompt = INSIGHT_AGENT_PROMPT;

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: prompt.split('USER')[0].trim() },
        { role: 'user', content: prompt.split('USER')[1].trim() + '\n\ncontext\n' + JSON.stringify(contextJson) }
      ],
      temperature: 0.7,
      max_tokens: 512
    })
  });

  if (!response.ok) {
    throw new Error('OpenAI API error: ' + response.statusText);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  try {
    // Try to parse the JSON directly
    return JSON.parse(content);
  } catch (e) {
    // Try to extract JSON from the response if there is extra text
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Failed to parse JSON from OpenAI response');
  }
} 