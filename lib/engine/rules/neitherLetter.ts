import { Rule, ValidationResult, AnswerInput } from '@/lib/types';

function validateNeitherLetter(answer: AnswerInput, letters: [string, string]): ValidationResult {
  const word = (answer.word || '').trim().toUpperCase();
  const [L1, L2] = letters;
  
  if (!word) {
    return { status: 'invalid', message: 'Please enter a word' };
  }
  
  if (word.length < 2) {
    return { status: 'invalid', message: 'Word must be at least 2 letters' };
  }
  
  const hasL1 = word.includes(L1);
  const hasL2 = word.includes(L2);
  
  if (!hasL1 && !hasL2) {
    return { status: 'valid', message: 'Perfect!' };
  }
  
  const issues: string[] = [];
  if (hasL1) {
    issues.push(`Word contains "${L1}"`);
  }
  if (hasL2) {
    issues.push(`Word contains "${L2}"`);
  }
  
  return {
    status: 'invalid',
    message: 'Word must not contain either letter',
    details: issues,
  };
}

export const neitherLetterRule: Rule = {
  id: 'neitherLetter',
  name: 'Neither Letter',
  shortName: 'NEITHER',
  description: 'Find a word that contains neither of the two letters.',
  instructions: 'Say a word that does NOT contain EITHER of these letters.',
  difficultyWeight: 1,
  renderStyle: {
    color: '#dc2626', // Red
    icon: '🚫',
    bgGradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
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
    autoCheck: validateNeitherLetter,
    hints: [
      'Think of which letters are NOT shown',
      'Common words often work',
    ],
  },
  examples: [
    {
      letters: ['A', 'M'],
      answer: 'BICYCLE',
      explanation: 'Contains no A or M',
    },
    {
      letters: ['E', 'T'],
      answer: 'GROW',
      explanation: 'Contains no E or T',
    },
    {
      letters: ['S', 'R'],
      answer: 'QUICK',
      explanation: 'Contains no S or R',
    },
  ],
  hints: [
    'Mentally exclude the shown letters',
    'Short, common words are often easiest',
  ],
};
