import { Rule, ValidationResult, AnswerInput } from '@/lib/types';

function validateMiddleLetters(answer: AnswerInput, letters: [string, string]): ValidationResult {
  const word = (answer.word || '').trim().toUpperCase();
  const [L1, L2] = letters;
  
  if (!word) {
    return { status: 'invalid', message: 'Please enter a word' };
  }
  
  if (word.length < 3) {
    return { status: 'invalid', message: 'Word must be at least 3 letters to have middle letters' };
  }
  
  // Get the middle portion (excluding first and last characters)
  const middle = word.slice(1, -1);
  
  const hasL1InMiddle = middle.includes(L1);
  const hasL2InMiddle = middle.includes(L2);
  
  // Check if letters are at edges (which would be invalid)
  const L1AtEdge = word[0] === L1 || word[word.length - 1] === L1;
  const L2AtEdge = word[0] === L2 || word[word.length - 1] === L2;
  
  if (hasL1InMiddle && hasL2InMiddle) {
    // Perfect - both letters in the middle
    if (L1AtEdge || L2AtEdge) {
      return {
        status: 'warning',
        message: 'Good, but one letter also appears at an edge',
        details: [
          L1AtEdge ? `"${L1}" appears at start/end` : '',
          L2AtEdge ? `"${L2}" appears at start/end` : '',
        ].filter(Boolean),
      };
    }
    return { status: 'valid', message: 'Perfect!' };
  }
  
  const issues: string[] = [];
  if (!hasL1InMiddle) {
    issues.push(`"${L1}" not found in the middle of the word`);
  }
  if (!hasL2InMiddle) {
    issues.push(`"${L2}" not found in the middle of the word`);
  }
  
  return {
    status: 'invalid',
    message: 'Both letters must appear in the middle',
    details: issues,
  };
}

export const middleLettersRule: Rule = {
  id: 'middleLetters',
  name: 'Middle Letters',
  shortName: 'MIDDLE',
  description: 'Find a word where both letters appear somewhere in the middle (not at the start or end).',
  instructions: 'Say a word where BOTH letters appear in the MIDDLE (not first or last position).',
  difficultyWeight: 4,
  renderStyle: {
    color: '#ea580c', // Orange
    icon: '🎯',
    bgGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
  },
  inputSchema: {
    type: 'single',
    fields: [
      {
        id: 'word',
        label: 'Your word',
        placeholder: 'Enter a word...',
        letterConstraint: 'none',
        minLength: 3,
      },
    ],
  },
  validator: {
    type: 'semi',
    autoCheck: validateMiddleLetters,
    hints: [
      'Longer words give you more room',
      'Think of words with double letters',
    ],
  },
  examples: [
    {
      letters: ['A', 'M'],
      answer: 'ORGANISMS',
      explanation: 'Both A and M appear in the middle',
    },
    {
      letters: ['E', 'R'],
      answer: 'TEMPERATURE',
      explanation: 'Both E and R appear in middle positions',
    },
    {
      letters: ['I', 'N'],
      answer: 'BEGINNING',
      explanation: 'Both I and N are in the middle',
    },
  ],
  hints: [
    'Try longer words (6+ letters)',
    'Words ending in -ING, -TION often work well',
  ],
};
