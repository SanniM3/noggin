'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Rule, AnswerInput, ValidationResult } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface InputDockProps {
  rule: Rule;
  letters: [string, string];
  inputValues: AnswerInput;
  onInputChange: (fieldId: string, value: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  disabled?: boolean;
  validationHint?: ValidationResult | null;
}

export function InputDock({
  rule,
  letters,
  inputValues,
  onInputChange,
  onSubmit,
  onSkip,
  disabled = false,
  validationHint,
}: InputDockProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [disabled, rule.id]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, fieldIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If more fields and not on last, move to next
      if (fieldIndex < rule.inputSchema.fields.length - 1) {
        inputRefs.current[fieldIndex + 1]?.focus();
      } else {
        onSubmit();
      }
    } else if (e.key === 'Tab' && !e.shiftKey) {
      // Natural tab behavior
    }
  };

  // Check if input meets minimum requirements
  const canSubmit = rule.inputSchema.fields.every((field) => {
    const value = (inputValues[field.id] || '').trim();
    return value.length >= (field.minLength || 1);
  });

  // Get letter hint for field
  const getLetterHint = (constraint: string | undefined): string | null => {
    if (constraint === 'first') return letters[0];
    if (constraint === 'second') return letters[1];
    return null;
  };

  return (
    <motion.div
      className="w-full max-w-xl mx-auto"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      {/* Input fields */}
      <div className={cn(
        'flex gap-3',
        rule.inputSchema.type === 'double' ? 'flex-col sm:flex-row' : 'flex-col'
      )}>
        {rule.inputSchema.fields.map((field, index) => {
          const letterHint = getLetterHint(field.letterConstraint);
          const value = inputValues[field.id] || '';
          
          // Check if this field has an error
          const hasError = validationHint?.status === 'invalid' &&
            validationHint.details?.some(d => d.toLowerCase().includes(field.label.toLowerCase()));
          
          return (
            <div key={field.id} className="flex-1">
              <label
                htmlFor={field.id}
                className="block text-sm font-medium text-noggin-text-muted mb-2"
              >
                {field.label}
                {letterHint && (
                  <span
                    className="ml-2 px-2 py-0.5 rounded text-xs font-display font-bold"
                    style={{ backgroundColor: 'var(--noggin-primary)', opacity: 0.8 }}
                  >
                    {letterHint}_
                  </span>
                )}
              </label>
              <div className="relative">
                {/* Letter prefix indicator */}
                {letterHint && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-noggin-text-muted font-display font-bold text-lg opacity-50">
                    {letterHint}
                  </span>
                )}
                <input
                  ref={(el) => { inputRefs.current[index] = el; }}
                  id={field.id}
                  type="text"
                  value={value}
                  onChange={(e) => onInputChange(field.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  placeholder={field.placeholder}
                  disabled={disabled}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck="false"
                  className={cn(
                    'game-input w-full py-4 text-lg rounded-xl',
                    letterHint ? 'pl-10 pr-4' : 'px-4',
                    hasError && 'border-feedback-incorrect',
                    'uppercase tracking-wide'
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Validation hint */}
      {validationHint && validationHint.status !== 'valid' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mt-3 p-3 rounded-lg text-sm',
            validationHint.status === 'warning' && 'bg-feedback-warning/10 text-feedback-warning',
            validationHint.status === 'invalid' && 'bg-feedback-incorrect/10 text-feedback-incorrect'
          )}
        >
          {validationHint.message}
          {validationHint.details && validationHint.details.length > 0 && (
            <ul className="mt-1 ml-4 list-disc opacity-80">
              {validationHint.details.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          )}
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          variant="secondary"
          size="lg"
          onClick={onSkip}
          disabled={disabled}
          className="flex-1 sm:flex-none"
        >
          Skip
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onSubmit}
          disabled={disabled || !canSubmit}
          className="flex-[2]"
        >
          Submit
        </Button>
      </div>

      {/* Keyboard hints */}
      <div className="mt-4 text-center text-xs text-noggin-text-muted opacity-60">
        Press <kbd className="px-1.5 py-0.5 rounded bg-noggin-surface border border-noggin-border font-mono">Enter</kbd> to submit
        {' • '}
        <kbd className="px-1.5 py-0.5 rounded bg-noggin-surface border border-noggin-border font-mono">Space</kbd> to skip
      </div>
    </motion.div>
  );
}
