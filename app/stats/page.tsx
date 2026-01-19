'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStatsStore } from '@/lib/store/statsStore';
import { getRule, getAllRules } from '@/lib/engine/rules';
import {
  formatScore,
  formatTime,
  formatPercentage,
  getPerformanceColor,
} from '@/lib/engine/scoring';
import { cn } from '@/lib/utils/cn';

export default function StatsPage() {
  const stats = useStatsStore();
  const rules = getAllRules();

  const accuracy = useMemo(
    () => (stats.totalRounds > 0 ? stats.totalCorrect / stats.totalRounds : 0),
    [stats.totalCorrect, stats.totalRounds]
  );

  // Generate letter heatmap data (26x26 grid)
  const heatmapData = useMemo(() => {
    const grid: Record<string, { attempts: number; correct: number }> = {};
    
    stats.letterPairStats.forEach((lps) => {
      const key = lps.letters.join('');
      grid[key] = {
        attempts: lps.totalAttempts,
        correct: lps.correctCount,
      };
    });
    
    return grid;
  }, [stats.letterPairStats]);

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-noggin-bg/80 backdrop-blur-lg border-b border-noggin-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-noggin-text-muted hover:text-noggin-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-xl font-display font-bold">Statistics</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Overall stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Rounds"
              value={stats.totalRounds.toString()}
              icon="🎯"
            />
            <StatCard
              label="Total Score"
              value={formatScore(stats.totalScore)}
              icon="⭐"
            />
            <StatCard
              label="Accuracy"
              value={formatPercentage(accuracy)}
              icon="✅"
              color={getPerformanceColor(accuracy)}
            />
            <StatCard
              label="Best Streak"
              value={stats.bestStreak.toString()}
              icon="🔥"
            />
          </div>
        </motion.section>

        {/* Streaks */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold mb-4">Streaks</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Daily Streak"
              value={stats.currentDailyStreak.toString()}
              subtext={`Best: ${stats.bestDailyStreak}`}
              icon="📅"
            />
            <StatCard
              label="Avg Response Time"
              value={formatTime(stats.avgResponseTime)}
              icon="⏱️"
            />
          </div>
        </motion.section>

        {/* Per-rule performance */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-4">Performance by Rule</h2>
          <div className="bg-noggin-surface rounded-2xl border border-noggin-border overflow-hidden">
            {rules.map((rule, index) => {
              const ruleStats = stats.ruleStats[rule.id];
              const ruleAccuracy = ruleStats
                ? ruleStats.correctCount / ruleStats.totalAttempts
                : 0;
              
              return (
                <div
                  key={rule.id}
                  className={cn(
                    'flex items-center gap-4 p-4',
                    index !== rules.length - 1 && 'border-b border-noggin-border'
                  )}
                >
                  <span
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: `${rule.renderStyle.color}20` }}
                  >
                    {rule.renderStyle.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="font-semibold"
                        style={{ color: rule.renderStyle.color }}
                      >
                        {rule.shortName}
                      </span>
                      <span className="text-sm text-noggin-text-muted">
                        {ruleStats
                          ? `${ruleStats.correctCount}/${ruleStats.totalAttempts}`
                          : '—'}
                      </span>
                    </div>
                    <div className="h-2 bg-noggin-bg rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: ruleStats ? `${ruleAccuracy * 100}%` : '0%',
                          backgroundColor: getPerformanceColor(ruleAccuracy),
                        }}
                      />
                    </div>
                  </div>
                  {ruleStats && (
                    <div className="text-right text-sm">
                      <div className="font-semibold">
                        {formatPercentage(ruleAccuracy)}
                      </div>
                      <div className="text-noggin-text-muted text-xs">
                        {formatTime(ruleStats.avgResponseTime)} avg
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Letter heatmap */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-4">Letter Pair Performance</h2>
          <div className="bg-noggin-surface rounded-2xl border border-noggin-border p-4 overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header row */}
              <div className="flex">
                <div className="w-6 h-6" />
                {letters.map((letter) => (
                  <div
                    key={letter}
                    className="w-5 h-6 flex items-center justify-center text-xs font-mono text-noggin-text-muted"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              {/* Grid rows */}
              {letters.map((row) => (
                <div key={row} className="flex">
                  <div className="w-6 h-5 flex items-center justify-center text-xs font-mono text-noggin-text-muted">
                    {row}
                  </div>
                  {letters.map((col) => {
                    const key = row + col;
                    const data = heatmapData[key];
                    const accuracy = data ? data.correct / data.attempts : 0;
                    const hasData = data && data.attempts > 0;
                    
                    return (
                      <div
                        key={key}
                        className={cn(
                          'w-5 h-5 rounded-sm border border-noggin-border/30 transition-colors',
                          row === col && 'opacity-30'
                        )}
                        style={{
                          backgroundColor: hasData
                            ? `${getPerformanceColor(accuracy)}${Math.round(accuracy * 80 + 20).toString(16).padStart(2, '0')}`
                            : 'transparent',
                        }}
                        title={hasData ? `${key}: ${data.correct}/${data.attempts}` : `${key}: No data`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <p className="text-xs text-noggin-text-muted mt-4 text-center">
              Rows = first letter, Columns = second letter. Brighter = better accuracy.
            </p>
          </div>
        </motion.section>

        {/* Daily challenges history */}
        {stats.dailyChallenges.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg font-semibold mb-4">Daily Challenges</h2>
            <div className="bg-noggin-surface rounded-2xl border border-noggin-border overflow-hidden">
              {stats.dailyChallenges.slice().reverse().slice(0, 10).map((dc, index) => (
                <div
                  key={dc.date}
                  className={cn(
                    'flex items-center justify-between p-4',
                    index !== Math.min(stats.dailyChallenges.length - 1, 9) && 'border-b border-noggin-border'
                  )}
                >
                  <div>
                    <div className="font-semibold">{dc.date}</div>
                    <div className="text-sm text-noggin-text-muted">
                      {dc.correctRounds}/{dc.totalRounds} correct • 🔥 {dc.bestStreak}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-display font-bold text-noggin-primary">
                      {formatScore(dc.score)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty state */}
        {stats.totalRounds === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold mb-2">No stats yet!</h2>
            <p className="text-noggin-text-muted mb-6">
              Play some games to see your statistics here.
            </p>
            <Link href="/">
              <button className="btn-primary px-6 py-3 rounded-xl">
                Start Playing
              </button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}

// Stat card component
function StatCard({
  label,
  value,
  subtext,
  icon,
  color,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: string;
  color?: string;
}) {
  return (
    <div className="bg-noggin-surface rounded-xl border border-noggin-border p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-noggin-text-muted">{label}</span>
      </div>
      <div
        className="text-2xl font-display font-bold"
        style={{ color: color || 'inherit' }}
      >
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-noggin-text-muted mt-1">{subtext}</div>
      )}
    </div>
  );
}
