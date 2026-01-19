import { Rule, ValidationResult, AnswerInput } from '@/lib/types';

function validateBookend(answer: AnswerInput, letters: [string, string]): ValidationResult {
  const word = (answer.word || '').trim().toUpperCase();
  const [L1, L2] = letters;
  
  if (!word) {
    return { status: 'invalid', message: 'Please enter a word' };
  }
  
  if (word.length < 2) {
    return { status: 'invalid', message: 'Word must be at least 2 letters' };
  }
  
  const startsCorrect = word[0] === L1;
  const endsCorrect = word[word.length - 1] === L2;
  
  if (startsCorrect && endsCorrect) {
    return { status: 'valid', message: 'Perfect!' };
  }
  
  const issues: string[] = [];
  if (!startsCorrect) {
    issues.push(`Word should start with "${L1}" (got "${word[0]}")`);
  }
  if (!endsCorrect) {
    issues.push(`Word should end with "${L2}" (got "${word[word.length - 1]}")`);
  }
  
  return {
    status: 'invalid',
    message: 'Word doesn\'t match the bookend pattern',
    details: issues,
  };
}

export const bookendRule: Rule = {
  id: 'bookend',
  name: 'Bookend',
  shortName: 'BOOKEND',
  description: 'Find a word that starts with the first letter and ends with the second letter.',
  instructions: 'Say a word that STARTS with the first letter and ENDS with the second letter.',
  difficultyWeight: 2,
  renderStyle: {
    color: '#2563eb', // Blue
    icon: '📚',
    bgGradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  },
  inputSchema: {
    type: 'single',
    fields: [
      {
        id: 'word',
        label: 'Your word',
        placeholder: 'Enter a word...',
        letterConstraint: 'none',
        minLength: 2,
      },
    ],
  },
  validator: {
    type: 'auto',
    autoCheck: validateBookend,
    hints: [
      'Think of common words first',
      'Longer words often have more ending options',
    ],
  },
  examples: [
    {
      letters: ['A', 'M'],
      answer: 'ALBUM',
      explanation: 'Starts with A, ends with M',
    },
    {
      letters: ['S', 'E'],
      answer: 'STORE',
      explanation: 'Starts with S, ends with E',
    },
    {
      letters: ['B', 'D'],
      answer: 'BRAND',
      explanation: 'Starts with B, ends with D',
    },
  ],
  hints: [
    'Try adding common suffixes like -ED, -ER, -LY',
    'Think of 4-6 letter words first',
  ],
};
