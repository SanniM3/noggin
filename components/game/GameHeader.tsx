'use client';

import { motion } from 'framer-motion';
import { Run } from '@/lib/types';
import { formatScore } from '@/lib/engine/scoring';
import { cn } from '@/lib/utils/cn';

interface GameHeaderProps {
  run: Run;
  onSettingsClick?: () => void;
  onExitClick?: () => void;
}

export function GameHeader({ run, onSettingsClick, onExitClick }: GameHeaderProps) {
  const correctCount = run.rounds.filter(r => r.result?.correct).length;
  const totalCount = run.rounds.length;

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

        {/* Center: Score and streak */}
        <div className="flex items-center gap-6">
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
    </header>
  );
}
