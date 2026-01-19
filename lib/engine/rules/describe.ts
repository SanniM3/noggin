import { Rule, ValidationResult, AnswerInput } from '@/lib/types';

function validateDescribe(answer: AnswerInput, letters: [string, string]): ValidationResult {
  const adjective = (answer.adjective || '').trim().toUpperCase();
  const noun = (answer.noun || '').trim().toUpperCase();
  const [L1, L2] = letters;
  
  if (!adjective || !noun) {
    return { status: 'invalid', message: 'Please enter both an adjective and a noun' };
  }
  
  const adjectiveStartsCorrect = adjective[0] === L1;
  const nounStartsCorrect = noun[0] === L2;
  
  // Check letter constraints first
  if (!adjectiveStartsCorrect || !nounStartsCorrect) {
    const issues: string[] = [];
    if (!adjectiveStartsCorrect) {
      issues.push(`Adjective should start with "${L1}" (got "${adjective[0]}")`);
    }
    if (!nounStartsCorrect) {
      issues.push(`Noun should start with "${L2}" (got "${noun[0]}")`);
    }
    return {
      status: 'invalid',
      message: 'Words must start with the correct letters',
      details: issues,
    };
  }
  
  // Letters are correct - description quality is subjective
  return {
    status: 'warning',
    message: 'Does this phrase describe something real or sensible?',
    details: [
      'The adjective should meaningfully modify the noun',
      'It should describe a thing, person, or concept that makes sense',
    ],
  };
}

export const describeRule: Rule = {
  id: 'describe',
  name: 'Describe',
  shortName: 'DESCRIBE',
  description: 'Use an adjective and noun starting with the letters to describe something.',
  instructions: 'Say an ADJECTIVE starting with the first letter and a NOUN starting with the second letter that together DESCRIBE something.',
  difficultyWeight: 3,
  renderStyle: {
    color: '#c026d3', // Fuchsia
    icon: '🎨',
    bgGradient: 'linear-gradient(135deg, #c026d3 0%, #a21caf 100%)',
  },
  inputSchema: {
    type: 'double',
    fields: [
      {
        id: 'adjective',
        label: 'Adjective',
        placeholder: 'Describing word...',
        letterConstraint: 'first',
        minLength: 2,
      },
      {
        id: 'noun',
        label: 'Noun',
        placeholder: 'Thing/person...',
        letterConstraint: 'second',
        minLength: 2,
      },
    ],
  },
  validator: {
    type: 'manual',
    autoCheck: validateDescribe,
    hints: [
      'Think of real things that could be described',
      'The phrase should make grammatical sense',
    ],
  },
  examples: [
    {
      letters: ['A', 'B'],
      answer: ['Amazing', 'Bear'],
      explanation: 'Describes a remarkable bear',
    },
    {
      letters: ['S', 'C'],
      answer: ['Speedy', 'Car'],
      explanation: 'Describes a fast automobile',
    },
    {
      letters: ['B', 'S'],
      answer: ['Beautiful', 'Sunset'],
      explanation: 'Describes a scenic view',
    },
  ],
  hints: [
    'Think of things, animals, people, places',
    'Common adjectives: Big, Small, Fast, Slow, Happy, Sad',
  ],
};
