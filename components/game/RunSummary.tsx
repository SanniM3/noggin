'use client';

import { motion } from 'framer-motion';
import { Run } from '@/lib/types';
import { getRule } from '@/lib/engine/rules';
import {
  formatScore,
  formatTime,
  formatPercentage,
  calculateAccuracy,
  getPerformanceRating,
  getPerformanceColor,
} from '@/lib/engine/scoring';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface RunSummaryProps {
  run: Run;
  onPlayAgain: () => void;
  onExit: () => void;
  onShare?: () => void;
}

export function RunSummary({ run, onPlayAgain, onExit, onShare }: RunSummaryProps) {
  const totalRounds = run.rounds.length;
  const correctRounds = run.rounds.filter((r) => r.result?.correct).length;
  const accuracy = calculateAccuracy(correctRounds, totalRounds);
  const avgResponseTime =
    run.rounds.reduce((sum, r) => sum + (r.result?.responseTime || 0), 0) / totalRounds;
  const rating = getPerformanceRating(accuracy);
  const ratingColor = getPerformanceColor(accuracy);

  // Group results by rule
  const ruleResults = run.rounds.reduce(
    (acc, round) => {
      const ruleId = round.ruleId;
      if (!acc[ruleId]) {
        acc[ruleId] = { correct: 0, total: 0 };
      }
      acc[ruleId].total++;
      if (round.result?.correct) {
        acc[ruleId].correct++;
      }
      return acc;
    },
    {} as Record<string, { correct: number; total: number }>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-lg bg-noggin-surface rounded-3xl p-8 border border-noggin-border"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          >
            {accuracy >= 0.8 ? '🏆' : accuracy >= 0.5 ? '👏' : '💪'}
          </motion.div>
          <h1 className="text-3xl font-display font-bold mb-2">Game Over!</h1>
          <p
            className="text-xl font-semibold"
            style={{ color: ratingColor }}
          >
            {rating}
          </p>
        </div>

        {/* Score card */}
        <motion.div
          className="grid grid-cols-2 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-noggin-bg rounded-xl p-4 text-center">
            <div className="text-3xl font-display font-bold text-noggin-primary">
              {formatScore(run.score)}
            </div>
            <div className="text-sm text-noggin-text-muted">Total Score</div>
          </div>
          <div className="bg-noggin-bg rounded-xl p-4 text-center">
            <div className="text-3xl font-display font-bold text-feedback-correct">
              {correctRounds}/{totalRounds}
            </div>
            <div className="text-sm text-noggin-text-muted">Correct</div>
          </div>
          <div className="bg-noggin-bg rounded-xl p-4 text-center">
            <div className="text-3xl font-display font-bold text-noggin-accent">
              {run.bestStreak}
            </div>
            <div className="text-sm text-noggin-text-muted">Best Streak</div>
          </div>
          <div className="bg-noggin-bg rounded-xl p-4 text-center">
            <div className="text-3xl font-display font-bold text-noggin-text">
              {formatTime(avgResponseTime)}
            </div>
            <div className="text-sm text-noggin-text-muted">Avg. Time</div>
          </div>
        </motion.div>

        {/* Accuracy bar */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between text-sm mb-2">
            <span className="text-noggin-text-muted">Accuracy</span>
            <span className="font-semibold" style={{ color: ratingColor }}>
              {formatPercentage(accuracy)}
            </span>
          </div>
          <div className="h-3 bg-noggin-bg rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: ratingColor }}
              initial={{ width: 0 }}
              animate={{ width: `${accuracy * 100}%` }}
              transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Per-rule breakdown */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-sm font-semibold text-noggin-text-muted mb-3">
            Performance by Rule
          </h3>
          <div className="space-y-2">
            {Object.entries(ruleResults).map(([ruleId, stats]) => {
              const rule = getRule(ruleId);
              if (!rule) return null;
              const ruleAccuracy = stats.correct / stats.total;
              return (
                <div
                  key={ruleId}
                  className="flex items-center gap-3 text-sm"
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${rule.renderStyle.color}20` }}
                  >
                    {rule.renderStyle.icon}
                  </span>
                  <span className="flex-1 font-medium">{rule.shortName}</span>
                  <span className="text-noggin-text-muted">
                    {stats.correct}/{stats.total}
                  </span>
                  <div className="w-16 h-2 bg-noggin-bg rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${ruleAccuracy * 100}%`,
                        backgroundColor: getPerformanceColor(ruleAccuracy),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button variant="secondary" size="lg" onClick={onExit} className="flex-1">
            Exit
          </Button>
          {onShare && run.mode === 'daily' && (
            <Button variant="ghost" size="lg" onClick={onShare}>
              Share
            </Button>
          )}
          <Button variant="primary" size="lg" onClick={onPlayAgain} className="flex-1">
            Play Again
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
