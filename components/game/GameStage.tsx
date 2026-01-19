'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';
import { getRule } from '@/lib/engine/rules';
import { LetterCard } from './LetterCard';
import { RuleCard } from './RuleCard';
import { InputDock } from './InputDock';
import { ScoreFeedback } from './ScoreFeedback';
import { GameHeader } from './GameHeader';

interface GameStageProps {
  onExit?: () => void;
  onSettings?: () => void;
}

export function GameStage({ onExit, onSettings }: GameStageProps) {
  const {
    run,
    currentRound,
    feedback,
    updateInput,
    submitAnswer,
    skipRound,
    nextRound,
    clearFeedback,
  } = useGameStore();

  const rule = currentRound ? getRule(currentRound.ruleId) : null;

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement) {
        if (e.key === ' ' && currentRound?.phase === 'active') {
          e.preventDefault();
          skipRound();
        }
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (feedback.visible && feedback.type !== 'warning') {
            nextRound();
          } else if (currentRound?.phase === 'active') {
            skipRound();
          }
          break;
        case 'Escape':
          if (onSettings) onSettings();
          break;
      }
    },
    [feedback, currentRound, nextRound, skipRound, onSettings]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle adjudication (for semi/manual validation)
  const handleOverride = (accept: boolean) => {
    clearFeedback();
    submitAnswer(accept);
  };

  if (!run || !currentRound) {
    return null;
  }

  const isRevealing = currentRound.phase === 'reveal';
  const isActive = currentRound.phase === 'active';
  const isResolving = currentRound.phase === 'resolve';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <GameHeader
        run={run}
        onSettingsClick={onSettings}
        onExitClick={onExit}
      />

      {/* Main stage */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-8">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          {/* Letter cards */}
          <motion.div
            className="flex justify-center items-center gap-4 md:gap-8"
            layout
          >
            <LetterCard
              letter={currentRound.letters[0]}
              index={0}
              isRevealed={!isRevealing}
              isCorrect={isResolving && currentRound.result?.correct}
              isIncorrect={isResolving && !currentRound.result?.correct}
            />
            <div className="text-4xl font-display text-noggin-text-muted opacity-30">
              +
            </div>
            <LetterCard
              letter={currentRound.letters[1]}
              index={1}
              isRevealed={!isRevealing}
              isCorrect={isResolving && currentRound.result?.correct}
              isIncorrect={isResolving && !currentRound.result?.correct}
            />
          </motion.div>

          {/* Rule card */}
          <AnimatePresence mode="wait">
            {rule && (
              <RuleCard
                key={rule.id}
                rule={rule}
                isRevealed={isActive || isResolving}
              />
            )}
          </AnimatePresence>

          {/* Input dock */}
          <AnimatePresence>
            {rule && isActive && (
              <InputDock
                rule={rule}
                letters={currentRound.letters}
                inputValues={currentRound.inputValues}
                onInputChange={updateInput}
                onSubmit={() => submitAnswer(false)}
                onSkip={skipRound}
                disabled={!isActive}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Feedback overlay */}
      <ScoreFeedback
        feedback={feedback}
        onNext={nextRound}
        onOverride={handleOverride}
        showAdjudication={feedback.type === 'warning'}
      />
    </div>
  );
}
