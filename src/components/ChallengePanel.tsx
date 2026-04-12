import React, { useState, useEffect } from 'react';
import {
  Trophy, ChevronRight, Lightbulb, RotateCcw,
  CheckCircle2, XCircle, Clock, Zap, Eye, EyeOff, X
} from 'lucide-react';
import type { Challenge, ChallengeStatus, CheckResult } from '../types/challenge';

interface ChallengePanelProps {
  challenge: Challenge;
  status: ChallengeStatus;
  result: CheckResult | null;
  isChecking: boolean;
  isDarkMode?: boolean;
  onStart: () => void;
  onSubmit: () => void;
  onReset: () => void;
  onApplyFix?: (code: string) => void;
  onClose?: () => void;
  className?: string;
}

export function ChallengePanel({
  challenge, status, result, isChecking, isDarkMode = false,
  onStart, onSubmit, onReset, onApplyFix, onClose, className
}: ChallengePanelProps) {
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showHiddenTests, setShowHiddenTests] = useState(false);

  // Timer
  useEffect(() => {
    if (status !== 'active') return;
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const difficultyColor = {
    beginner: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    intermediate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    advanced: 'bg-red-500/10 text-red-500 border-red-500/20',
  }[challenge.difficulty];

  const base = isDarkMode
    ? 'bg-[#0a0a0a]/95 border-gray-800 text-gray-100'
    : 'bg-white/95 border-gray-200 text-gray-900';

  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const surface = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200';

  return (
    <div className={`flex flex-col h-full rounded-2xl border overflow-hidden backdrop-blur-xl ${base} ${className || ''}`}>

      {/* Header */}
      <div className={`px-5 py-4 border-b flex items-start justify-between gap-3 shrink-0 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${difficultyColor}`}>
              {challenge.difficulty}
            </span>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
              {challenge.language}
            </span>
          </div>
          <h2 className="text-[15px] font-semibold leading-snug truncate">{challenge.title}</h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {status === 'active' && (
            <div className={`flex items-center gap-1.5 text-sm font-mono px-3 py-1.5 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
              <Clock size={13} />
              {formatTime(elapsed)}
            </div>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              title="Exit Challenge"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto">

        {/* IDLE: challenge intro */}
        {status === 'idle' && (
          <div className="p-5 flex flex-col gap-5">
            <div className={`text-sm leading-relaxed whitespace-pre-wrap ${muted}`}>
              {challenge.prompt}
            </div>

            {/* Test cases */}
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${muted}`}>Test cases</p>
              <div className="flex flex-col gap-1.5">
                {challenge.testCases.filter(tc => !tc.isHidden).map((tc, i) => (
                  <div key={i} className={`rounded-lg border px-3 py-2 font-mono text-[12px] ${surface}`}>
                    <span className={muted}>input: </span>
                    <span className="text-indigo-500">{tc.input}</span>
                    <span className={`mx-2 ${muted}`}>→</span>
                    <span className={muted}>expected: </span>
                    <span className="text-emerald-500">{tc.expectedOutput}</span>
                  </div>
                ))}
                {challenge.testCases.some(tc => tc.isHidden) && (
                  <div className={`rounded-lg border px-3 py-2 text-[12px] ${surface} ${muted}`}>
                    + {challenge.testCases.filter(tc => tc.isHidden).length} hidden test case(s)
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onStart}
              className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors"
            >
              <Zap size={15} />
              Start Challenge
              <ChevronRight size={15} />
            </button>
          </div>
        )}

        {/* ACTIVE: compact prompt + hints + submit */}
        {(status === 'active' || status === 'checking') && (
          <div className="p-5 flex flex-col gap-4">
            {/* Collapsed prompt */}
            <details className="group">
              <summary className={`text-[12px] font-semibold cursor-pointer list-none flex items-center justify-between ${muted}`}>
                <span>View task</span>
                <ChevronRight size={13} className="group-open:rotate-90 transition-transform" />
              </summary>
              <div className={`mt-2 text-[12px] leading-relaxed whitespace-pre-wrap ${muted}`}>
                {challenge.prompt}
              </div>
            </details>

            {/* Test cases (compact) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-[11px] font-semibold uppercase tracking-wider ${muted}`}>Tests</p>
                {challenge.testCases.some(tc => tc.isHidden) && (
                  <button
                    onClick={() => setShowHiddenTests(v => !v)}
                    className={`text-[11px] flex items-center gap-1 ${muted}`}
                  >
                    {showHiddenTests ? <EyeOff size={11} /> : <Eye size={11} />}
                    {showHiddenTests ? 'hide' : 'peek'}
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {challenge.testCases
                  .filter(tc => !tc.isHidden || showHiddenTests)
                  .map((tc, i) => (
                    <div key={i} className={`rounded-md border px-2.5 py-1.5 font-mono text-[11px] flex gap-2 flex-wrap ${surface}`}>
                      <span><span className={muted}>in:</span> <span className="text-indigo-400">{tc.input}</span></span>
                      <span className={muted}>→</span>
                      <span><span className={muted}>out:</span> <span className="text-emerald-400">{tc.expectedOutput}</span></span>
                      {tc.isHidden && <span className={`text-[10px] ${muted}`}>(hidden)</span>}
                    </div>
                  ))}
              </div>
            </div>

            {/* Hints */}
            {challenge.hints.length > 0 && (
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${muted}`}>
                  Hints ({hintsRevealed}/{challenge.hints.length})
                </p>
                {challenge.hints.slice(0, hintsRevealed).map((hint, i) => (
                  <div key={i} className={`mb-1.5 rounded-lg border-l-2 border-amber-400 px-3 py-2 text-[12px] ${isDarkMode ? 'bg-amber-500/5' : 'bg-amber-50'} ${muted}`}>
                    {hint}
                  </div>
                ))}
                {hintsRevealed < challenge.hints.length && (
                  <button
                    onClick={() => setHintsRevealed(n => n + 1)}
                    className={`text-[12px] flex items-center gap-1.5 ${muted} hover:text-amber-500 transition-colors`}
                  >
                    <Lightbulb size={12} />
                    Reveal hint {hintsRevealed + 1}
                  </button>
                )}
              </div>
            )}

            <button
              onClick={onSubmit}
              disabled={isChecking}
              className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors mt-auto"
            >
              {isChecking
                ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Checking with AI...</>
                : <><Trophy size={15} /> Submit Solution</>
              }
            </button>
          </div>
        )}

        {/* RESULT */}
        {status === 'result' && result && (
          <div className="p-5 flex flex-col gap-4">
            {/* Score banner */}
            <div className={`rounded-xl border p-4 text-center ${result.passed
              ? isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
              : isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                {result.passed
                  ? <CheckCircle2 size={18} className="text-emerald-500" />
                  : <XCircle size={18} className="text-red-500" />
                }
                <span className={`text-sm font-bold ${result.passed ? 'text-emerald-600' : 'text-red-500'}`}>
                  {result.passed ? 'Passed!' : 'Not quite'}
                </span>
              </div>
              <div className={`text-3xl font-bold mb-1 ${result.passed ? 'text-emerald-600' : 'text-red-500'}`}>
                {result.score}<span className="text-lg font-normal opacity-60">/100</span>
              </div>
              <p className={`text-[12px] ${muted}`}>{result.verdict}</p>
            </div>

            {/* Time taken */}
            <div className={`text-[12px] text-center ${muted}`}>
              Completed in {formatTime(elapsed)}
            </div>

            {/* Line feedback */}
            {result.feedback.length > 0 && (
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${muted}`}>Feedback</p>
                <div className="flex flex-col gap-1.5">
                  {result.feedback.map((fb, i) => {
                    const colors = {
                      error: `border-red-400 ${isDarkMode ? 'bg-red-500/5' : 'bg-red-50'} text-red-500`,
                      warning: `border-amber-400 ${isDarkMode ? 'bg-amber-500/5' : 'bg-amber-50'} text-amber-600`,
                      praise: `border-emerald-400 ${isDarkMode ? 'bg-emerald-500/5' : 'bg-emerald-50'} text-emerald-600`,
                    }[fb.type];
                    return (
                      <div key={i} className={`rounded-lg border-l-2 px-3 py-2 text-[12px] ${colors}`}>
                        <span className="font-mono text-[10px] opacity-60 mr-2">L{fb.line}</span>
                        {fb.message}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hint if failed */}
            {!result.passed && result.hint && (
              <div className={`rounded-lg border-l-2 border-amber-400 px-3 py-2 text-[12px] ${isDarkMode ? 'bg-amber-500/5' : 'bg-amber-50'} ${muted}`}>
                <span className="font-semibold text-amber-500">Hint: </span>{result.hint}
              </div>
            )}

            {/* Apply fix button */}
            {result.suggestedFix && onApplyFix && (
              <button
                onClick={() => onApplyFix(result.suggestedFix!)}
                className={`text-[12px] flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
              >
                <Zap size={12} className="text-indigo-400" />
                Show me the corrected solution
              </button>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-1">
              <button
                onClick={onReset}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[13px] font-semibold transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
              >
                <RotateCcw size={13} />
                Try again
              </button>
              <button
                onClick={() => {/* wire to next challenge */}}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[13px] font-semibold transition-colors"
              >
                Next challenge
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
