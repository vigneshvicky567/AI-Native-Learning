import { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Challenge, CheckResult } from '../types/challenge';

export function useChallengeChecker() {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const checkSolution = useCallback(async (
    challenge: Challenge,
    userCode: string
  ): Promise<CheckResult | null> => {
    setIsChecking(true);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a code challenge judge for a learning platform. Evaluate the student's solution strictly and return ONLY a JSON object — no markdown, no explanation outside the JSON.

Challenge: ${challenge.title}
Language: ${challenge.language}
Difficulty: ${challenge.difficulty}

Task description:
${challenge.prompt}

Test cases the solution must pass:
${challenge.testCases.map((tc, i) => `${i + 1}. Input: ${tc.input} → Expected: ${tc.expectedOutput}`).join('\n')}

Student's code:
\`\`\`${challenge.language}
${userCode}
\`\`\`

Return this exact JSON shape:
{
  "passed": boolean,
  "score": number,
  "verdict": "one sentence summary of the solution",
  "feedback": [
    { "line": number, "type": "error"|"warning"|"praise", "message": "specific feedback" }
  ],
  "hint": "a nudge toward the right approach if failed, omit if passed",
  "suggestedFix": "the corrected code if score < 60, omit otherwise"
}

Be encouraging but honest. Praise good patterns even in failed solutions. Score 100 only for clean, idiomatic solutions.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });

      const raw = response.text || '';

      // Strip any accidental markdown fences
      const clean = raw.replace(/```json\n?|```/g, '').trim();
      const parsed: CheckResult = JSON.parse(clean);
      setResult(parsed);
      return parsed;
    } catch (err) {
      console.error('Challenge check failed:', err);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return { checkSolution, isChecking, result, reset };
}
