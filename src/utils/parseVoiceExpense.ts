import type { Budget, BudgetOverride, BudgetRule, Category, Transaction, Workspace } from '@/db/types';
import { Storage } from '@/db/storage';
import { buildEffectiveBudgets } from '@/utils/budgetRules';
import { endOfMonth, getMonthLabel, startOfMonth } from '@/utils/dates';

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
  | { intent: 'query'; answer: string; filter?: ExpenseQueryFilter; clarification?: string };

export type QueryBudgetMode = 'left' | 'closest' | 'over' | 'summary';

export interface ExpenseQueryFilter {
  workspaceId: string;
  workspaceName: string;
  month?: number;
  year?: number;
  dateFrom?: number;
  dateTo?: number;
  categoryIds?: string[];
  paymentMethods?: string[];
  merchantSearch?: string;
  notesSearch?: string;
  textSearch?: string;
  includeBudgetContext?: boolean;
  budgetMode?: QueryBudgetMode;
  ambiguousTerms?: string[];
}

export interface VoiceQueryContext {
  workspaces: Workspace[];
  currentWorkspaceId: string;
  selectedMonth: number;
  selectedYear: number;
  budgetRules: BudgetRule[];
  budgetOverrides: BudgetOverride[];
}

// Kept for backward-compat with AddExpenseSheet prefill shape
export type ParsedExpense = LogItem;

// ─── Structured query parsing / answering ───────────────────────────────────

const PAYMENT_METHODS = [
  { value: 'UPI', aliases: ['upi', 'gpay', 'google pay', 'phonepe', 'paytm'] },
  { value: 'Card', aliases: ['card', 'credit card', 'debit card', 'visa', 'mastercard'] },
  { value: 'Cash', aliases: ['cash'] },
  { value: 'Wallet', aliases: ['wallet'] },
  { value: 'Bank transfer', aliases: ['bank transfer', 'bank transfers', 'transfer', 'netbanking', 'net banking', 'imps', 'neft'] },
] as const;

const MONTH_ALIASES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

const QUERY_HINTS = [
  'how much', 'what did', 'which', 'show', 'find', 'spent', 'spend', 'expenses',
  'budget left', 'left in', 'closest to budget', 'over budget', 'limit',
];

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function includesPhrase(haystack: string, phrase: string): boolean {
  const h = ` ${normalise(haystack)} `;
  const p = ` ${normalise(phrase)} `;
  return h.includes(p);
}

