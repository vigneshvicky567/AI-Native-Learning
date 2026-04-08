export type ChallengeStatus = 'idle' | 'active' | 'checking' | 'result';

export interface Challenge {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  prompt: string;           // markdown description shown to user
  starterCode: string;      // pre-filled skeleton
  testCases: TestCase[];    // shown to user so they know what to hit
  hints: string[];          // revealed one at a time
  timeLimit?: number;       // seconds, optional
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;       // hidden test cases not shown upfront
}

export interface CheckResult {
  passed: boolean;
  score: number;            // 0–100
  verdict: string;          // one-sentence summary
  feedback: LineFeedback[];
  hint?: string;            // nudge if failed
  suggestedFix?: string;    // optional fixed code
}

export interface LineFeedback {
  line: number;
  type: 'error' | 'warning' | 'praise';
  message: string;
}
