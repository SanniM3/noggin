'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface TimerProps {
  duration: number; // in milliseconds
  isRunning: boolean;
  onTimeUp?: () => void;
  style?: 'up' | 'down';
  showWarning?: boolean;
  warningThreshold?: number; // in milliseconds
}

export function Timer({
  duration,
  isRunning,
  onTimeUp,
  style = 'down',
  showWarning = true,
  warningThreshold = 10000,
}: TimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Reset when duration changes
  useEffect(() => {
    setElapsed(0);
    setStartTime(null);
  }, [duration]);

  // Timer logic
  useEffect(() => {
    if (!isRunning) {
      setStartTime(null);
      return;
    }

    if (startTime === null) {
      setStartTime(Date.now() - elapsed);
    }

    const interval = setInterval(() => {
      const newElapsed = Date.now() - (startTime ?? Date.now());
      setElapsed(newElapsed);

      if (newElapsed >= duration) {
        clearInterval(interval);
        onTimeUp?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, startTime, duration, onTimeUp, elapsed]);

  // Calculate display time
  const remaining = Math.max(0, duration - elapsed);
  const displayTime = style === 'down' ? remaining : elapsed;
  
  const seconds = Math.floor(displayTime / 1000);
  const minutes = Math.floor(seconds / 60);
  const displaySeconds = seconds % 60;
  const milliseconds = Math.floor((displayTime % 1000) / 100);

  // Warning state
  const isWarning = showWarning && remaining <= warningThreshold && remaining > 0;
  const isCritical = remaining <= 5000 && remaining > 0;

  // Progress percentage
  const progress = style === 'down' 
    ? (remaining / duration) * 100 
    : (elapsed / duration) * 100;

  const formatTime = useCallback(() => {
    if (minutes > 0) {
      return `${minutes}:${displaySeconds.toString().padStart(2, '0')}`;
    }
    return `${displaySeconds}.${milliseconds}`;
  }, [minutes, displaySeconds, milliseconds]);

  return (
    <div className="relative">
      {/* Progress bar */}
      <div className="w-full h-2 bg-noggin-surface rounded-full overflow-hidden mb-2">
        <motion.div
          className={cn(
            'h-full rounded-full transition-colors duration-300',
            isCritical ? 'bg-feedback-incorrect' :
            isWarning ? 'bg-feedback-warning' :
            'bg-noggin-primary'
          )}
          initial={{ width: style === 'down' ? '100%' : '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Time display */}
      <motion.div
        className={cn(
          'text-center font-display font-bold text-4xl tabular-nums',
          isCritical && 'text-feedback-incorrect',
          isWarning && !isCritical && 'text-feedback-warning',
          !isWarning && 'text-noggin-text'
        )}
        animate={isCritical ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
      >
        {formatTime()}
      </motion.div>

      {/* Warning pulse effect */}
      {isCritical && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(239, 68, 68, 0)',
              '0 0 0 10px rgba(239, 68, 68, 0.3)',
              '0 0 0 20px rgba(239, 68, 68, 0)',
            ],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </div>
  );
}
