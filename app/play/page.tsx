'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGameStore, selectIsRunComplete } from '@/lib/store/gameStore';
import { useStatsStore } from '@/lib/store/statsStore';
import { GameStage } from '@/components/game/GameStage';
import { RunSummary } from '@/components/game/RunSummary';
import { GameMode, Difficulty } from '@/lib/types';
import { getDailyChallengeSeed, getTodayDateString } from '@/lib/engine/generator';

function PlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { run, startRun, resetGame } = useGameStore();
  const recordRun = useStatsStore((state) => state.recordRun);
  const recordDailyChallenge = useStatsStore((state) => state.recordDailyChallenge);
  const isRunComplete = useGameStore(selectIsRunComplete);

  // Parse URL params
  const mode = (searchParams.get('mode') || 'quick') as GameMode;
  const difficulty = (searchParams.get('difficulty') || 'normal') as Difficulty;
  const selectedRuleId = searchParams.get('rule') || undefined;
  const timerDuration = parseInt(searchParams.get('duration') || '60', 10);

  // Start game on mount if not already running
  useEffect(() => {
    if (!run) {
      startRun(mode, {
        difficulty,
        selectedRuleId,
        timerDuration: mode === 'sprint' ? timerDuration * 1000 : undefined,
      });
    }
  }, [run, mode, difficulty, selectedRuleId, timerDuration, startRun]);

  // Record stats when run completes
  useEffect(() => {
    if (run && isRunComplete && run.endTime) {
      // Record run stats
      recordRun(run);

      // Record daily challenge if applicable
      if (run.mode === 'daily') {
        const correctRounds = run.rounds.filter((r) => r.result?.correct).length;
        recordDailyChallenge({
          date: getTodayDateString(),
          seed: getDailyChallengeSeed(),
          score: run.score,
          totalRounds: run.rounds.length,
          correctRounds,
          bestStreak: run.bestStreak,
          completedAt: run.endTime,
        });
      }
    }
  }, [run, isRunComplete, recordRun, recordDailyChallenge]);

  const handleExit = () => {
    resetGame();
    router.push('/');
  };

  const handlePlayAgain = () => {
    resetGame();
    // Restart with same settings
    startRun(mode, {
      difficulty,
      selectedRuleId,
      timerDuration: mode === 'sprint' ? timerDuration * 1000 : undefined,
    });
  };

  const handleShare = () => {
    if (!run) return;

    const correctRounds = run.rounds.filter((r) => r.result?.correct).length;
    const accuracy = Math.round((correctRounds / run.rounds.length) * 100);
    const date = getTodayDateString();

    const shareText = `🧠 Noggin Daily Challenge - ${date}
📊 Score: ${run.score}
✅ ${correctRounds}/${run.rounds.length} (${accuracy}%)
🔥 Best Streak: ${run.bestStreak}

Play at: ${typeof window !== 'undefined' ? window.location.origin : ''}`;

    if (navigator.share) {
      navigator.share({
        title: 'Noggin Daily Challenge',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      // TODO: Show toast notification
    }
  };

  const handleSettings = () => {
    // TODO: Open settings modal
    console.log('Settings clicked');
  };

  if (!run) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-noggin-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-noggin-text-muted">Loading game...</p>
        </div>
      </div>
    );
  }

  // Show summary when run is complete
  if (isRunComplete) {
    return (
      <RunSummary
        run={run}
        onPlayAgain={handlePlayAgain}
        onExit={handleExit}
        onShare={mode === 'daily' ? handleShare : undefined}
      />
    );
  }

  return <GameStage onExit={handleExit} onSettings={handleSettings} />;
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-noggin-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <PlayContent />
    </Suspense>
  );
}
