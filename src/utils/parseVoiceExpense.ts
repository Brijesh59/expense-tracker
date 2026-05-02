import type { Category } from '@/db/types';

// ─── Switch provider here ─────────────────────────────────────────────────────
type Provider = 'gemini' | 'openai';

const PROVIDER: Provider = 'openai';

const MODELS: Record<Provider, string> = {
  gemini: 'gemini-2.0-flash',
  openai: 'gpt-4o-mini',
};
// ─────────────────────────────────────────────────────────────────────────────

export interface ParsedExpense {
  amount: number | null;
  categoryId: string | null;
  merchant: string;
  paymentMethod: string | null;
  notes: string;
}

function buildPrompt(transcript: string, categories: Category[]): string {
  const categoryList = categories.map(c => `  "${c.id}" — ${c.name}`).join('\n');
  return `You are a personal finance assistant for an Indian user. Extract expense details from a voice description.

Available categories (id — name):
${categoryList}

Voice input: "${transcript}"

Instructions:
- Infer the category from the full context of what was purchased, not just keywords. For example: "bought clothes" or "got a shirt" → shopping; "had lunch" or "ordered biryani" → food; "took an Uber" → transport; "got medicines" → health.
- "merchant" is the store, app, or place name (e.g. "Zara", "Swiggy", "Apollo Pharmacy"). Empty string if none mentioned.
- "notes" is what was specifically bought or any useful detail (e.g. "clothes", "lunch with team", "electricity bill"). Empty string if nothing specific.
- "paymentMethod" is only "Cash", "Card", or "UPI" — null if not mentioned.
- "amount" is the number only — null if not mentioned.

Return only a JSON object with keys: amount, categoryId, merchant, paymentMethod, notes.`;
}

async function callGemini(prompt: string): Promise<ParsedExpense> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('EXPO_PUBLIC_GEMINI_API_KEY is not set');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELS.gemini}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0, maxOutputTokens: 128 },
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return JSON.parse(text) as ParsedExpense;
}

async function callOpenAI(prompt: string): Promise<ParsedExpense> {
  const apiKey = process.env.EXPO_PUBLIC_OPEN_API_KEY;
  if (!apiKey) throw new Error('EXPO_PUBLIC_OPEN_API_KEY is not set');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODELS.openai,
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: 128,
      messages: [
        { role: 'system', content: 'You are a personal finance assistant. Always respond with valid JSON.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`OpenAI API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text: string = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenAI');
  return JSON.parse(text) as ParsedExpense;
}

export async function parseVoiceExpense(transcript: string, categories: Category[]): Promise<ParsedExpense> {
  const prompt = buildPrompt(transcript, categories);
  return PROVIDER === 'openai' ? callOpenAI(prompt) : callGemini(prompt);
}
