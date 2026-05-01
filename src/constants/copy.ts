// All app copy — single source of truth

export const onboarding = {
  welcome: {
    headline: 'Understand where your money goes',
    subtext: 'No pressure. Just clarity.',
    cta: 'Get started',
  },
  intent: {
    headline: 'What brings you here?',
    options: [
      'Track my spending',
      'Stay within budget',
      'Just exploring',
    ],
    cta: 'Continue',
  },
  firstBudget: {
    headline: "Let's set a simple budget",
    subtext: 'Start with one category — you can add more later',
    helper: 'Most people start here',
    reassurance: 'You can change this anytime',
    cta: 'Set budget',
    placeholder: '5000',
  },
  firstExpense: {
    headline: 'Now log your first expense',
    subtext: 'Just something you spent recently',
    placeholder: '200',
    helper: 'This takes a second',
  },
  insightReveal: {
    opening: "Here's your month so far",
    nudge: 'Try adding one more today',
  },
};

export const nudges = {
  good: [
    "You're still on track 👍",
    'All good — this fits your budget',
    'Looking good so far',
  ],
  caution: [
    'Getting close to your limit',
    'Keep an eye on this one 👀',
    "This is picking up a bit",
  ],
  warning: [
    'Almost at your limit',
    'Careful — you\'re right at the edge',
  ],
  over: [
    "That went over — happens",
    'A bit over here — maybe slow down',
    'A little high here',
  ],
  logged: 'Logged ✓',
};

export const catCopy: Record<string, string> = {
  idle: 'Just keeping an eye on things',
  excited: "You're doing great this month! 🎉",
  sleeping: "Log something — I've been waiting",
  celebrating: 'Full month under budget. Impressive.',
  watching: 'Getting close to the limit here',
};

export const emptyStates = {
  transactions: {
    headline: 'Start by logging what you spend',
    subtext: 'It begins with one entry',
    cta: 'Log expense',
  },
  budgets: {
    headline: 'Give your money a direction',
    subtext: 'Start with one category',
    cta: 'Set budget',
  },
  insights: {
    headline: 'Start logging to see insights',
    subtext: 'Your patterns will appear here',
  },
  overview: {
    headline: 'Set a budget to guide your spending',
    subtext: 'Start with one category — food is a great start',
    cta: 'Set budget',
  },
};

export const tabs = {
  overview: 'Overview',
  transactions: 'Transactions',
  budgets: 'Budgets',
  insights: 'Insights',
  settings: 'Settings',
};

export const misc = {
  logExpense: 'Log expense',
  setBudget: 'Set budget',
  left: 'Left',
  over: 'Over by',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  currency: 'Currency',
  resetData: 'Reset data',
  resetConfirm: 'This will delete all transactions and budgets. Categories will remain.',
  resetConfirmCta: 'Reset',
};

export const weeklyStory = {
  opening: ["Here's your week in Luma", 'Your weekly snapshot'],
  closing: ['A little tighter next week?', "You're getting better at this"],
};