function titleCase(value: string): string {
  return value.replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function formatMoney(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function addMonths(month: number, year: number, delta: number): { month: number; year: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

function isLikelyQuery(transcript: string): boolean {
  const q = normalise(transcript);
  if (/\?$/.test(transcript.trim())) return true;
  return QUERY_HINTS.some(hint => q.includes(hint));
}

function parseExplicitMonth(transcript: string, selectedMonth: number, selectedYear: number): { month?: number; year?: number; explicit: boolean; allTime: boolean } {
  const q = normalise(transcript);
  if (/\b(all time|overall|ever|till now|so far)\b/.test(q)) {
    return { explicit: true, allTime: true };
  }

  const yearMatch = q.match(/\b(20\d{2}|19\d{2})\b/);
  const year = yearMatch ? Number(yearMatch[1]) : selectedYear;

  if (q.includes('last month')) {
    return { ...addMonths(selectedMonth, selectedYear, -1), explicit: true, allTime: false };
  }
  if (q.includes('next month')) {
    return { ...addMonths(selectedMonth, selectedYear, 1), explicit: true, allTime: false };
  }
  if (q.includes('this month') || q.includes('current month')) {
    return { month: selectedMonth, year: selectedYear, explicit: true, allTime: false };
  }

  const foundMonth = MONTH_ALIASES.findIndex(month => q.includes(month));
  if (foundMonth >= 0) {
    return { month: foundMonth + 1, year, explicit: true, allTime: false };
  }

  return { month: selectedMonth, year: selectedYear, explicit: false, allTime: false };
}

function matchWorkspace(transcript: string, context?: VoiceQueryContext): Workspace | null {
  if (!context) return null;
  const matches = context.workspaces.filter(ws => includesPhrase(transcript, ws.name) || includesPhrase(transcript, ws.id));
  if (matches.length === 1) return matches[0];
  return context.workspaces.find(ws => ws.id === context.currentWorkspaceId) ?? null;
}

function matchPaymentMethods(transcript: string): string[] {
  return PAYMENT_METHODS
    .filter(method => method.aliases.some(alias => includesPhrase(transcript, alias)))
    .map(method => method.value);
}

function isPaymentAlias(value: string): boolean {
  const normalised = normalise(value);
  return PAYMENT_METHODS.some(method =>
    normalise(method.value) === normalised || method.aliases.some(alias => normalise(alias) === normalised)
  );
}

function matchCategories(transcript: string, categories: Category[]): Category[] {
  return categories.filter(category =>
    includesPhrase(transcript, category.name) || includesPhrase(transcript, category.id)
  );
}

function extractSearchAfter(transcript: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    const value = match?.[1]?.trim().replace(/[?.!,]+$/, '');
    if (value) return value;
  }
  return undefined;
}

function stripKnownTerms(text: string, categories: Category[], workspaces: Workspace[]): string {
  let q = ` ${normalise(text)} `;
  const removals = [
    ...QUERY_HINTS,
    ...PAYMENT_METHODS.flatMap(method => method.aliases),
    ...categories.flatMap(category => [category.id, category.name]),
    ...workspaces.flatMap(workspace => [workspace.id, workspace.name]),
    ...MONTH_ALIASES,
    'this month', 'current month', 'last month', 'next month', 'all time', 'overall',
    'in', 'on', 'for', 'through', 'via', 'using', 'my', 'the', 'where', 'i', 'wrote',
  ];

  removals
    .map(normalise)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .forEach(term => {
      q = q.replace(new RegExp(`\\s${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s`, 'g'), ' ');
    });

  return q.replace(/\s+/g, ' ').trim();
}

function inferBudgetMode(transcript: string): QueryBudgetMode | undefined {
  const q = normalise(transcript);
  if (q.includes('closest') || q.includes('nearest') || q.includes('limit')) return 'closest';
  if (q.includes('over budget') || q.includes('exceeded') || q.includes('overspent')) return 'over';
  if (q.includes('left') || q.includes('remaining')) return 'left';
  if (q.includes('budget')) return 'summary';
  return undefined;
}

function buildExpenseQueryFilter(
  transcript: string,
  categories: Category[],
  context: VoiceQueryContext
): ExpenseQueryFilter {
  const workspace = matchWorkspace(transcript, context) ?? context.workspaces.find(ws => ws.id === context.currentWorkspaceId);
  const monthInfo = parseExplicitMonth(transcript, context.selectedMonth, context.selectedYear);
  const paymentMethods = matchPaymentMethods(transcript);
  const categoryMatches = matchCategories(transcript, categories).filter(category =>
    paymentMethods.length === 0 || (!isPaymentAlias(category.name) && !isPaymentAlias(category.id))
  );
  const budgetMode = inferBudgetMode(transcript);
  const merchantSearch = extractSearchAfter(transcript, [
    /\b(?:at|from|merchant)\s+([^?.!,]+)$/i,
    /\bmerchant\s+(?:is|was|called)?\s*([^?.!,]+)$/i,
  ]);
  const notesSearch = extractSearchAfter(transcript, [
    /\b(?:notes?|note|wrote|written|mentions?|with note)\s+(?:has|have|is|was|as|about|for)?\s*([^?.!,]+)$/i,
    /\b(?:where|with)\s+i\s+wrote\s+([^?.!,]+)$/i,
  ]);
  const textSearch = !merchantSearch && !notesSearch && categoryMatches.length === 0 && paymentMethods.length === 0
    ? stripKnownTerms(transcript, categories, context.workspaces)
    : undefined;

  const ambiguousTerms: string[] = [];
  const workspaceMatches = context.workspaces.filter(ws => includesPhrase(transcript, ws.name) || includesPhrase(transcript, ws.id));
  if (workspaceMatches.length > 1) ambiguousTerms.push(workspaceMatches.map(ws => ws.name).join(' / '));
  if (categoryMatches.length > 1 && !/\b(categories|budgets|all|any)\b/i.test(transcript)) {
    ambiguousTerms.push(categoryMatches.map(c => c.name).join(' / '));
  }

  const filter: ExpenseQueryFilter = {
    workspaceId: workspace?.id ?? context.currentWorkspaceId,
    workspaceName: workspace?.name ?? 'Current workspace',
    includeBudgetContext: !!budgetMode,
    budgetMode,
  };

  if (!monthInfo.allTime && monthInfo.month && monthInfo.year) {
    filter.month = monthInfo.month;
    filter.year = monthInfo.year;
    filter.dateFrom = startOfMonth(monthInfo.month, monthInfo.year);
    filter.dateTo = endOfMonth(monthInfo.month, monthInfo.year);
  }
  if (categoryMatches.length > 0) filter.categoryIds = categoryMatches.map(c => c.id);
  if (paymentMethods.length > 0) filter.paymentMethods = paymentMethods;
  if (merchantSearch) filter.merchantSearch = merchantSearch;
  if (notesSearch) filter.notesSearch = notesSearch;
  if (textSearch) filter.textSearch = textSearch;
  if (ambiguousTerms.length > 0) filter.ambiguousTerms = ambiguousTerms;

  return filter;
}

function filterTransactions(transactions: Transaction[], filter: ExpenseQueryFilter): Transaction[] {
  const merchant = filter.merchantSearch?.toLowerCase();
  const notes = filter.notesSearch?.toLowerCase();
  const text = filter.textSearch?.toLowerCase();

  return transactions.filter(t => {
    if (filter.dateFrom !== undefined && t.date < filter.dateFrom) return false;
    if (filter.dateTo !== undefined && t.date > filter.dateTo) return false;
    if (filter.categoryIds?.length && !filter.categoryIds.includes(t.categoryId)) return false;
    if (filter.paymentMethods?.length && !filter.paymentMethods.some(pm => normalise(pm) === normalise(t.paymentMethod ?? ''))) return false;
    if (merchant && !t.merchant.toLowerCase().includes(merchant)) return false;
    if (notes && !t.notes.toLowerCase().includes(notes)) return false;
    if (text) {
      const haystack = `${t.merchant} ${t.notes}`.toLowerCase();
      if (!haystack.includes(text)) return false;
    }
    return true;
  });
}

function describeFilter(filter: ExpenseQueryFilter, categories: Category[]): string {
  const parts: string[] = [];
  if (filter.paymentMethods?.length) parts.push(`${filter.paymentMethods.join(' or ')} spends`);
  if (filter.categoryIds?.length) {
    parts.push(filter.categoryIds.map(id => categories.find(c => c.id === id)?.name ?? id).join(' or '));
  }
  if (filter.merchantSearch) parts.push(`merchant matching "${filter.merchantSearch}"`);
  if (filter.notesSearch) parts.push(`notes matching "${filter.notesSearch}"`);
  if (filter.textSearch) parts.push(`matching "${filter.textSearch}"`);
  parts.push(filter.month && filter.year ? getMonthLabel(filter.month, filter.year) : 'all time');
  if (filter.workspaceName) parts.push(filter.workspaceName);
  return parts.join(' in ');
}

function budgetRows(
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  filter: ExpenseQueryFilter
) {
  const scopedBudgets = filter.categoryIds?.length
    ? budgets.filter(budget => filter.categoryIds?.includes(budget.categoryId))
    : budgets;

  return scopedBudgets.map(budget => {
    const spent = transactions
      .filter(t => t.categoryId === budget.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
    const categoryName = categories.find(c => c.id === budget.categoryId)?.name ?? titleCase(budget.categoryId);
    return {
      categoryName,
      amount: budget.amount,
      spent,
      remaining: budget.amount - spent,
      ratio: budget.amount > 0 ? spent / budget.amount : 0,
    };
  });
}

function answerBudgetQuery(
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  filter: ExpenseQueryFilter
): string {
  const rows = budgetRows(transactions, budgets, categories, filter);
  const period = filter.month && filter.year ? getMonthLabel(filter.month, filter.year) : 'all time';

  if (rows.length === 0) {
    return `I couldn't find a budget for ${describeFilter(filter, categories)}.`;
  }

  if (filter.budgetMode === 'over') {
    const over = rows.filter(row => row.remaining < 0).sort((a, b) => a.remaining - b.remaining);
    if (over.length === 0) return `No categories are over budget in ${filter.workspaceName} for ${period}.`;
    return over.slice(0, 3).map(row => `${row.categoryName} is over by ${formatMoney(Math.abs(row.remaining))} (${formatMoney(row.spent)} of ${formatMoney(row.amount)}).`).join(' ');
  }

  if (filter.budgetMode === 'closest') {
    const closest = rows
      .filter(row => row.remaining >= 0)
      .sort((a, b) => a.remaining - b.remaining)[0] ?? rows.sort((a, b) => b.ratio - a.ratio)[0];
    return `${closest.categoryName} is closest to budget in ${filter.workspaceName}: ${formatMoney(closest.remaining)} left after ${formatMoney(closest.spent)} of ${formatMoney(closest.amount)}.`;
  }

  const selected = filter.categoryIds?.length === 1 ? rows[0] : null;
  if (selected) {
    return `${selected.categoryName} has ${formatMoney(selected.remaining)} left in ${filter.workspaceName} for ${period}: ${formatMoney(selected.spent)} spent of ${formatMoney(selected.amount)}.`;
  }

  const totalBudget = rows.reduce((sum, row) => sum + row.amount, 0);
  const totalSpent = rows.reduce((sum, row) => sum + row.spent, 0);
  return `${filter.workspaceName} has ${formatMoney(totalBudget - totalSpent)} left across budgets for ${period}: ${formatMoney(totalSpent)} spent of ${formatMoney(totalBudget)}.`;
}

function answerTransactionQuery(transactions: Transaction[], categories: Category[], filter: ExpenseQueryFilter): string {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const label = describeFilter(filter, categories);
  if (transactions.length === 0) return `I found no expenses for ${label}.`;

  const categoryTotals = new Map<string, number>();
  transactions.forEach(t => categoryTotals.set(t.categoryId, (categoryTotals.get(t.categoryId) ?? 0) + t.amount));
  const topCategory = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1])[0];
  const topCategoryName = topCategory ? categories.find(c => c.id === topCategory[0])?.name ?? topCategory[0] : null;

  const detail = topCategoryName && transactions.length > 1
    ? ` Biggest category: ${topCategoryName} at ${formatMoney(topCategory![1])}.`
    : '';
  return `You spent ${formatMoney(total)} across ${transactions.length} expense${transactions.length === 1 ? '' : 's'} for ${label}.${detail}`;
}

async function loadQueryData(
  filter: ExpenseQueryFilter,
  current: { transactions: Transaction[]; categories: Category[]; budgetRules: BudgetRule[]; budgetOverrides: BudgetOverride[] },
  currentWorkspaceId: string
): Promise<{ transactions: Transaction[]; categories: Category[]; budgetRules: BudgetRule[]; budgetOverrides: BudgetOverride[] }> {
  if (filter.workspaceId === currentWorkspaceId) return current;
  const loaded = await Storage.loadAllFor(filter.workspaceId);
  return {
    transactions: loaded.transactions,
    categories: loaded.categories,
    budgetRules: loaded.budgetRules,
    budgetOverrides: loaded.budgetOverrides,
  };
}

async function answerStructuredQuery(
  transcript: string,
  categories: Category[],
  transactions: Transaction[],
  context: VoiceQueryContext
): Promise<VoiceResult> {
  const initialFilter = buildExpenseQueryFilter(transcript, categories, context);

  if (initialFilter.ambiguousTerms?.length) {
    const clarification = `Do you mean ${initialFilter.ambiguousTerms[0]}?`;
    return { intent: 'query', answer: clarification, filter: initialFilter, clarification };
  }

  const data = await loadQueryData(initialFilter, {
    transactions,
    categories,
    budgetRules: context.budgetRules,
    budgetOverrides: context.budgetOverrides,
  }, context.currentWorkspaceId);
  const filter = buildExpenseQueryFilter(transcript, data.categories, context);
  const scopedTransactions = filterTransactions(data.transactions, filter);

  if (filter.includeBudgetContext) {
    const month = filter.month ?? context.selectedMonth;
    const year = filter.year ?? context.selectedYear;
    const effectiveBudgets = buildEffectiveBudgets(filter.workspaceId, data.budgetRules, data.budgetOverrides, month, year);
    return {
      intent: 'query',
      answer: answerBudgetQuery(scopedTransactions, effectiveBudgets, data.categories, filter),
      filter,
    };
  }

  return {
    intent: 'query',
    answer: answerTransactionQuery(scopedTransactions, data.categories, filter),
    filter,
  };
}

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
  queryContext?: VoiceQueryContext,
): Promise<VoiceResult> {
  if (queryContext && isLikelyQuery(transcript)) {
    return answerStructuredQuery(transcript, categories, transactions, queryContext);
  }

  const prompt = buildPrompt(transcript, categories, transactions);
  const result = PROVIDER === 'openai' ? await callOpenAI(prompt) : await callGemini(prompt);
  if (result.intent === 'query' && queryContext) {
    return answerStructuredQuery(transcript, categories, transactions, queryContext);
  }
  return result;
}
