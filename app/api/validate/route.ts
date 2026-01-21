import { NextRequest, NextResponse } from 'next/server';

// Types for validation request
interface ValidationRequest {
  ruleId: string;
  letters: [string, string];
  answer: Record<string, string>;
}

interface ValidationResponse {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  suggestion?: string;
}

// Build the prompt based on rule type
function buildPrompt(ruleId: string, letters: [string, string], answer: Record<string, string>): string {
  const [L1, L2] = letters;
  
  const prompts: Record<string, string> = {
    bookend: `Is "${answer.word}" a valid English word that starts with "${L1}" and ends with "${L2}"? 
Consider: Is this a real word found in a dictionary? Proper nouns, slang, and abbreviations don't count.`,

    middleLetters: `Is "${answer.word}" a valid English word where both "${L1}" and "${L2}" appear in the middle (not as the first or last letter)?
Consider: Is this a real word found in a dictionary?`,

    neitherLetter: `Is "${answer.word}" a valid English word that contains neither the letter "${L1}" nor "${L2}"?
Consider: Is this a real word found in a dictionary?`,

    initials: `Is "${answer.name}" a real, well-known celebrity or famous person with the initials ${L1}.${L2}. (first name starts with ${L1}, last name starts with ${L2})?
Consider: Would most people recognize this person? Fictional characters don't count.`,

    wordAssociation: `Are "${answer.word1}" (starting with ${L1}) and "${answer.word2}" (starting with ${L2}) two real English words that have an obvious connection or association?
Consider: Would most people immediately see the relationship? Examples of good associations: "Salt" and "Pepper", "Day" and "Night", "Doctor" and "Medicine".`,

    wordDissociation: `Are "${answer.word1}" (starting with ${L1}) and "${answer.word2}" (starting with ${L2}) two real English words that have absolutely NO connection or association?
Consider: Are both valid words? Is there truly no logical link between them? Opposites count as associated, not dissociated.`,

    describe: `Does "${answer.adjective} ${answer.noun}" (adjective starting with ${L1}, noun starting with ${L2}) form a sensible descriptive phrase?
Consider: Is "${answer.adjective}" a real adjective? Is "${answer.noun}" a real noun? Does the phrase describe something that could exist or make sense?`,
  };

  return prompts[ruleId] || `Validate this answer for the game rule "${ruleId}": ${JSON.stringify(answer)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidationRequest = await request.json();
    const { ruleId, letters, answer } = body;

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          isValid: true, 
          confidence: 'low', 
          reason: 'AI validation not configured - answer accepted',
        },
        { status: 200 }
      );
    }

    const prompt = buildPrompt(ruleId, letters, answer);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Fast and cheap
        messages: [
          {
            role: 'system',
            content: `You are a word game validator. Respond ONLY with a JSON object in this exact format:
{
  "isValid": true/false,
  "confidence": "high"/"medium"/"low",
  "reason": "brief explanation",
  "suggestion": "optional hint if invalid"
}
Be strict but fair. Common words and well-known celebrities should pass. Obscure or made-up answers should fail.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1, // Low temperature for consistent validation
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      // Fail open - accept the answer if API fails
      return NextResponse.json(
        { 
          isValid: true, 
          confidence: 'low', 
          reason: 'Could not verify - answer accepted',
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    try {
      // Parse the JSON response
      const validation: ValidationResponse = JSON.parse(content);
      return NextResponse.json(validation);
    } catch {
      // If parsing fails, try to extract intent
      const isValid = content.toLowerCase().includes('"isvalid": true') || 
                      content.toLowerCase().includes('"isvalid":true');
      return NextResponse.json({
        isValid,
        confidence: 'medium',
        reason: 'Validation completed',
      });
    }

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { 
        isValid: true, 
        confidence: 'low', 
        reason: 'Validation error - answer accepted',
      },
      { status: 200 }
    );
  }
}
