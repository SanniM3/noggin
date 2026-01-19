'use client';

import { motion } from 'framer-motion';
import { Rule } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

interface RuleCardProps {
  rule: Rule;
  isRevealed?: boolean;
  compact?: boolean;
}

export function RuleCard({ rule, isRevealed = true, compact = false }: RuleCardProps) {
  return (
    <motion.div
      className={cn(
        'rule-card rounded-2xl overflow-hidden',
        compact ? 'p-4' : 'p-6'
      )}
      initial={{ y: 30, opacity: 0 }}
      animate={isRevealed ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: 0.35,
      }}
    >
      {/* Color bar at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: rule.renderStyle.bgGradient || rule.renderStyle.color }}
      />

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center rounded-xl shrink-0',
            compact ? 'w-12 h-12 text-2xl' : 'w-16 h-16 text-3xl'
          )}
          style={{ backgroundColor: `${rule.renderStyle.color}20` }}
        >
          {rule.renderStyle.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-display font-bold tracking-tight',
              compact ? 'text-lg' : 'text-2xl'
            )}
            style={{ color: rule.renderStyle.color }}
          >
            {rule.shortName}
          </h3>
          <p
            className={cn(
              'text-noggin-text-muted mt-1',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            {rule.instructions}
          </p>
        </div>
      </div>

      {/* Example hint */}
      {!compact && rule.examples.length > 0 && (
        <motion.div
          className="mt-4 pt-4 border-t border-noggin-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm text-noggin-text-muted">
            <span className="font-medium text-noggin-text">Example: </span>
            {typeof rule.examples[0].answer === 'string'
              ? rule.examples[0].answer
              : rule.examples[0].answer.join(' + ')}
            {rule.examples[0].explanation && (
              <span className="opacity-70"> — {rule.examples[0].explanation}</span>
            )}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
