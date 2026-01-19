import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  GameMode,
  RoundPhase,
  Difficulty,
  AnswerInput,
  Round,
  Run,
  GameEvent,
  GameEventType,
  FeedbackState,
} from '@/lib/types';
import { generateLetterPair, selectRule, getDailyChallengeSeed } from '@/lib/engine/generator';
import { getRule } from '@/lib/engine/rules';
import { createRoundResult } from '@/lib/engine/scoring';

interface GameState {
  // Current run state
  run: Run | null;
  currentRound: Round | null;
  
  // UI state
  feedback: FeedbackState;
  isLoading: boolean;
  
  // Event log
  eventLog: GameEvent[];
  
  // Actions
  startRun: (mode: GameMode, options?: StartRunOptions) => void;
  dealRound: () => void;
  revealRule: () => void;
  updateInput: (fieldId: string, value: string) => void;
  submitAnswer: (selfOverride?: boolean) => void;
  skipRound: () => void;
  nextRound: () => void;
  endRun: () => void;
  resetGame: () => void;
  clearFeedback: () => void;
  
  // Computed
  getCurrentRule: () => ReturnType<typeof getRule>;
}

interface StartRunOptions {
  difficulty?: Difficulty;
  timerDuration?: number;
  selectedRuleId?: string;
  seed?: string;
}

