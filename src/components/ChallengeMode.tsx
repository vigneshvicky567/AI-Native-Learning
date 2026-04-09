import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChallengePanel } from './ChallengePanel';
import { CodeEditor } from './CodeEditor';
import { useChallengeChecker } from '../hooks/useChallengeChecker';
import { CHALLENGES } from '../data/challenges';
import type { Challenge, ChallengeStatus } from '../types/challenge';

interface ChallengeModeProps {
  isDarkMode?: boolean;
  challenge?: Challenge;
}

export function ChallengeMode({ isDarkMode = false, challenge = CHALLENGES[0] }: ChallengeModeProps) {
  const [status, setStatus] = useState<ChallengeStatus>('idle');
  const [code, setCode] = useState(challenge.starterCode);
  const { checkSolution, isChecking, result, reset } = useChallengeChecker();
  
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const handleStart = useCallback(() => {
    setCode(challenge.starterCode);
    setStatus('active');
  }, [challenge.starterCode]);

  const handleSubmit = useCallback(async () => {
    setStatus('checking');
    const res = await checkSolution(challenge, code);
    if (res) setStatus('result');
    else setStatus('active'); // fallback on network error
  }, [challenge, code, checkSolution]);

  const handleReset = useCallback(() => {
    reset();
    setCode(challenge.starterCode);
    setStatus('idle');
  }, [challenge.starterCode, reset]);

  const handleApplyFix = useCallback((fixedCode: string) => {
    setCode(fixedCode);
  }, []);

  // After checkSolution resolves, decorate the editor with feedback lines
  useEffect(() => {
    if (!result || !editorRef.current || !monacoRef.current) return;
    const monaco = monacoRef.current;
    const model = editorRef.current.getModel();
    if (!model) return;

    const markers = result.feedback.map(fb => ({
      severity: fb.type === 'error'
        ? monaco.MarkerSeverity.Error
        : fb.type === 'warning'
          ? monaco.MarkerSeverity.Warning
          : monaco.MarkerSeverity.Info,
      startLineNumber: fb.line,
      endLineNumber: fb.line,
      startColumn: 1,
      endColumn: 999,
      message: fb.message,
      source: 'AI Review',
    }));

    monaco.editor.setModelMarkers(model, 'challenge-review', markers);
  }, [result]);

  return (
    <div className="flex flex-col md:flex-row gap-3 h-full w-full p-3 overflow-y-auto md:overflow-hidden">
      {/* Left: challenge panel — fixed width on desktop, full on mobile */}
      <div className="w-full md:w-[320px] shrink-0 h-auto md:h-full">
        <ChallengePanel
          challenge={challenge}
          status={status}
          result={result}
          isChecking={isChecking}
          isDarkMode={isDarkMode}
          onStart={handleStart}
          onSubmit={handleSubmit}
          onReset={handleReset}
          onApplyFix={handleApplyFix}
        />
      </div>

      {/* Right: your existing CodeEditor, always visible */}
      <div className="flex-1 h-[60vh] md:h-full relative min-h-[400px]">
        <CodeEditor
          isOpen={true}
          onClose={() => {}}        // no close in challenge mode
          initialCode={code}
          onChangeCode={setCode}
          language={challenge.language}
          isDarkMode={isDarkMode}
          onRunCode={(c, l) => {
            // optionally run code before submit
            setCode(c);
          }}
          editorRef={editorRef}
          monacoRef={monacoRef}
          inline={true}
        />
      </div>
    </div>
  );
}
