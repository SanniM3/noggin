'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getAllRules } from '@/lib/engine/rules';
import { GameMode, Difficulty } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

const gameModes: { id: GameMode; name: string; description: string; icon: string }[] = [
  {
    id: 'quick',
    name: 'Quick Play',
    description: 'Endless rounds, no pressure. Perfect for learning.',
    icon: '⚡',
  },
  {
    id: 'sprint',
    name: 'Timed Sprint',
    description: 'Race against the clock. How many can you get?',
    icon: '⏱️',
  },
  {
    id: 'daily',
    name: 'Daily Challenge',
    description: 'Same puzzle for everyone. Compare your score!',
    icon: '📅',
  },
  {
    id: 'practice',
    name: 'Practice',
    description: 'Focus on a specific rule type.',
    icon: '🎯',
  },
];

const difficulties: { id: Difficulty; name: string; description: string }[] = [
  { id: 'easy', name: 'Easy', description: 'Common letters, simpler rules' },
  { id: 'normal', name: 'Normal', description: 'Balanced challenge' },
  { id: 'hard', name: 'Hard', description: 'Rare letters, all rules' },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [sprintDuration, setSprintDuration] = useState(60);

  const rules = getAllRules();

  const handleStartGame = () => {
    if (!selectedMode) return;

    const params = new URLSearchParams();
    params.set('mode', selectedMode);
    params.set('difficulty', selectedDifficulty);

    if (selectedMode === 'practice' && selectedRule) {
      params.set('rule', selectedRule);
    }
    if (selectedMode === 'sprint') {
      params.set('duration', sprintDuration.toString());
    }

    router.push(`/play?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section */}
      <header className="pt-16 pb-8 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight">
            <span className="bg-gradient-to-r from-noggin-primary via-noggin-accent to-noggin-primary bg-clip-text text-transparent">
              NOGGIN
            </span>
          </h1>
          <p className="mt-4 text-lg text-noggin-text-muted max-w-md mx-auto">
            Fast-paced word game that challenges your creativity and quick thinking
          </p>
        </motion.div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 pb-12 max-w-4xl mx-auto w-full">
        {/* Mode selection */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-center">Choose Your Mode</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gameModes.map((mode) => (
              <motion.button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={cn(
                  'p-6 rounded-2xl text-left transition-all border-2',
                  selectedMode === mode.id
                    ? 'bg-noggin-primary/10 border-noggin-primary'
                    : 'bg-noggin-surface border-noggin-border hover:border-noggin-text-muted'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{mode.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{mode.name}</h3>
                    <p className="text-sm text-noggin-text-muted mt-1">
                      {mode.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Mode-specific options */}
        {selectedMode && (
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            {/* Difficulty selection (not for daily) */}
            {selectedMode !== 'daily' && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 text-center">Difficulty</h3>
                <div className="flex justify-center gap-3">
                  {difficulties.map((diff) => (
                    <button
                      key={diff.id}
                      onClick={() => setSelectedDifficulty(diff.id)}
                      className={cn(
                        'px-6 py-3 rounded-xl transition-all',
                        selectedDifficulty === diff.id
                          ? 'bg-noggin-primary text-white'
                          : 'bg-noggin-surface hover:bg-noggin-surface-hover text-noggin-text'
                      )}
                    >
                      {diff.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sprint duration */}
            {selectedMode === 'sprint' && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 text-center">Duration</h3>
                <div className="flex justify-center gap-3">
                  {[30, 60, 120].map((seconds) => (
                    <button
                      key={seconds}
                      onClick={() => setSprintDuration(seconds)}
                      className={cn(
                        'px-6 py-3 rounded-xl transition-all',
                        sprintDuration === seconds
                          ? 'bg-noggin-primary text-white'
                          : 'bg-noggin-surface hover:bg-noggin-surface-hover text-noggin-text'
                      )}
                    >
                      {seconds}s
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rule selection for practice mode */}
            {selectedMode === 'practice' && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 text-center">Select Rule to Practice</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rules.map((rule) => (
                    <button
                      key={rule.id}
                      onClick={() => setSelectedRule(rule.id)}
                      className={cn(
                        'p-4 rounded-xl text-left transition-all border-2',
                        selectedRule === rule.id
                          ? 'border-noggin-primary bg-noggin-primary/10'
                          : 'border-noggin-border bg-noggin-surface hover:border-noggin-text-muted'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${rule.renderStyle.color}20` }}
                        >
                          {rule.renderStyle.icon}
                        </span>
                        <div>
                          <h4
                            className="font-semibold"
                            style={{ color: rule.renderStyle.color }}
                          >
                            {rule.shortName}
                          </h4>
                          <p className="text-xs text-noggin-text-muted">
                            {rule.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        )}

        {/* Start button */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedMode ? 1 : 0.3 }}
        >
          <Button
            size="xl"
            onClick={handleStartGame}
            disabled={!selectedMode || (selectedMode === 'practice' && !selectedRule)}
            className="min-w-[200px]"
          >
            Start Game
          </Button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center border-t border-noggin-border">
        <div className="flex items-center justify-center gap-6 mb-4">
          <Link
            href="/stats"
            className="flex items-center gap-2 text-noggin-text-muted hover:text-noggin-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Statistics
          </Link>
        </div>
        <p className="text-sm text-noggin-text-muted">
          Built with ❤️ • Inspired by the Noggin card game
        </p>
      </footer>
    </div>
  );
}
