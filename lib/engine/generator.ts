import seedrandom from 'seedrandom';
import { Difficulty, Rule } from '@/lib/types';
import { getAllRules, getRulesByDifficulty } from './rules';

// Letter frequency weights (based on English language frequency, adjusted for game balance)
const LETTER_WEIGHTS: Record<string, number> = {
  // Common letters (weight 3)
  E: 3, T: 3, A: 3, O: 3, I: 3, N: 3, S: 3, R: 3, H: 3, L: 3,
  // Medium letters (weight 2)
  D: 2, C: 2, U: 2, M: 2, W: 2, F: 2, G: 2, Y: 2, P: 2, B: 2,
  // Uncommon letters (weight 1)
  V: 1, K: 1, J: 1, X: 1, Q: 1, Z: 1,
};

// Difficulty adjustments for letter selection
const DIFFICULTY_SETTINGS: Record<Difficulty, { minWeight: number; allowRare: boolean }> = {
  easy: { minWeight: 2, allowRare: false },
  normal: { minWeight: 1, allowRare: true },
  hard: { minWeight: 1, allowRare: true },
};

// Letter pairs to avoid (too difficult or have no valid answers for certain rules)
const BLACKLISTED_PAIRS: Set<string> = new Set([
  'QZ', 'ZQ', 'QX', 'XQ', 'QJ', 'JQ',
  'XZ', 'ZX', 'XJ', 'JX', 'ZJ', 'JZ',
]);

interface GeneratorOptions {
  seed?: string;
  difficulty: Difficulty;
  excludeLetters?: string[];
  excludePairs?: string[];
}

interface RuleSelectionOptions {
  seed?: string;
  difficulty: Difficulty;
  excludeRuleIds?: string[];
  practiceRuleId?: string;
}

/**
 * Creates a seeded random number generator
 */
function createRng(seed?: string): () => number {
  if (seed) {
    return seedrandom(seed);
  }
  return Math.random;
}

/**
 * Weighted random selection from an array
 */
function weightedRandom<T>(items: T[], weights: number[], rng: () => number): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = rng() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  return items[items.length - 1];
}

/**
 * Generates a weighted letter based on difficulty
 */
function generateLetter(
  options: GeneratorOptions,
  rng: () => number,
  exclude: string[] = []
): string {
  const settings = DIFFICULTY_SETTINGS[options.difficulty];
  
  // Filter letters based on difficulty and exclusions
  const availableLetters = Object.entries(LETTER_WEIGHTS)
    .filter(([letter, weight]) => {
      if (exclude.includes(letter)) return false;
      if (options.excludeLetters?.includes(letter)) return false;
      if (!settings.allowRare && weight < settings.minWeight) return false;
      return true;
    });
  
  const letters = availableLetters.map(([letter]) => letter);
  const weights = availableLetters.map(([, weight]) => weight);
  
  // On hard difficulty, invert weights to favor uncommon letters
  const finalWeights = options.difficulty === 'hard'
    ? weights.map(w => 4 - w)
    : weights;
  
  return weightedRandom(letters, finalWeights, rng);
}

/**
 * Generates a pair of letters for a round
 */
export function generateLetterPair(options: GeneratorOptions): [string, string] {
  const rng = createRng(options.seed);
  
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    const letter1 = generateLetter(options, rng);
    const letter2 = generateLetter(options, rng, [letter1]);
    
    const pair = letter1 + letter2;
    
    // Check blacklist
    if (BLACKLISTED_PAIRS.has(pair)) {
      attempts++;
      continue;
    }
    
    // Check excluded pairs
    if (options.excludePairs?.includes(pair)) {
      attempts++;
      continue;
    }
    
    return [letter1, letter2];
  }
  
  // Fallback to safe common letters
  return ['S', 'T'];
}

/**
 * Generates a sequence of letter pairs for a run (e.g., daily challenge)
 */
export function generateLetterSequence(
  count: number,
  options: GeneratorOptions
): Array<[string, string]> {
  const rng = createRng(options.seed);
  const sequence: Array<[string, string]> = [];
  const usedPairs: Set<string> = new Set();
  
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    const maxAttempts = 50;
    
    while (attempts < maxAttempts) {
      const roundSeed = options.seed ? `${options.seed}-round-${i}-${attempts}` : undefined;
      const pair = generateLetterPair({
        ...options,
        seed: roundSeed,
      });
      
      const pairKey = pair.join('');
      
      if (!usedPairs.has(pairKey)) {
        usedPairs.add(pairKey);
        sequence.push(pair);
        break;
      }
      
      attempts++;
    }
    
    // If we couldn't find a unique pair, just add a common one
    if (sequence.length <= i) {
      sequence.push(['A', 'B']);
    }
  }
  
  return sequence;
}

/**
 * Selects a rule based on difficulty and exclusions
 */
export function selectRule(options: RuleSelectionOptions): Rule {
  // Practice mode - always return the selected rule
  if (options.practiceRuleId) {
    const practiceRule = getAllRules().find(r => r.id === options.practiceRuleId);
    if (practiceRule) return practiceRule;
  }
  
  const rng = createRng(options.seed);
  
  // Get rules appropriate for difficulty
  const maxDifficultyWeight = options.difficulty === 'easy' ? 2 :
                              options.difficulty === 'normal' ? 3 : 5;
  
  let availableRules = getRulesByDifficulty(maxDifficultyWeight);
  
  // Exclude specified rules
  if (options.excludeRuleIds?.length) {
    availableRules = availableRules.filter(
      rule => !options.excludeRuleIds!.includes(rule.id)
    );
  }
  
  // Fallback if all rules excluded
  if (availableRules.length === 0) {
    availableRules = getAllRules();
  }
  
  // Weight selection by inverse difficulty (easier rules more likely on lower difficulties)
  const weights = availableRules.map(rule => {
    if (options.difficulty === 'easy') {
      return 6 - rule.difficultyWeight;
    } else if (options.difficulty === 'hard') {
      return rule.difficultyWeight;
    }
    return 3; // Normal - equal weights
  });
  
  return weightedRandom(availableRules, weights, rng);
}

/**
 * Generates a sequence of rules for a run
 */
export function generateRuleSequence(
  count: number,
  options: RuleSelectionOptions & { noRepeat?: boolean }
): Rule[] {
  const rng = createRng(options.seed);
  const sequence: Rule[] = [];
  const recentRuleIds: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const excludeIds = options.noRepeat && recentRuleIds.length > 0
      ? [recentRuleIds[recentRuleIds.length - 1]] // Don't repeat last rule
      : [];
    
    const roundSeed = options.seed ? `${options.seed}-rule-${i}` : undefined;
    const rule = selectRule({
      ...options,
      seed: roundSeed,
      excludeRuleIds: [...(options.excludeRuleIds || []), ...excludeIds],
    });
    
    sequence.push(rule);
    recentRuleIds.push(rule.id);
    
    // Keep only last 3 for exclusion consideration
    if (recentRuleIds.length > 3) {
      recentRuleIds.shift();
    }
  }
  
  return sequence;
}

/**
 * Generates a daily challenge seed based on the date
 */
export function getDailyChallengeSeed(date?: Date): string {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `noggin-daily-${year}-${month}-${day}`;
}

/**
 * Gets today's date string for daily challenge tracking
 */
export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