// Generate unique run ID
function generateRunId(): string {
  return `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create an event
function createEvent(type: GameEventType, payload: Record<string, unknown>): GameEvent {
  return {
    type,
    timestamp: Date.now(),
    payload,
  };
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    run: null,
    currentRound: null,
    feedback: { visible: false, type: 'correct' },
    isLoading: false,
    eventLog: [],
    
    // Start a new run
    startRun: (mode, options = {}) => {
      const difficulty = options.difficulty || 'normal';
      const seed = mode === 'daily' 
        ? getDailyChallengeSeed() 
        : options.seed;
      
      const run: Run = {
        id: generateRunId(),
        mode,
        seed,
        difficulty,
        startTime: Date.now(),
        score: 0,
        streak: 0,
        bestStreak: 0,
        roundIndex: 0,
        rounds: [],
        selectedRuleId: options.selectedRuleId,
        timerDuration: options.timerDuration,
      };
      
      set({
        run,
        currentRound: null,
        eventLog: [createEvent('RUN_STARTED', { mode, difficulty, seed })],
        feedback: { visible: false, type: 'correct' },
      });
      
      // Immediately deal the first round
      get().dealRound();
    },
    
    // Deal a new round
    dealRound: () => {
      const { run, eventLog } = get();
      if (!run) return;
      
      const roundSeed = run.seed 
        ? `${run.seed}-${run.roundIndex}` 
        : undefined;
      
      // Generate letters
      const letters = generateLetterPair({
        seed: roundSeed,
        difficulty: run.difficulty,
      });
      
      // Select rule
      const lastRuleId = run.rounds.length > 0 
        ? run.rounds[run.rounds.length - 1].ruleId 
        : undefined;
      
      const rule = selectRule({
        seed: roundSeed,
        difficulty: run.difficulty,
        excludeRuleIds: lastRuleId ? [lastRuleId] : [],
        practiceRuleId: run.selectedRuleId,
      });
      
      const round: Round = {
        index: run.roundIndex,
        letters,
        ruleId: rule.id,
        phase: 'reveal',
        startTime: Date.now(),
        inputValues: {},
      };
      
      set({
        currentRound: round,
        eventLog: [
          ...eventLog,
          createEvent('ROUND_DEALT', { 
            roundIndex: round.index, 
            letters, 
            ruleId: rule.id 
          }),
        ],
      });
      
      // Auto-reveal rule after delay
      setTimeout(() => {
        get().revealRule();
      }, 300);
    },
    
    // Reveal the rule (start active phase)
    revealRule: () => {
      const { currentRound, eventLog } = get();
      if (!currentRound || currentRound.phase !== 'reveal') return;
      
      set({
        currentRound: {
          ...currentRound,
          phase: 'active',
          startTime: Date.now(), // Reset timer when rule is revealed
        },
        eventLog: [
          ...eventLog,
          createEvent('RULE_REVEALED', { ruleId: currentRound.ruleId }),
        ],
      });
    },
    
    // Update input value
    updateInput: (fieldId, value) => {
      const { currentRound } = get();
      if (!currentRound || currentRound.phase !== 'active') return;
      
      set({
        currentRound: {
          ...currentRound,
          inputValues: {
            ...currentRound.inputValues,
            [fieldId]: value,
          },
        },
      });
    },
    
    // Submit answer
    submitAnswer: (selfOverride = false) => {
      const { run, currentRound, eventLog } = get();
      if (!run || !currentRound) return;
      
      // Allow submission in active phase, or in resolve phase with selfOverride (adjudication)
      const isAdjudication = currentRound.phase === 'resolve' && selfOverride;
      if (currentRound.phase !== 'active' && !isAdjudication) return;
      
      const rule = getRule(currentRound.ruleId);
      if (!rule) return;
      
      // Calculate response time
      const responseTime = Date.now() - currentRound.startTime;
      
      // Validate answer
      const validationResult = rule.validator.autoCheck
        ? rule.validator.autoCheck(currentRound.inputValues, currentRound.letters)
        : { status: 'warning' as const, message: 'Self-judge required' };
      
      // Log submission (only if not already in adjudication)
      const submissionEvent = !isAdjudication 
        ? createEvent('ANSWER_SUBMITTED', {
            inputValues: currentRound.inputValues,
            responseTime,
          })
        : null;
      
      // Log validation
      const validationEvent = createEvent('ANSWER_VALIDATED', {
        validationResult,
        selfOverride,
      });
      
      // For semi/manual validation with warning, show adjudication UI
      if (validationResult.status === 'warning' && !selfOverride) {
        set({
          currentRound: {
            ...currentRound,
            phase: 'resolve',
          },
          feedback: {
            visible: true,
            type: 'warning',
            message: validationResult.message,
          },
          eventLog: [...eventLog, ...(submissionEvent ? [submissionEvent] : []), validationEvent],
        });
        return;
      }
      
      // Calculate result
      const roundResult = createRoundResult(
        validationResult,
        responseTime,
        run.streak,
        run.difficulty,
        selfOverride
      );
      
      // Update round with result
      const completedRound: Round = {
        ...currentRound,
        phase: 'resolve',
        result: roundResult,
      };
      
      // Update run
      const newStreak = roundResult.correct ? run.streak + 1 : 0;
      const newBestStreak = Math.max(run.bestStreak, newStreak);
      
      // Check for streak milestone
      const streakEvents: GameEvent[] = [];
      if (roundResult.streakBonus > 0) {
        streakEvents.push(createEvent('STREAK_MILESTONE', { streak: newStreak }));
      }
      
      set({
        run: {
          ...run,
          score: run.score + roundResult.score,
          streak: newStreak,
          bestStreak: newBestStreak,
          rounds: [...run.rounds, completedRound],
        },
        currentRound: completedRound,
        feedback: {
          visible: true,
          type: roundResult.correct ? 'correct' : 'incorrect',
          score: roundResult.correct ? roundResult.score : undefined,
          message: roundResult.correct 
            ? (roundResult.streakBonus > 0 ? `🔥 ${newStreak} streak!` : 'Correct!')
            : 'Not quite!',
        },
        eventLog: [
          ...eventLog,
          ...(submissionEvent ? [submissionEvent] : []),
          validationEvent,
          createEvent('ROUND_RESOLVED', { result: roundResult }),
          ...streakEvents,
        ],
      });
    },
    
    // Skip round
    skipRound: () => {
      const { run, currentRound, eventLog } = get();
      if (!run || !currentRound || currentRound.phase !== 'active') return;
      
      const roundResult = createRoundResult(
        { status: 'invalid', message: 'Skipped' },
        Date.now() - currentRound.startTime,
        run.streak,
        run.difficulty,
        false
      );
      
      const completedRound: Round = {
        ...currentRound,
        phase: 'resolve',
        result: roundResult,
      };
      
      set({
        run: {
          ...run,
          streak: 0,
          rounds: [...run.rounds, completedRound],
        },
        currentRound: completedRound,
        feedback: {
          visible: true,
          type: 'incorrect',
          message: 'Skipped',
        },
        eventLog: [
          ...eventLog,
          createEvent('ROUND_RESOLVED', { result: roundResult, skipped: true }),
        ],
      });
    },
    
    // Move to next round
    nextRound: () => {
      const { run, currentRound } = get();
      if (!run || !currentRound) return;
      
      // Check if run should end (e.g., daily challenge round limit)
      const maxRounds = run.mode === 'daily' ? 20 : undefined;
      if (maxRounds && run.rounds.length >= maxRounds) {
        get().endRun();
        return;
      }
      
      set({
        run: {
          ...run,
          roundIndex: run.roundIndex + 1,
        },
        currentRound: {
          ...currentRound,
          phase: 'transition',
        },
        feedback: { visible: false, type: 'correct' },
      });
      
      // Deal next round after brief transition
      setTimeout(() => {
        get().dealRound();
      }, 200);
    },
    
    // End the run
    endRun: () => {
      const { run, eventLog } = get();
      if (!run) return;
      
      const endedRun: Run = {
        ...run,
        endTime: Date.now(),
      };
      
      set({
        run: endedRun,
        currentRound: null,
        eventLog: [
          ...eventLog,
          createEvent('RUN_FINISHED', {
            score: run.score,
            rounds: run.rounds.length,
            bestStreak: run.bestStreak,
            duration: Date.now() - run.startTime,
          }),
        ],
      });
    },
    
    // Reset game
    resetGame: () => {
      set({
        run: null,
        currentRound: null,
        feedback: { visible: false, type: 'correct' },
        isLoading: false,
        eventLog: [],
      });
    },
    
    // Clear feedback
    clearFeedback: () => {
      set({ feedback: { visible: false, type: 'correct' } });
    },
    
    // Get current rule
    getCurrentRule: () => {
      const { currentRound } = get();
      if (!currentRound) return undefined;
      return getRule(currentRound.ruleId);
    },
  }))
);

// Selectors
export const selectRun = (state: GameState) => state.run;
export const selectCurrentRound = (state: GameState) => state.currentRound;
export const selectFeedback = (state: GameState) => state.feedback;
export const selectEventLog = (state: GameState) => state.eventLog;
export const selectIsPlaying = (state: GameState) => 
  state.run !== null && state.currentRound !== null;
export const selectIsRunComplete = (state: GameState) => 
  state.run !== null && state.run.endTime !== undefined;
