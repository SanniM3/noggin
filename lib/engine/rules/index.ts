import { Rule } from '@/lib/types';
import { bookendRule } from './bookend';
import { middleLettersRule } from './middleLetters';
import { initialsRule } from './initials';
import { neitherLetterRule } from './neitherLetter';
import { wordAssociationRule } from './wordAssociation';
import { wordDissociationRule } from './wordDissociation';
import { describeRule } from './describe';

// Rule registry - all available rules
export const rules: Record<string, Rule> = {
  bookend: bookendRule,
  middleLetters: middleLettersRule,
  initials: initialsRule,
  neitherLetter: neitherLetterRule,
  wordAssociation: wordAssociationRule,
  wordDissociation: wordDissociationRule,
  describe: describeRule,
};

// Get rule by ID
export function getRule(id: string): Rule | undefined {
  return rules[id];
}

// Get all rules as array
export function getAllRules(): Rule[] {
  return Object.values(rules);
}

// Get rules by difficulty weight (for progressive difficulty)
export function getRulesByDifficulty(maxWeight: number): Rule[] {
  return getAllRules().filter(rule => rule.difficultyWeight <= maxWeight);
}

// Get rule IDs
export function getRuleIds(): string[] {
  return Object.keys(rules);
}

// Classic rule pack (all 7 original rules)
export const classicRulePack = {
  id: 'classic',
  name: 'Classic',
  description: 'The original 7 Noggin rules',
  ruleIds: getRuleIds(),
};

// Rule packs for different play styles
export const rulePacks = {
  classic: classicRulePack,
  // Future packs can be added here
};
