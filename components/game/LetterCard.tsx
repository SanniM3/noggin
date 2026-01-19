'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface LetterCardProps {
  letter: string;
  index: number;
  isRevealed?: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-24 h-28 text-6xl',
  md: 'w-36 h-40 text-8xl md:w-44 md:h-48 md:text-letter-sm',
  lg: 'w-44 h-48 text-letter-sm md:w-56 md:h-60 md:text-letter',
};

export function LetterCard({
  letter,
  index,
  isRevealed = true,
  isCorrect = false,
  isIncorrect = false,
  size = 'md',
}: LetterCardProps) {
  return (
    <div className="perspective-1000">
      <motion.div
        className={cn(
          'letter-card relative flex items-center justify-center rounded-2xl font-display font-bold select-none',
          sizeClasses[size],
          isCorrect && 'feedback-correct border-feedback-correct',
          isIncorrect && 'feedback-incorrect border-feedback-incorrect',
          !isCorrect && !isIncorrect && 'letter-card-glow'
        )}
        initial={{ rotateY: -90, opacity: 0 }}
        animate={
          isRevealed
            ? { rotateY: 0, opacity: 1 }
            : { rotateY: -90, opacity: 0 }
        }
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
          delay: index * 0.15,
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Inner glow effect */}
        <div
          className="absolute inset-0 rounded-2xl opacity-50"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 60%)',
          }}
        />

        {/* Letter */}
        <span
          className="relative z-10 bg-gradient-to-br from-noggin-text to-noggin-text-muted bg-clip-text"
          style={{
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {letter}
        </span>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{
            duration: 1,
            delay: index * 0.15 + 0.3,
            ease: 'easeOut',
          }}
          style={{
            background:
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.2) 55%, transparent 60%)',
          }}
        />
      </motion.div>
    </div>
  );
}
