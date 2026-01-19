import { Rule, ValidationResult, AnswerInput } from '@/lib/types';

function validateWordDissociation(answer: AnswerInput, letters: [string, string]): ValidationResult {
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
  
  // Letters are correct - dissociation is subjective (manual judgment)
  return {
    status: 'warning',
    message: 'Do these words have NO obvious connection?',
    details: [
      'Dissociation is subjective - judge if words are truly unrelated',
      'Avoid: opposites, same category, common phrases',
    ],
  };
}

export const wordDissociationRule: Rule = {
  id: 'wordDissociation',
  name: 'Word Dissociation',
  shortName: 'DISSOCIATE',
  description: 'Say two completely unrelated words, one starting with each letter.',
  instructions: 'Say TWO WORDS that have ABSOLUTELY NO CONNECTION. First word starts with the first letter, second word starts with the second letter.',
  difficultyWeight: 2,
  renderStyle: {
    color: '#0891b2', // Cyan
    icon: '↔️',
    bgGradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
  },
  inputSchema: {
    type: 'double',
    fields: [
      {
        id: 'word1',
        label: 'First word',
        placeholder: 'Unrelated word...',
        letterConstraint: 'first',
        minLength: 2,
      },
      {
        id: 'word2',
        label: 'Second word',
        placeholder: 'Unrelated word...',
        letterConstraint: 'second',
        minLength: 2,
      },
    ],
  },
  validator: {
    type: 'manual',
    autoCheck: validateWordDissociation,
    hints: [
      'Think of random, unconnected concepts',
      'Avoid words from the same category',
    ],
  },
  examples: [
    {
      letters: ['A', 'M'],
      answer: ['Apple', 'Moon'],
      explanation: 'No obvious connection between a fruit and celestial body',
    },
    {
      letters: ['T', 'B'],
      answer: ['Tornado', 'Blanket'],
      explanation: 'Weather phenomenon vs. household item',
    },
    {
      letters: ['C', 'P'],
      answer: ['Cactus', 'Piano'],
      explanation: 'Plant vs. musical instrument - no link',
    },
  ],
  hints: [
    'Pick words from completely different domains',
    'Random is good - avoid any possible link',
  ],
};
