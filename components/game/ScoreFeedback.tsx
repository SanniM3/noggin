'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FeedbackState } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

interface ScoreFeedbackProps {
  feedback: FeedbackState;
  onNext?: () => void;
  onOverride?: (accept: boolean) => void;
  showAdjudication?: boolean;
}

export function ScoreFeedback({
  feedback,
  onNext,
  onOverride,
  showAdjudication = false,
}: ScoreFeedbackProps) {
  return (
    <AnimatePresence>
      {feedback.visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={feedback.type !== 'warning' ? onNext : undefined}
          />

          {/* Content */}
          <motion.div
            className={cn(
              'relative z-10 p-8 rounded-3xl text-center max-w-md w-full',
              feedback.type === 'correct' && 'bg-feedback-correct/20 border-2 border-feedback-correct',
              feedback.type === 'incorrect' && 'bg-feedback-incorrect/20 border-2 border-feedback-incorrect',
              feedback.type === 'warning' && 'bg-feedback-warning/20 border-2 border-feedback-warning'
            )}
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Icon */}
            <motion.div
              className="text-6xl mb-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
            >
              {feedback.type === 'correct' && '✓'}
              {feedback.type === 'incorrect' && '✗'}
              {feedback.type === 'warning' && '⚠'}
            </motion.div>

            {/* Message */}
            <motion.h2
              className={cn(
                'text-2xl font-bold mb-2',
                feedback.type === 'correct' && 'text-feedback-correct',
                feedback.type === 'incorrect' && 'text-feedback-incorrect',
                feedback.type === 'warning' && 'text-feedback-warning'
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {feedback.message || (
                feedback.type === 'correct' ? 'Correct!' :
                feedback.type === 'incorrect' ? 'Not Quite!' :
                'Check Your Answer'
              )}
            </motion.h2>

            {/* Score popup */}
            {feedback.type === 'correct' && feedback.score !== undefined && (
              <motion.div
                className="text-4xl font-display font-bold text-feedback-correct"
                initial={{ opacity: 0, y: 20, scale: 1.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
              >
                +{feedback.score}
              </motion.div>
            )}

            {/* Adjudication buttons for manual/semi validation */}
            {showAdjudication && feedback.type === 'warning' && onOverride && (
              <motion.div
                className="flex gap-3 mt-6 justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={() => onOverride(false)}
                  className="px-6 py-3 rounded-xl bg-feedback-incorrect/20 text-feedback-incorrect font-medium hover:bg-feedback-incorrect/30 transition-colors"
                >
                  Nope, Wrong
                </button>
                <button
                  onClick={() => onOverride(true)}
                  className="px-6 py-3 rounded-xl bg-feedback-correct/20 text-feedback-correct font-medium hover:bg-feedback-correct/30 transition-colors"
                >
                  Count It ✓
                </button>
              </motion.div>
            )}

            {/* Continue button (for correct/incorrect) */}
            {feedback.type !== 'warning' && onNext && (
              <motion.button
                onClick={onNext}
                className="mt-6 px-8 py-3 rounded-xl bg-noggin-surface hover:bg-noggin-surface-hover text-noggin-text font-medium transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Next Round
              </motion.button>
            )}

            {/* Auto-continue hint */}
            {feedback.type !== 'warning' && (
              <motion.p
                className="mt-4 text-sm text-noggin-text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Press <span className="font-mono">Space</span> or tap anywhere to continue
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
