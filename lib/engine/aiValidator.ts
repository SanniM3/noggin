import { AnswerInput, ValidationResult } from '@/lib/types';

interface AIValidationResponse {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  suggestion?: string;
}

/**
 * Validates an answer using AI (OpenAI)
 * This is called AFTER the basic letter constraint checks pass
 */
export async function validateWithAI(
  ruleId: string,
  letters: [string, string],
  answer: AnswerInput
): Promise<ValidationResult> {
  try {
    const response = await fetch('/api/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ruleId,
        letters,
        answer,
      }),
    });

    if (!response.ok) {
      // Fail open - if API fails, accept with warning
      return {
        status: 'warning',
        message: 'Could not verify answer',
        details: ['AI validation unavailable - please self-judge'],
      };
    }

    const validation: AIValidationResponse = await response.json();

    if (validation.isValid) {
      // AI says it's valid
      if (validation.confidence === 'high') {
        return {
          status: 'valid',
          message: validation.reason || 'Verified!',
        };
      } else {
        // Medium/low confidence - still valid but note the uncertainty
        return {
          status: 'valid',
          message: validation.reason || 'Looks good!',
        };
      }
    } else {
      // AI says it's invalid
      if (validation.confidence === 'high') {
        return {
          status: 'invalid',
          message: validation.reason || 'Not a valid answer',
          details: validation.suggestion ? [validation.suggestion] : undefined,
        };
      } else {
        // Lower confidence - show as warning and let user decide
        return {
          status: 'warning',
          message: validation.reason || 'This might not be valid',
          details: [
            'AI is uncertain about this answer',
            ...(validation.suggestion ? [validation.suggestion] : []),
          ],
        };
      }
    }
  } catch (error) {
    console.error('AI validation error:', error);
    // Fail open - accept with warning if there's an error
    return {
      status: 'warning',
      message: 'Could not verify answer',
      details: ['Please self-judge this answer'],
    };
  }
}

/**
 * Combines local constraint checking with AI validation
 */
export async function validateAnswer(
  ruleId: string,
  letters: [string, string],
  answer: AnswerInput,
  localCheck: (answer: AnswerInput, letters: [string, string]) => ValidationResult
): Promise<ValidationResult> {
  // First, run the local constraint check (letter matching)
  const localResult = localCheck(answer, letters);
  
  // If local check fails, return immediately (no need for AI)
  if (localResult.status === 'invalid') {
    return localResult;
  }
  
  // If local check passes or warns, enhance with AI validation
  const aiResult = await validateWithAI(ruleId, letters, answer);
  
  // If AI says invalid with high confidence, override local result
  if (aiResult.status === 'invalid') {
    return aiResult;
  }
  
  // If AI says valid, upgrade any local warning to valid
  if (aiResult.status === 'valid' && localResult.status === 'warning') {
    return aiResult;
  }
  
  // If AI is uncertain (warning), keep as warning for user decision
  if (aiResult.status === 'warning') {
    return {
      status: 'warning',
      message: aiResult.message,
      details: [
        ...(localResult.details || []),
        ...(aiResult.details || []),
      ],
    };
  }
  
  // Default: return AI result (should be 'valid')
  return aiResult;
}
