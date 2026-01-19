import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  PlayerStats,
  RuleStats,
  LetterPairStats,
  DailyChallenge,
  Run,
  Round,
} from '@/lib/types';
import { getTodayDateString } from '@/lib/engine/generator';

const DEFAULT_STATS: PlayerStats = {
  totalRounds: 0,
  totalCorrect: 0,
  totalScore: 0,
  avgResponseTime: 0,
  bestStreak: 0,
  longestSession: 0,
  currentDailyStreak: 0,
  bestDailyStreak: 0,
  lastPlayedDate: '',
  ruleStats: {},
  letterPairStats: [],
  dailyChallenges: [],
  streakDistribution: {},
};

interface StatsState extends PlayerStats {
  // Actions
  recordRun: (run: Run) => void;
  recordDailyChallenge: (challenge: DailyChallenge) => void;
  getRuleStats: (ruleId: string) => RuleStats | undefined;
  getLetterPairStats: (letters: [string, string]) => LetterPairStats | undefined;
  resetStats: () => void;
  exportStats: () => string;
  importStats: (json: string) => boolean;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATS,

      recordRun: (run: Run) => {
        const state = get();
        const today = getTodayDateString();
        
        // Calculate run stats
        const correctRounds = run.rounds.filter(r => r.result?.correct).length;
        const totalResponseTime = run.rounds.reduce(
          (sum, r) => sum + (r.result?.responseTime || 0),
          0
        );
        const runDuration = (run.endTime || Date.now()) - run.startTime;

        // Update rule stats
        const newRuleStats = { ...state.ruleStats };
        run.rounds.forEach((round) => {
          if (!round.result) return;
          
          const existing = newRuleStats[round.ruleId] || {
            ruleId: round.ruleId,
            totalAttempts: 0,
            correctCount: 0,
            avgResponseTime: 0,
            bestResponseTime: Infinity,
            selfOverrideCount: 0,
          };

          const newTotal = existing.totalAttempts + 1;
          const newCorrect = existing.correctCount + (round.result.correct ? 1 : 0);
          const newAvgTime =
            (existing.avgResponseTime * existing.totalAttempts + round.result.responseTime) /
            newTotal;

          newRuleStats[round.ruleId] = {
            ...existing,
            totalAttempts: newTotal,
            correctCount: newCorrect,
            avgResponseTime: newAvgTime,
            bestResponseTime: Math.min(existing.bestResponseTime, round.result.responseTime),
            selfOverrideCount:
              existing.selfOverrideCount + (round.result.selfOverride ? 1 : 0),
          };
        });

        // Update letter pair stats
        const letterPairMap = new Map(
          state.letterPairStats.map((lps) => [lps.letters.join(''), lps])
        );

        run.rounds.forEach((round) => {
          if (!round.result) return;
          
          const key = round.letters.join('');
          const existing = letterPairMap.get(key) || {
            letters: round.letters,
            totalAttempts: 0,
            correctCount: 0,
            avgResponseTime: 0,
          };

          const newTotal = existing.totalAttempts + 1;
          const newCorrect = existing.correctCount + (round.result.correct ? 1 : 0);
          const newAvgTime =
            (existing.avgResponseTime * existing.totalAttempts + round.result.responseTime) /
            newTotal;

          letterPairMap.set(key, {
            ...existing,
            totalAttempts: newTotal,
            correctCount: newCorrect,
            avgResponseTime: newAvgTime,
          });
        });

        // Update streak distribution
        const newStreakDist = { ...state.streakDistribution };
        if (run.bestStreak > 0) {
          newStreakDist[run.bestStreak] = (newStreakDist[run.bestStreak] || 0) + 1;
        }

        // Update daily streak
        let newDailyStreak = state.currentDailyStreak;
        let newBestDailyStreak = state.bestDailyStreak;
        
        if (state.lastPlayedDate !== today) {
          // Check if yesterday was played (for streak)
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
          
          if (state.lastPlayedDate === yesterdayStr) {
            newDailyStreak = state.currentDailyStreak + 1;
          } else {
            newDailyStreak = 1;
          }
          newBestDailyStreak = Math.max(newBestDailyStreak, newDailyStreak);
        }

        // Calculate new averages
        const newTotalRounds = state.totalRounds + run.rounds.length;
        const newTotalCorrect = state.totalCorrect + correctRounds;
        const newTotalScore = state.totalScore + run.score;
        const newAvgResponseTime =
          (state.avgResponseTime * state.totalRounds + totalResponseTime) / newTotalRounds;

        set({
          totalRounds: newTotalRounds,
          totalCorrect: newTotalCorrect,
          totalScore: newTotalScore,
          avgResponseTime: newAvgResponseTime,
          bestStreak: Math.max(state.bestStreak, run.bestStreak),
          longestSession: Math.max(state.longestSession, runDuration),
          currentDailyStreak: newDailyStreak,
          bestDailyStreak: newBestDailyStreak,
          lastPlayedDate: today,
          ruleStats: newRuleStats,
          letterPairStats: Array.from(letterPairMap.values()),
          streakDistribution: newStreakDist,
        });
      },

      recordDailyChallenge: (challenge: DailyChallenge) => {
        const state = get();
        
        // Check if already completed today
        const existing = state.dailyChallenges.find((dc) => dc.date === challenge.date);
        if (existing) {
          // Update if better score
          if (challenge.score > existing.score) {
            set({
              dailyChallenges: state.dailyChallenges.map((dc) =>
                dc.date === challenge.date ? challenge : dc
              ),
            });
          }
          return;
        }

        set({
          dailyChallenges: [...state.dailyChallenges, challenge].slice(-30), // Keep last 30 days
        });
      },

      getRuleStats: (ruleId: string) => {
        return get().ruleStats[ruleId];
      },

      getLetterPairStats: (letters: [string, string]) => {
        const key = letters.join('');
        return get().letterPairStats.find((lps) => lps.letters.join('') === key);
      },

      resetStats: () => {
        set(DEFAULT_STATS);
      },

      exportStats: () => {
        const state = get();
        const exportData: PlayerStats = {
          totalRounds: state.totalRounds,
          totalCorrect: state.totalCorrect,
          totalScore: state.totalScore,
          avgResponseTime: state.avgResponseTime,
          bestStreak: state.bestStreak,
          longestSession: state.longestSession,
          currentDailyStreak: state.currentDailyStreak,
          bestDailyStreak: state.bestDailyStreak,
          lastPlayedDate: state.lastPlayedDate,
          ruleStats: state.ruleStats,
          letterPairStats: state.letterPairStats,
          dailyChallenges: state.dailyChallenges,
          streakDistribution: state.streakDistribution,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importStats: (json: string) => {
        try {
          const data = JSON.parse(json) as PlayerStats;
          set(data);
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'noggin-stats',
    }
  )
);

// Selectors
export const selectTotalRounds = (state: StatsState) => state.totalRounds;
export const selectAccuracy = (state: StatsState) =>
  state.totalRounds > 0 ? state.totalCorrect / state.totalRounds : 0;
export const selectBestStreak = (state: StatsState) => state.bestStreak;
export const selectDailyStreak = (state: StatsState) => state.currentDailyStreak;
