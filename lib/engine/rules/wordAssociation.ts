import { Rule, ValidationResult, AnswerInput } from '@/lib/types';

function validateWordAssociation(answer: AnswerInput, letters: [string, string]): ValidationResult {
  const word1 = (answer.word1 || '').trim().toUpperCase();
  const word2 = (answer.word2 || '').trim().toUpperCase();
  const [L1, L2] = letters;
  
  if (!word1 || !word2) {
    return { status: 'invalid', message: 'Please enter both words' };
  }
  
  const word1StartsCorrect = word1[0] === L1;
  const word2StartsCorrect = word2[0] === L2;
  
  // Check letter constraints first
  if (!word1StartsCorrect || !word2StartsCorrect) {
    const issues: string[] = [];
    if (!word1StartsCorrect) {
      issues.push(`First word should start with "${L1}" (got "${word1[0]}")`);
    }
    if (!word2StartsCorrect) {
      issues.push(`Second word should start with "${L2}" (got "${word2[0]}")`);
    }
    return {
      status: 'invalid',
      message: 'Words must start with the correct letters',
      details: issues,
    };
  }
  
  // Letters are correct - association is subjective (manual judgment)
  return {
    status: 'warning',
    message: 'Do these words have an obvious connection?',
    details: [
      'Association is subjective - judge if the connection is clear',
      'Examples: Doctor + Medicine, Sun + Moon, Salt + Pepper',
    ],
  };
}

export const wordAssociationRule: Rule = {
  id: 'wordAssociation',
  name: 'Word Association',
  shortName: 'ASSOCIATE',
  description: 'Say two related words, one starting with each letter.',
  instructions: 'Say TWO WORDS that are clearly RELATED or ASSOCIATED. First word starts with the first letter, second word starts with the second letter.',
  difficultyWeight: 3,
  renderStyle: {
    color: '#7c3aed', // Violet
    icon: '🔗',
    bgGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
  },
  inputSchema: {
    type: 'double',
    fields: [
      {
        id: 'word1',
        label: 'First word',
        placeholder: 'Related word...',
        letterConstraint: 'first',
        minLength: 2,
      },
      {
        id: 'word2',
        label: 'Second word',
        placeholder: 'Related word...',
        letterConstraint: 'second',
        minLength: 2,
      },
    ],
  },
  validator: {
    type: 'manual',
    autoCheck: validateWordAssociation,
    hints: [
      'Think of pairs: opposites, categories, common phrases',
      'The connection should be obvious to others',
    ],
  },
  examples: [
    {
      letters: ['A', 'M'],
      answer: ['Ambulance', 'Medicine'],
      explanation: 'Both related to healthcare/emergency',
    },
    {
      letters: ['S', 'P'],
      answer: ['Salt', 'Pepper'],
      explanation: 'Classic pair - always go together',
    },
    {
      letters: ['D', 'N'],
      answer: ['Day', 'Night'],
      explanation: 'Opposites that form a pair',
    },
  ],
  hints: [
    'Think: opposites, categories, cause-effect',
    'Common phrases or idioms work great',
  ],
};
