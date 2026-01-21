'use client';

import { motion } from 'framer-motion';
import { Run } from '@/lib/types';
import { formatScore } from '@/lib/engine/scoring';
import { cn } from '@/lib/utils/cn';

interface GameHeaderProps {
  run: Run;
  timeRemaining?: number; // in milliseconds, for sprint mode
  onSettingsClick?: () => void;
  onExitClick?: () => void;
}

export function GameHeader({ run, timeRemaining, onSettingsClick, onExitClick }: GameHeaderProps) {
  const correctCount = run.rounds.filter(r => r.result?.correct).length;
  const totalCount = run.rounds.length;

  // Format time remaining for display
  const formatTimeRemaining = (ms: number) => {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  // Determine if time is critical (less than 10 seconds)
  const isCritical = timeRemaining !== undefined && timeRemaining <= 10000 && timeRemaining > 0;
  const isWarning = timeRemaining !== undefined && timeRemaining <= 30000 && timeRemaining > 10000;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-noggin-bg/80 backdrop-blur-lg border-b border-noggin-border">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Exit button */}
        <button
          onClick={onExitClick}
          className="p-2 rounded-lg hover:bg-noggin-surface transition-colors text-noggin-text-muted hover:text-noggin-text"
          aria-label="Exit game"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Center: Score, streak, and timer */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Timer for Sprint mode */}
          {run.mode === 'sprint' && timeRemaining !== undefined && (
            <motion.div 
              className="text-center"
              animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
            >
              <motion.div
                className={cn(
                  'text-2xl md:text-3xl font-display font-bold tabular-nums',
                  isCritical && 'text-feedback-incorrect',
                  isWarning && !isCritical && 'text-feedback-warning',
                  !isWarning && !isCritical && 'text-noggin-accent'
                )}
                key={Math.floor(timeRemaining / 1000)}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                {formatTimeRemaining(timeRemaining)}
              </motion.div>
              <div className="text-xs text-noggin-text-muted uppercase tracking-wider">
                Time
              </div>
            </motion.div>
          )}

          {/* Score */}
          <div className="text-center">
            <motion.div
              className="text-2xl font-display font-bold text-noggin-text"
              key={run.score}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              {formatScore(run.score)}
            </motion.div>
            <div className="text-xs text-noggin-text-muted uppercase tracking-wider">
              Score
            </div>
          </div>

          {/* Streak */}
          <div className="text-center">
            <motion.div
              className={cn(
                'text-2xl font-display font-bold',
                run.streak >= 5 ? 'text-feedback-correct' : 'text-noggin-text'
              )}
              key={run.streak}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              {run.streak > 0 && '🔥'} {run.streak}
            </motion.div>
            <div className="text-xs text-noggin-text-muted uppercase tracking-wider">
              Streak
            </div>
          </div>

          {/* Progress (for daily challenge) */}
          {run.mode === 'daily' && (
            <div className="text-center">
              <div className="text-2xl font-display font-bold text-noggin-text">
                {correctCount}/{totalCount}
              </div>
              <div className="text-xs text-noggin-text-muted uppercase tracking-wider">
                Correct
              </div>
            </div>
          )}
        </div>

        {/* Right: Settings */}
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-lg hover:bg-noggin-surface transition-colors text-noggin-text-muted hover:text-noggin-text"
          aria-label="Settings"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      {/* Mode indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
        <div className="px-3 py-1 rounded-full bg-noggin-primary/20 border border-noggin-primary/40 text-xs font-medium text-noggin-primary uppercase tracking-wider">
          {run.mode === 'quick' && 'Quick Play'}
          {run.mode === 'sprint' && 'Sprint'}
          {run.mode === 'daily' && 'Daily Challenge'}
          {run.mode === 'practice' && 'Practice'}
        </div>
      </div>

      {/* Timer progress bar for Sprint mode */}
      {run.mode === 'sprint' && run.timerDuration && timeRemaining !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-noggin-border">
          <motion.div
            className={cn(
              'h-full transition-colors duration-300',
              isCritical ? 'bg-feedback-incorrect' :
              isWarning ? 'bg-feedback-warning' :
              'bg-noggin-accent'
            )}
            style={{
              width: `${(timeRemaining / run.timerDuration) * 100}%`,
            }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}
    </header>
  );
}
