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
  ValidationResult,
} from '@/lib/types';
import { generateLetterPair, selectRule, getDailyChallengeSeed } from '@/lib/engine/generator';
import { getRule } from '@/lib/engine/rules';
import { createRoundResult } from '@/lib/engine/scoring';
import { validateWithAI } from '@/lib/engine/aiValidator';

interface GameState {
  // Current run state
  run: Run | null;
  currentRound: Round | null;
  
  // UI state
  feedback: FeedbackState;
  isLoading: boolean;
  isValidating: boolean; // AI validation in progress
  validationStartTime: number | null; // When validation started (for pausing timer)
  
  // Event log
  eventLog: GameEvent[];
  
  // Settings
  settings: {
    useAIValidation: boolean;
  };
  
  // Actions
  startRun: (mode: GameMode, options?: StartRunOptions) => void;
  dealRound: () => void;
  revealRule: () => void;
  updateInput: (fieldId: string, value: string) => void;
  submitAnswer: (selfOverride?: boolean) => Promise<void>;
  skipRound: () => void;
  nextRound: () => void;
  endRun: () => void;
  resetGame: () => void;
  clearFeedback: () => void;
  setUseAIValidation: (enabled: boolean) => void;
  
  // Computed
  getCurrentRule: () => ReturnType<typeof getRule>;
  getEffectiveElapsedTime: () => number; // Elapsed time minus paused time
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
    isValidating: false,
    validationStartTime: null,
    eventLog: [],
    settings: {
      useAIValidation: true, // AI validation enabled by default
    },
    
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
        duration: options.timerDuration, // Used by Timer component
        pausedTime: 0, // Track time paused during validation
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
    
    // Submit answer (async for AI validation)
    submitAnswer: async (selfOverride = false) => {
      const { run, currentRound, eventLog, settings } = get();
      if (!run || !currentRound) return;
      
      // Allow submission in active phase, or in resolve phase with selfOverride (adjudication)
      const isAdjudication = currentRound.phase === 'resolve' && selfOverride;
      if (currentRound.phase !== 'active' && !isAdjudication) return;
      
      const rule = getRule(currentRound.ruleId);
      if (!rule) return;
      
      // Calculate response time
      const responseTime = Date.now() - currentRound.startTime;
      
      // Log submission (only if not already in adjudication)
      const submissionEvent = !isAdjudication 
        ? createEvent('ANSWER_SUBMITTED', {
            inputValues: currentRound.inputValues,
            responseTime,
          })
        : null;
      
      // Step 1: Run local constraint check first (instant)
      let validationResult: ValidationResult;
      
      if (selfOverride) {
        // User is overriding during adjudication - accept as correct
        validationResult = { status: 'valid', message: 'Self-awarded' };
      } else if (rule.validator.autoCheck) {
        // Run local check first
        validationResult = rule.validator.autoCheck(currentRound.inputValues, currentRound.letters);
      } else {
        // No auto-check available
        validationResult = { status: 'warning', message: 'Checking...' };
      }
      
      // If local check fails immediately (invalid), no need for AI
      if (validationResult.status === 'invalid') {
        const validationEvent = createEvent('ANSWER_VALIDATED', {
          validationResult,
          selfOverride: false,
        });
        
        const roundResult = createRoundResult(
          validationResult,
          responseTime,
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
            message: validationResult.message || 'Not quite!',
          },
          eventLog: [
            ...eventLog,
            ...(submissionEvent ? [submissionEvent] : []),
            validationEvent,
            createEvent('ROUND_RESOLVED', { result: roundResult }),
          ],
        });
        return;
      }
      
      // Step 2: If AI validation is enabled and not self-override, call AI
      if (settings.useAIValidation && !selfOverride) {
        // Record when validation started (to pause timer)
        const validationStart = Date.now();
        
        // Show validating state
        set({ 
          isValidating: true,
          validationStartTime: validationStart,
          feedback: {
            visible: true,
            type: 'warning',
            message: '🤖 Checking answer...',
          },
        });
        
        try {
          // Call AI validator
          const aiResult = await validateWithAI(
            currentRound.ruleId,
            currentRound.letters,
            currentRound.inputValues
          );
          
          // Get fresh state after async call
          const freshState = get();
          if (!freshState.run || !freshState.currentRound) {
            set({ isValidating: false, validationStartTime: null });
            return;
          }
          
          // Use AI result
          validationResult = aiResult;
          
        } catch (error) {
          console.error('AI validation error:', error);
          // Fail open - fall back to local result
          validationResult = { 
            status: 'warning', 
            message: 'Could not verify - please self-judge' 
          };
        }
        
        // Calculate how long validation took and add to paused time
        const validationDuration = Date.now() - validationStart;
        const freshRun = get().run;
        if (freshRun) {
          set({ 
            isValidating: false, 
            validationStartTime: null,
            run: {
              ...freshRun,
              pausedTime: freshRun.pausedTime + validationDuration,
            },
          });
        } else {
          set({ isValidating: false, validationStartTime: null });
        }
      }
      
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
            details: validationResult.details,
          },
          eventLog: [...eventLog, ...(submissionEvent ? [submissionEvent] : []), validationEvent],
        });
        return;
      }
      
      // Calculate result
      const isCorrect = validationResult.status === 'valid' || selfOverride;
      const finalResult: ValidationResult = isCorrect 
        ? { status: 'valid', message: validationResult.message || 'Correct!' }
        : validationResult;
      
      const roundResult = createRoundResult(
        finalResult,
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
            ? (roundResult.streakBonus > 0 ? `🔥 ${newStreak} streak!` : validationResult.message || 'Correct!')
            : (validationResult.message || 'Not quite!'),
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
        isValidating: false,
        validationStartTime: null,
        eventLog: [],
      });
    },
    
    // Clear feedback
    clearFeedback: () => {
      set({ feedback: { visible: false, type: 'correct' } });
    },
    
    // Toggle AI validation
    setUseAIValidation: (enabled: boolean) => {
      set({
        settings: {
          ...get().settings,
          useAIValidation: enabled,
        },
      });
    },
    
    // Get current rule
    getCurrentRule: () => {
      const { currentRound } = get();
      if (!currentRound) return undefined;
      return getRule(currentRound.ruleId);
    },
    
    // Get effective elapsed time (excluding paused time during validation)
    getEffectiveElapsedTime: () => {
      const { run, isValidating, validationStartTime } = get();
      if (!run) return 0;
      
      const now = Date.now();
      let elapsed = now - run.startTime;
      
      // Subtract already accumulated paused time
      elapsed -= run.pausedTime;
      
      // If currently validating, also subtract the ongoing validation time
      if (isValidating && validationStartTime) {
        elapsed -= (now - validationStartTime);
      }
      
      return Math.max(0, elapsed);
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
