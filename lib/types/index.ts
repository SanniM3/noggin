// ===== Rule System Types =====

export type ValidationType = 'auto' | 'semi' | 'manual';

export type InputType = 'single' | 'double' | 'multi';

export interface InputSchema {
  type: InputType;
  fields: InputField[];
}

export interface InputField {
  id: string;
  label: string;
  placeholder: string;
  letterConstraint?: 'first' | 'second' | 'either' | 'none';
  minLength?: number;
  maxLength?: number;
}

export interface ValidatorConfig {
  type: ValidationType;
  autoCheck?: (answer: AnswerInput, letters: [string, string]) => ValidationResult;
  hints?: string[];
}

export interface ValidationResult {
  status: 'valid' | 'warning' | 'invalid';
  message?: string;
  details?: string[];
}

export interface RenderStyle {
  color: string;
  icon: string;
  bgGradient?: string;
}

export interface Rule {
  id: string;
  name: string;
  shortName: string;
  description: string;
  instructions: string;
  difficultyWeight: number;
  renderStyle: RenderStyle;
  inputSchema: InputSchema;
  validator: ValidatorConfig;
  examples: RuleExample[];
  hints?: string[];
}

export interface RuleExample {
  letters: [string, string];
  answer: string | string[];
  explanation?: string;
}

// ===== Game State Types =====

export type GameMode = 'quick' | 'sprint' | 'daily' | 'practice';

export type RoundPhase = 'idle' | 'reveal' | 'active' | 'resolve' | 'transition';

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface AnswerInput {
  [fieldId: string]: string;
}

export interface RoundResult {
  correct: boolean;
  score: number;
  speedBonus: number;
  streakBonus: number;
  responseTime: number;
  selfOverride: boolean;
  validationResult: ValidationResult;
}

export interface Round {
  index: number;
  letters: [string, string];
  ruleId: string;
  phase: RoundPhase;
  startTime: number;
  inputValues: AnswerInput;
  result?: RoundResult;
}

export interface Run {
  id: string;
  mode: GameMode;
  seed?: string;
  difficulty: Difficulty;
  startTime: number;
  endTime?: number;
  score: number;
  streak: number;
  bestStreak: number;
  roundIndex: number;
  rounds: Round[];
  selectedRuleId?: string; // For practice mode
  timerDuration?: number; // For sprint mode (legacy)
  duration?: number; // Duration in seconds for timed modes
  pausedTime: number; // Total time paused (e.g., during AI validation)
}

// ===== Event Log Types =====

export type GameEventType =
  | 'RUN_STARTED'
  | 'ROUND_DEALT'
  | 'RULE_REVEALED'
  | 'ANSWER_SUBMITTED'
  | 'ANSWER_VALIDATED'
  | 'ROUND_RESOLVED'
  | 'STREAK_MILESTONE'
  | 'RUN_FINISHED';

export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  payload: Record<string, unknown>;
}

// ===== Settings Types =====

export interface Settings {
  // Audio
  soundEnabled: boolean;
  soundVolume: number;
  hapticsEnabled: boolean;
  
  // Visual
  theme: 'dark' | 'light' | 'high-contrast';
  reducedMotion: boolean;
  
  // Gameplay
  timerStyle: 'up' | 'down';
  difficulty: Difficulty;
  autoCapitalize: boolean;
  allowHyphens: boolean;
  allowSpaces: boolean;
  
  // Rules
  selectedRulePack: string;
  noRepeatRules: boolean;
  noRepeatLetters: boolean;
  
  // Accessibility
  dyslexiaFont: boolean;
}

// ===== Stats Types =====

export interface RuleStats {
  ruleId: string;
  totalAttempts: number;
  correctCount: number;
  avgResponseTime: number;
  bestResponseTime: number;
  selfOverrideCount: number;
}

export interface LetterPairStats {
  letters: [string, string];
  totalAttempts: number;
  correctCount: number;
  avgResponseTime: number;
}

export interface DailyChallenge {
  date: string;
  seed: string;
  score: number;
  totalRounds: number;
  correctRounds: number;
  bestStreak: number;
  completedAt: number;
}

export interface PlayerStats {
  // Lifetime stats
  totalRounds: number;
  totalCorrect: number;
  totalScore: number;
  avgResponseTime: number;
  bestStreak: number;
  longestSession: number;
  
  // Streaks
  currentDailyStreak: number;
  bestDailyStreak: number;
  lastPlayedDate: string;
  
  // Per-rule stats
  ruleStats: Record<string, RuleStats>;
  
  // Letter pair performance (for heatmap)
  letterPairStats: LetterPairStats[];
  
  // Daily challenges
  dailyChallenges: DailyChallenge[];
  
  // Streak distribution
  streakDistribution: Record<number, number>;
}

// ===== UI State Types =====

export interface FeedbackState {
  visible: boolean;
  type: 'correct' | 'warning' | 'incorrect';
  score?: number;
  message?: string;
  details?: string[]; // Additional context for the feedback
}

export interface ModalState {
  isOpen: boolean;
  type: 'settings' | 'stats' | 'help' | 'share' | 'onboarding' | null;
}
