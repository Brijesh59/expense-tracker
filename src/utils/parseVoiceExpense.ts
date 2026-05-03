import type { Category } from '@/db/types';
import type { Transaction } from '@/db/types';

// ─── Switch provider here ─────────────────────────────────────────────────────
type Provider = 'gemini' | 'openai';

const PROVIDER: Provider = 'openai';

const MODELS: Record<Provider, string> = {
  gemini: 'gemini-2.0-flash',
  openai: 'gpt-4o-mini',
};
// ─────────────────────────────────────────────────────────────────────────────

export type LogItem = {
  amount: number | null;
  categoryId: string | null;
  paymentMethod: string | null;
  notes: string;
};

export type BudgetItem = {
  categoryId: string | null;
  amount: number | null;
  month: number | null;
  year: number | null;
};

export type VoiceResult =
  | { intent: 'log'; items: LogItem[] }
  | { intent: 'budget'; items: BudgetItem[] }
  | { intent: 'query'; answer: string };

// Kept for backward-compat with AddExpenseSheet prefill shape
export type ParsedExpense = LogItem;

// ─── Transaction context builder ─────────────────────────────────────────────

function buildTransactionContext(transactions: Transaction[], categories: Category[]): string {
  const today = new Date();
  const catName = (id: string) => categories.find(c => c.id === id)?.name ?? id;

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1).getTime();
  const threeMonthsStart = new Date(today.getFullYear(), today.getMonth() - 3, 1).getTime();

  const summarise = (txns: Transaction[]) => {
    const map: Record<string, { total: number; count: number }> = {};
    for (const t of txns) {
      if (!map[t.categoryId]) map[t.categoryId] = { total: 0, count: 0 };
      map[t.categoryId].total += t.amount;
      map[t.categoryId].count++;
    }
    return Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([id, { total, count }]) => `  ${catName(id)}: ₹${Math.round(total)} (${count} txn${count > 1 ? 's' : ''})`)
      .join('\n');
  };

  const thisMonth = transactions.filter(t => t.date >= thisMonthStart);
  const lastMonth = transactions.filter(t => t.date >= lastMonthStart && t.date < thisMonthStart);
  const threeMonths = transactions.filter(t => t.date >= threeMonthsStart);

  // Daily totals for last 7 days
  const dailyLines: string[] = [];
  for (let i = 0; i < 7; i++) {
    const start = new Date(today); start.setDate(today.getDate() - i); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(start.getDate() + 1);
    const dayTxns = transactions.filter(t => t.date >= start.getTime() && t.date < end.getTime());
    const total = dayTxns.reduce((s, t) => s + t.amount, 0);
    if (total > 0) {
      const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : start.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      dailyLines.push(`  ${label}: ₹${Math.round(total)}`);
    }
  }

  // Last 15 individual transactions
  const recent = transactions
    .slice().sort((a, b) => b.date - a.date).slice(0, 15)
    .map(t => {
      const d = new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const desc = [t.merchant, t.notes].filter(Boolean).join(', ');
      return `  ${d} | ${catName(t.categoryId)} | ₹${t.amount}${desc ? ` | ${desc}` : ''}`;
    }).join('\n');

  const parts: string[] = [];

  if (thisMonth.length > 0) {
    const name = today.toLocaleDateString('en-IN', { month: 'long' });
    parts.push(`This month (${name}) — Total ₹${Math.round(thisMonth.reduce((s, t) => s + t.amount, 0))}\n${summarise(thisMonth)}`);
  }
  if (lastMonth.length > 0) {
    const name = new Date(lastMonthStart).toLocaleDateString('en-IN', { month: 'long' });
    parts.push(`Last month (${name}) — Total ₹${Math.round(lastMonth.reduce((s, t) => s + t.amount, 0))}\n${summarise(lastMonth)}`);
  }
  if (threeMonths.length > 0) {
    parts.push(`Last 3 months — Total ₹${Math.round(threeMonths.reduce((s, t) => s + t.amount, 0))}\n${summarise(threeMonths)}`);
  }
  if (dailyLines.length > 0) {
    parts.push(`Daily totals (last 7 days):\n${dailyLines.join('\n')}`);
  }
  if (recent) {
    parts.push(`Recent transactions:\n${recent}`);
  }

  return parts.join('\n\n') || 'No transaction history yet.';
}

// ─── Prompt ──────────────────────────────────────────────────────────────────

function buildPrompt(transcript: string, categories: Category[], transactions: Transaction[]): string {
  const categoryList = categories.map(c => `"${c.id}" (${c.name})`).join(', ');
  const context = buildTransactionContext(transactions, categories);
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return `You are a personal finance assistant for an Indian user. Today is ${today}.

Spending history:
${context}

Available categories: ${categoryList}

User said: "${transcript}"

Decide the intent and respond with JSON only — no markdown, no extra text.

If the user wants to LOG one or more expenses:
{ "intent": "log", "items": [ { "amount": <number|null>, "categoryId": <id from list or null>, "paymentMethod": <"Cash"|"Card"|"UPI"|null>, "notes": <what was bought or ""> }, ... ] }

If the user wants to SET one or more budgets:
{ "intent": "budget", "items": [ { "categoryId": <id from list or null>, "amount": <monthly budget amount or null>, "month": <1-12 or null for current month>, "year": <4-digit year or null for current year> }, ... ] }

If the user is ASKING a question about their spending:
{ "intent": "query", "answer": <1–2 sentence conversational answer using ₹ for amounts> }

Rules:
- If multiple expenses are mentioned in a single utterance, include each as a separate item in the array.
- Infer category from context: "bought clothes" → shopping, "had lunch" → food, "took Uber" → transport.
- When ambiguous (e.g. just an amount), prefer "log".
- For budget month/year: use null if not explicitly stated — it defaults to current month/year.
- For queries, use the spending history above to give an accurate answer.`;
}

// ─── API callers ─────────────────────────────────────────────────────────────

async function callOpenAI(prompt: string): Promise<VoiceResult> {
  const apiKey = process.env.EXPO_PUBLIC_OPEN_API_KEY;
  if (!apiKey) throw new Error('EXPO_PUBLIC_OPEN_API_KEY is not set');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODELS.openai,
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: 512,
      messages: [
        { role: 'system', content: 'You are a personal finance assistant. Always respond with valid JSON.' },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API error ${res.status}: ${await res.text().catch(() => '')}`);
  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenAI');
  return JSON.parse(text) as VoiceResult;
}

async function callGemini(prompt: string): Promise<VoiceResult> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('EXPO_PUBLIC_GEMINI_API_KEY is not set');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELS.gemini}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0, maxOutputTokens: 512 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text().catch(() => '')}`);
  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return JSON.parse(text) as VoiceResult;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function processVoiceInput(
  transcript: string,
  categories: Category[],
  transactions: Transaction[],
): Promise<VoiceResult> {
  const prompt = buildPrompt(transcript, categories, transactions);
  return PROVIDER === 'openai' ? callOpenAI(prompt) : callGemini(prompt);
}
