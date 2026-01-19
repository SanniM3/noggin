import { Rule, ValidationResult, AnswerInput } from '@/lib/types';

function validateInitials(answer: AnswerInput, letters: [string, string]): ValidationResult {
  const name = (answer.name || '').trim();
  const [L1, L2] = letters;
  
  if (!name) {
    return { status: 'invalid', message: 'Please enter a name' };
  }
  
  // Split by space and filter empty parts
  const parts = name.split(/\s+/).filter(Boolean);
  
  if (parts.length < 2) {
    return {
      status: 'invalid',
      message: 'Please enter a first and last name',
    };
  }
  
  const firstName = parts[0].toUpperCase();
  const lastName = parts[parts.length - 1].toUpperCase();
  
  const firstInitialMatch = firstName[0] === L1;
  const lastInitialMatch = lastName[0] === L2;
  
  if (firstInitialMatch && lastInitialMatch) {
    return { status: 'valid', message: 'Great choice!' };
  }
  
  // Semi-validation: check if they swapped the order
  const swappedMatch = firstName[0] === L2 && lastName[0] === L1;
  if (swappedMatch) {
    return {
      status: 'warning',
      message: 'Initials are swapped - should be first name then last name',
      details: [`Expected ${L1}.${L2}., got ${firstName[0]}.${lastName[0]}.`],
    };
  }
  
  const issues: string[] = [];
  if (!firstInitialMatch) {
    issues.push(`First name should start with "${L1}" (got "${firstName[0]}")`);
  }
  if (!lastInitialMatch) {
    issues.push(`Last name should start with "${L2}" (got "${lastName[0]}")`);
  }
  
  return {
    status: 'invalid',
    message: 'Initials don\'t match',
    details: issues,
  };
}

export const initialsRule: Rule = {
  id: 'initials',
  name: 'Initials',
  shortName: 'INITIALS',
  description: 'Name a famous person whose initials match the two letters.',
  instructions: 'Say the name of a CELEBRITY or FAMOUS PERSON with these initials (first letter = first name, second = last name).',
  difficultyWeight: 3,
  renderStyle: {
    color: '#059669', // Emerald
    icon: '⭐',
    bgGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  },
  inputSchema: {
    type: 'single',
    fields: [
      {
        id: 'name',
        label: 'Celebrity name',
        placeholder: 'First Last...',
        letterConstraint: 'none',
        minLength: 3,
      },
    ],
  },
  validator: {
    type: 'semi',
    autoCheck: validateInitials,
    hints: [
      'Think actors, musicians, athletes, historical figures',
      'Fictional characters usually don\'t count',
    ],
  },
  examples: [
    {
      letters: ['A', 'M'],
      answer: 'Alyssa Milano',
      explanation: 'A.M. - American actress',
    },
    {
      letters: ['M', 'J'],
      answer: 'Michael Jordan',
      explanation: 'M.J. - Basketball legend',
    },
    {
      letters: ['T', 'S'],
      answer: 'Taylor Swift',
      explanation: 'T.S. - Pop star',
    },
  ],
  hints: [
    'Think of actors, musicians, athletes',
    'Historical figures and politicians count too',
  ],
};
