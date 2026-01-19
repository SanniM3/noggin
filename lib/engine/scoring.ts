import { Difficulty, RoundResult, ValidationResult } from '@/lib/types';

// Scoring constants
const BASE_SCORE = 10;
const MAX_SPEED_BONUS = 10;
const STREAK_MILESTONE = 5;
const STREAK_BONUS = 25;

// Time thresholds for speed bonus (in milliseconds)
const SPEED_THRESHOLDS: Record<Difficulty, { fast: number; slow: number }> = {
  easy: { fast: 5000, slow: 15000 },    // 5-15 seconds
  normal: { fast: 3000, slow: 10000 },  // 3-10 seconds
  hard: { fast: 2000, slow: 7000 },     // 2-7 seconds
};

/**
 * Calculates the speed bonus based on response time
 */
export function calculateSpeedBonus(
  responseTimeMs: number,
  difficulty: Difficulty
): number {
  const { fast, slow } = SPEED_THRESHOLDS[difficulty];
  
  if (responseTimeMs <= fast) {
    return MAX_SPEED_BONUS;
  }
  
  if (responseTimeMs >= slow) {
    return 0;
  }
  
  // Linear interpolation between fast and slow
  const range = slow - fast;
  const elapsed = responseTimeMs - fast;
  const factor = 1 - (elapsed / range);
  
  return Math.round(MAX_SPEED_BONUS * factor);
}

/**
 * Calculates streak bonus if a milestone is reached
 */
export function calculateStreakBonus(currentStreak: number): number {
  // Bonus at every STREAK_MILESTONE (5, 10, 15, etc.)
  if (currentStreak > 0 && currentStreak % STREAK_MILESTONE === 0) {
    return STREAK_BONUS;
  }
  return 0;
}

/**
 * Calculates the total score for a round
 */
export function calculateRoundScore(
  correct: boolean,
  responseTimeMs: number,
  currentStreak: number,
  difficulty: Difficulty
): { score: number; speedBonus: number; streakBonus: number } {
  if (!correct) {
    return { score: 0, speedBonus: 0, streakBonus: 0 };
  }
  
  const speedBonus = calculateSpeedBonus(responseTimeMs, difficulty);
  const newStreak = currentStreak + 1;
  const streakBonus = calculateStreakBonus(newStreak);
  
  const score = BASE_SCORE + speedBonus + streakBonus;
  
  return { score, speedBonus, streakBonus };
}

/**
 * Determines if the answer is correct based on validation result
 */
export function isAnswerCorrect(
  validationResult: ValidationResult,
  selfOverride: boolean
): boolean {
  if (validationResult.status === 'valid') {
    return true;
  }
  
  if (validationResult.status === 'warning' && selfOverride) {
    return true;
  }
  
  return false;
}

/**
 * Creates a complete round result
 */
export function createRoundResult(
  validationResult: ValidationResult,
  responseTimeMs: number,
  currentStreak: number,
  difficulty: Difficulty,
  selfOverride: boolean = false
): RoundResult {
  const correct = isAnswerCorrect(validationResult, selfOverride);
  const { score, speedBonus, streakBonus } = calculateRoundScore(
    correct,
    responseTimeMs,
    currentStreak,
    difficulty
  );
  
  return {
    correct,
    score,
    speedBonus,
    streakBonus,
    responseTime: responseTimeMs,
    selfOverride,
    validationResult,
  };
}

/**
 * Formats a score for display
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Formats time in milliseconds to a readable string
 */
export function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Formats a percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Calculates accuracy from correct and total counts
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return correct / total;
}

/**
 * Gets a performance rating based on accuracy
 */
export function getPerformanceRating(accuracy: number): string {
  if (accuracy >= 0.9) return 'Excellent';
  if (accuracy >= 0.75) return 'Great';
  if (accuracy >= 0.6) return 'Good';
  if (accuracy >= 0.4) return 'Fair';
  return 'Keep Practicing';
}

/**
 * Gets a performance color based on accuracy
 */
export function getPerformanceColor(accuracy: number): string {
  if (accuracy >= 0.9) return '#22c55e'; // Green
  if (accuracy >= 0.75) return '#84cc16'; // Lime
  if (accuracy >= 0.6) return '#eab308'; // Yellow
  if (accuracy >= 0.4) return '#f97316'; // Orange
  return '#ef4444'; // Red
}
