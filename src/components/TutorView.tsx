import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GraphVisual } from './GraphVisual';
import { CodeBlock } from './CodeBlock';
import { ChallengeMode } from './ChallengeMode';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { CHALLENGES } from '../data/challenges';
import { motion } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import {
  Play, Pause, SkipBack, SkipForward, ChevronsLeft, ChevronsRight,
  BrainCircuit, CheckCircle2, ChevronDown, ChevronUp, Maximize2, Minimize2,
  Keyboard, GripHorizontal, Loader2, Compass, X
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DSState {
  name?: string;
  type: 'stack' | 'queue' | 'heap' | 'array' | 'set' | 'map' | 'none';
  items: any[];
  current?: any;
}

interface Step {
  stepIndex: number;
  label: string;
  nodes: any[];
  edges: any[];
  dataStructure?: DSState;
  dataStructures?: DSState[];
  variables?: Record<string, string | number | boolean>;
  highlightLine?: number;
}

interface ComparisonRow {
  property: string;
  left: string;
  right: string;
  winner: 'left' | 'right' | 'none';
}

interface TutorData {
  note?: string;
  explanation?: string;
  steps?: Step[];
  code?: { language: string; lines: { lineIndex: number; text: string }[] };
  complexity?: { time: string; space: string; explanation: string };
  comparison?: ComparisonRow[];
  quiz?: { question: string; options: string[]; answer: number; explanation?: string };
  checkpoints?: string[];
}

interface TutorViewProps {
  data: TutorData;
  onCodeUpdate?: (code: string, language: string, activeLine?: number) => void;
  appMode: 'deep-work' | 'crisis-mode' | 'quick-check';
  onModeChange: (mode: 'deep-work' | 'crisis-mode' | 'quick-check') => void;
}

// ─── Challenges ────────────────────────────────────────────────────────────
const challenges = [
  "What would happen if val equalled root.val exactly?",
  "If node 10 had no left child, what would insert return?",
  "Why compare val to root.val and not to val directly?",
  "What base case is this recursion heading toward?",
  "Why return Node(val) instead of just setting root = Node(val)?",
  "If we did not return root at the end, what would break?"
];

// ─── Speed options ─────────────────────────────────────────────────────────

const SPEEDS = [
  { label: '0.5×', ms: 4000 },
  { label: '1×',   ms: 2000 },
  { label: '1.5×', ms: 1333 },
  { label: '2×',   ms: 1000 },
  { label: '3×',   ms: 667  },
];

// ─── Complexity bar helper ─────────────────────────────────────────────────

const COMPLEXITY_WIDTHS: [RegExp, string][] = [
  [/o\(1\)/,         '8%'],
  [/o\(log/,         '22%'],
  [/o\(n\)(?!log)/,  '40%'],
  [/o\(n\s*log/,     '58%'],
  [/o\(n\^?2|n²/,   '78%'],
  [/o\(2\^n|n!/,    '100%'],
];

function getComplexityWidth(tc: string): string {
  const t = tc.toLowerCase().replace(/\s/g, '');
  for (const [re, w] of COMPLEXITY_WIDTHS) if (re.test(t)) return w;
  return '45%';
}

// ─── JSON Extractor ────────────────────────────────────────────────────────

function extractJSON(text: string) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON from AI response:", text);
    return null;
  }
}

// ─── DS Visual ────────────────────────────────────────────────────────────

function DSVisual({ ds }: { ds: DSState }) {
  const [open, setOpen] = useState(true);
  const isStack   = ds.type === 'stack';
  const isQueue   = ds.type === 'queue';
  const isMap     = ds.type === 'map';
  const isSet     = ds.type === 'set';

  const items = isStack ? [...ds.items].reverse() : ds.items;

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden pointer-events-auto">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wider">{ds.name || ds.type}</span>
          {isStack && <span className="text-[10px] text-gray-400 dark:text-slate-500 italic lowercase">↑ top</span>}
          {isQueue && <span className="text-[10px] text-gray-400 dark:text-slate-500 italic lowercase">front →</span>}
        </div>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className={`p-3 border-t border-gray-100 dark:border-slate-800 flex ${isStack ? 'flex-col gap-1' : 'flex-row flex-wrap gap-2'}`}>
          {items.map((item: any, idx: number) => {
            const isCurrent = item === ds.current;
            const isTop     = isStack && idx === 0;
            const isFront   = isQueue && idx === 0;
            return (
              <div
                key={idx}
                className={`
                  px-3 py-1.5 rounded-md font-mono text-sm transition-all duration-300 text-center
                  ${isCurrent || isTop || isFront
                    ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] scale-105'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700'
                  }
                  ${isStack ? 'w-full' : ''}
                `}
              >
                {isMap && typeof item === 'object'
                  ? `${item.key} → ${item.value}`
                  : String(item)}
              </div>
            );
          })}
          {items.length === 0 && (
            <span className="text-sm text-gray-400 dark:text-slate-500 italic">Empty</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Variables Panel ──────────────────────────────────────────────────────

function VariablesPanel({ vars }: { vars: Record<string, any> }) {
  const [open, setOpen] = useState(true);
  if (!vars || Object.keys(vars).length === 0) return null;
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden pointer-events-auto">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span className="uppercase tracking-wider">Variables</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div className="p-3 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-2">
          {Object.entries(vars).map(([key, val]) => (
            <div key={key} className="flex justify-between items-start text-sm gap-3">
              <span className="font-mono text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5">{key}</span>
              <span className="font-mono bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-gray-700 dark:text-slate-300 break-all text-right">
                {String(val)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Checkpoints Banner ────────────────────────────────────────────────────

function CheckpointsBanner({ checkpoints }: { checkpoints: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-amber-700 dark:text-amber-300"
      >
        <span className="flex items-center gap-2">
          <CheckCircle2 size={15} /> Key Takeaways ({checkpoints.length})
        </span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && (
        <ul className="px-5 pb-4 space-y-2">
          {checkpoints.map((cp, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
              <span className="mt-0.5 text-amber-500">•</span> {cp}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Comparison Table ─────────────────────────────────────────────────────

function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  // Infer algorithm names from first row if present
  return (
    <div className="bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
        Comparison
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 dark:bg-slate-800/30 text-gray-500 dark:text-slate-400 text-xs uppercase">
          <tr>
            <th className="px-4 py-2 font-medium">Property</th>
            <th className="px-4 py-2 font-medium">A</th>
            <th className="px-4 py-2 font-medium">B</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
              <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-slate-300">{row.property}</td>
              <td className={`px-4 py-2.5 font-mono ${row.winner === 'left'
                ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/50 dark:bg-emerald-400/5'
                : 'text-gray-500 dark:text-slate-400'}`}>
                {row.left}
              </td>
              <td className={`px-4 py-2.5 font-mono ${row.winner === 'right'
                ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/50 dark:bg-emerald-400/5'
                : 'text-gray-500 dark:text-slate-400'}`}>
                {row.right}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main TutorView ───────────────────────────────────────────────────────

// Initialize Gemini API at top level to match App.tsx pattern
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function TutorView({ data, onCodeUpdate, appMode, onModeChange }: TutorViewProps) {
  const [currentStep, setCurrentStep]     = useState(0);
  const [isPlaying, setIsPlaying]         = useState(false);
  const [speedIdx, setSpeedIdx]           = useState(1);          // default 1× (2000ms)
  const [quizSelected, setQuizSelected]   = useState<number | null>(null);
  const [showQuizAnswer, setShowQuizAnswer] = useState(false);
  const [isFullscreen, setIsFullscreen]   = useState(false);
  const [showKeyHelp, setShowKeyHelp]     = useState(false);

  // appMode state removed - now using props

  // Token State
  const [tokens, setTokens] = useState(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('fastPassDate');
    if (saved !== today) {
      localStorage.setItem('fastPassDate', today);
      localStorage.setItem('fastPassTokens', '5');
      return 5;
    }
    return parseInt(localStorage.getItem('fastPassTokens') || '5');
  });

  // localStorage is written in exactly one place (this effect)
  useEffect(() => {
    localStorage.setItem('fastPassTokens', tokens.toString());
  }, [tokens]);

  // Fast-Pass Intercept State
  const [showSkipPanel, setShowSkipPanel] = useState(false);
  const [defendedSteps, setDefendedSteps] = useState<Set<number>>(new Set());
  const [tokenUsedSteps, setTokenUsedSteps] = useState<Set<number>>(new Set());
  const [showToast, setShowToast] = useState(false);

  // Challenge State
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState(false);
  const [challengeResult, setChallengeResult] = useState<{
    correct_variable: boolean;
    reasoning_valid: boolean;
    limits_acknowledged: boolean;
    feedback: string;
  } | null>(null);
  const [isChallengePassed, setIsChallengePassed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const completionBonusGiven = useRef(false);

  const steps    = data.steps || [];
  const hasSteps = steps.length > 0;
  const step     = hasSteps ? steps[currentStep] : null;
  const isFirst  = currentStep === 0;
  const isLast   = currentStep === steps.length - 1;
  const progress = hasSteps ? ((currentStep) / (steps.length - 1)) * 100 : 0;

  // ── Gemini API for Challenge ───────────────────────────────────────────
  const handleChallengeSubmit = async () => {
    if (!challengeAnswer.trim()) return;
    setIsSubmittingChallenge(true);
    try {
      const currentCode = data.code?.lines.map(l => l.text).join('\n') || '';
      const prompt = `You are evaluating a learner's defense of their understanding of an algorithm step.
Algorithm: ${data.explanation || 'Unknown'}
Current Step: ${step?.label || ''}
Current Code Context:
${currentCode}

Generate a challenging question about this specific step and evaluate the learner's answer.
Learner answer: ${challengeAnswer}

Return JSON only, no markdown, no explanation outside JSON:
{
  "correct_variable": boolean,
  "reasoning_valid": boolean,
  "limits_acknowledged": boolean,
  "feedback": "exactly 2 sentences"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = extractJSON(response.text);
      if (result) setChallengeResult(result);
    } catch (error) {
      console.error("Challenge evaluation error:", error);
    } finally {
      setIsSubmittingChallenge(false);
    }
  };

  const handleContinue = () => {
    setShowChallenge(false);
    setChallengeAnswer("");
    setChallengeResult(null);
    setIsChallengePassed(true);
    setDefendedSteps(prev => new Set(prev).add(currentStep));
  };

  const handleUseToken = () => {
    if (tokens > 0) {
      const newTokens = tokens - 1;
      setTokens(newTokens);
      setTokenUsedSteps(prev => new Set(prev).add(currentStep));
      setDefendedSteps(prev => new Set(prev).add(currentStep));
      setShowSkipPanel(false);
      setIsChallengePassed(true);
      goTo(currentStep + 1);
    }
  };

  const handleTakeChallenge = () => {
    setShowSkipPanel(false);
    setShowChallenge(true);
  };

  // Reset challenge state when step changes
  useEffect(() => {
    setShowChallenge(false);
    setChallengeAnswer("");
    setChallengeResult(null);
    setIsChallengePassed(defendedSteps.has(currentStep));
    setShowSkipPanel(false);
  }, [currentStep, defendedSteps]);

  // Completion bonus check
  useEffect(() => {
    if (
      hasSteps && 
      currentStep === steps.length - 1 && 
      steps.length > 1 &&
      tokenUsedSteps.size === 0 &&
      !completionBonusGiven.current
    ) {
      completionBonusGiven.current = true;
      setTokens(prev => Math.min(5, prev + 2));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }, [currentStep, steps.length, hasSteps, tokenUsedSteps.size]);

  // Resolve data structures for current step
  const dsArray: DSState[] = React.useMemo(() => {
    if (!step) return [];
    return step.dataStructures
      ?? (step.dataStructure && step.dataStructure.type !== 'none' ? [step.dataStructure] : []);
  }, [step]);

  // ── Sync external code editor ─────────────────────────────────────────
  const onCodeUpdateRef = useRef(onCodeUpdate);
  useEffect(() => {
    onCodeUpdateRef.current = onCodeUpdate;
  }, [onCodeUpdate]);

  // ── Navigation helpers ─────────────────────────────────────────────────
  const goTo    = useCallback((n: number) => setCurrentStep(Math.max(0, Math.min(steps.length - 1, n))), [steps.length]);
  const goFirst = useCallback(() => { setIsPlaying(false); goTo(0); }, [goTo]);
  const goLast  = useCallback(() => { setIsPlaying(false); goTo(steps.length - 1); }, [goTo, steps.length]);
  const goPrev  = useCallback(() => { setIsPlaying(false); goTo(currentStep - 1); }, [currentStep, goTo]);
  const goNext  = useCallback(() => { 
    if (appMode === 'deep-work' && !isChallengePassed && !isLast) {
      setShowSkipPanel(true);
      return;
    }
    setIsPlaying(false); 
    goTo(currentStep + 1); 
  }, [currentStep, goTo, appMode, isChallengePassed, isLast]);

  // ── Autoplay ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || !hasSteps) return;
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) { setIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, SPEEDS[speedIdx].ms);
    return () => clearInterval(timer);
  }, [isPlaying, steps.length, hasSteps, speedIdx]);

  // ── Sync external code editor ─────────────────────────────────────────
  useEffect(() => {
    if (data.code && onCodeUpdateRef.current && step) {
      const src = data.code.lines.map(l => l.text).join('\n');
      onCodeUpdateRef.current(src, data.code.language, step.highlightLine != null ? step.highlightLine + 1 : undefined);
    }
  }, [currentStep, data.code, step]);

  // ── Keyboard navigation ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      switch (e.key) {
        case 'ArrowRight': case 'l': goNext(); break;
        case 'ArrowLeft':  case 'h': goPrev(); break;
        case 'ArrowUp':    case 'k': goFirst(); break;
        case 'ArrowDown':  case 'j': goLast(); break;
        case ' ':
          e.preventDefault();
          if (!isLast) setIsPlaying(p => !p);
          break;
        case 'Escape':
          setIsFullscreen(false);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, goFirst, goLast, isLast]);

  // ── Quiz ───────────────────────────────────────────────────────────────
  const handleQuizSelect = (idx: number) => {
    if (showQuizAnswer) return;
    setQuizSelected(idx);
    setShowQuizAnswer(true);
  };

  // ── Scrubber click ─────────────────────────────────────────────────────
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    goTo(Math.round(pct * (steps.length - 1)));
  };

  // ── Main area ──────────────────────────────────────────────────────────
  const codeLines = React.useMemo(() => {
    return data.code?.lines.map((line, i) => {
      const isActive = step?.highlightLine === line.lineIndex;
      return (
        <div key={i} className={`flex min-h-[26px] items-stretch whitespace-pre text-[12.5px] leading-[2] transition-colors ${isActive ? 'bg-[#f0eeff] dark:bg-[#5b4fe8]/10' : ''}`}>
          <span className={`tutor-mono w-[38px] text-right pr-2.5 text-[10px] leading-[2.6] shrink-0 select-none border-l-[3px] ${isActive ? 'border-[#5b4fe8] text-[#5b4fe8] dark:text-[#7b6cff]' : 'border-transparent text-[#9898b4]'}`}>
            {line.lineIndex + 1}
          </span>
          <span className="tutor-mono px-0.5 text-[#1a1a2e] dark:text-[#e8e8f0]">
            {line.text}
          </span>
        </div>
      );
    }) || [];
  }, [data.code?.lines, step?.highlightLine]);

  if (isMinimized) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <button 
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-3 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Compass size={18} className="animate-pulse" />
          <span className="font-semibold text-sm">Open Interactive Visualizer</span>
          <ChevronDown size={16} className="ml-2 opacity-60" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-6 w-full max-w-5xl mx-auto text-gray-900 dark:text-slate-200 relative">
      
      {/* Close/Minimize Button */}
      <button 
        onClick={() => setIsMinimized(true)}
        className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500/30 shadow-md z-[60] transition-all group"
        title="Close Visualizer"
      >
        <X size={16} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform" />
      </button>

      {/* Note banner */}
      {data.note && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-xl px-4 py-2.5 text-sm text-blue-700 dark:text-blue-300">
          ℹ️ {data.note}
        </div>
      )}

      {/* Main area */}
      {hasSteps && step && (
        <div className={`flex flex-col rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden min-h-[580px] bg-[#f0f0f8] dark:bg-[#0a0a0f] tutor-root shadow-lg w-full max-w-6xl mx-auto ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''}`}>
          
          {/* Progress Bar */}
          <div className="relative h-[3px] bg-black/5 dark:bg-white/5 shrink-0">
            <div 
              className="absolute top-0 left-0 h-full bg-[#5b4fe8] rounded-r-[2px] transition-all duration-400 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Toolbar */}
          <div className="bg-white dark:bg-[#14141f] border-b border-black/10 dark:border-white/10 px-5 py-2.5 flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentStep(0)} disabled={isFirst} aria-label="First step" className="bg-transparent border border-black/10 dark:border-white/10 rounded-lg text-[#5c5c7a] dark:text-[#9898b0] text-[11px] px-2.5 py-1.5 hover:bg-[#ece9fd] hover:text-[#5b4fe8] hover:border-[#5b4fe8]/30 dark:hover:bg-[#5b4fe8]/20 transition-all disabled:opacity-50">«</button>
              <button onClick={goPrev} disabled={isFirst} aria-label="Previous step" className="bg-transparent border border-black/10 dark:border-white/10 rounded-lg text-[#5c5c7a] dark:text-[#9898b0] text-[11px] px-2.5 py-1.5 hover:bg-[#ece9fd] hover:text-[#5b4fe8] hover:border-[#5b4fe8]/30 dark:hover:bg-[#5b4fe8]/20 transition-all disabled:opacity-50">◀</button>
              <button onClick={() => setIsPlaying(!isPlaying)} aria-label={isPlaying ? "Pause" : "Play"} className="bg-[#5b4fe8] hover:bg-[#7b6ff0] border-none rounded-[10px] text-white text-xs px-3.5 py-1.5 font-semibold flex items-center gap-1.5 transition-colors">
                {isPlaying ? (
                  <span className="flex gap-[3px]"><span className="w-[3px] h-[10px] bg-white rounded-[1px]"></span><span className="w-[3px] h-[10px] bg-white rounded-[1px]"></span></span>
                ) : (
                  <span className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[9px] border-l-white inline-block"></span>
                )}
                {isPlaying ? 'pause' : 'play'}
              </button>
              <button onClick={goNext} disabled={isLast} aria-label="Next step" className="bg-transparent border border-black/10 dark:border-white/10 rounded-lg text-[#5c5c7a] dark:text-[#9898b0] text-[11px] px-2.5 py-1.5 hover:bg-[#ece9fd] hover:text-[#5b4fe8] hover:border-[#5b4fe8]/30 dark:hover:bg-[#5b4fe8]/20 transition-all disabled:opacity-50">▶</button>
              <button onClick={() => setCurrentStep(steps.length - 1)} disabled={isLast} aria-label="Last step" className="bg-transparent border border-black/10 dark:border-white/10 rounded-lg text-[#5c5c7a] dark:text-[#9898b0] text-[11px] px-2.5 py-1.5 hover:bg-[#ece9fd] hover:text-[#5b4fe8] hover:border-[#5b4fe8]/30 dark:hover:bg-[#5b4fe8]/20 transition-all disabled:opacity-50">»</button>
            </div>
            
            <div className="flex gap-1">
              {['deep-work', 'crisis-mode', 'quick-check'].map((m) => (
                <button 
                  key={m} 
                  onClick={() => onModeChange(m as any)}
                  className={`border rounded-md text-[10px] px-2 py-1 font-medium transition-all ${appMode === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-[#f7f7fc] dark:bg-[#1c1c2a] border-black/10 dark:border-white/10 text-[#9898b4] hover:bg-[#ece9fd] hover:text-[#5b4fe8]'}`}
                >
                  {m.replace('-', ' ')}
                </button>
              ))}
              {appMode === 'crisis-mode' && (
                <span className="text-[10px] text-red-400 font-medium ml-1 flex items-center">
                  Direct answers only
                </span>
              )}
            </div>

            <div className="flex gap-1">
              {SPEEDS.map((s, i) => (
                <button key={i} onClick={() => setSpeedIdx(i)} className={`border rounded-md text-[10px] px-2 py-1 font-medium transition-all ${i === speedIdx ? 'bg-[#5b4fe8] text-white border-[#5b4fe8]' : 'bg-[#f7f7fc] dark:bg-[#1c1c2a] border-black/10 dark:border-white/10 text-[#9898b4] hover:bg-[#ece9fd] hover:text-[#5b4fe8]'}`}>
                  {s.label}
                </button>
              ))}
            </div>
            
            <span className="bg-[#ece9fd] dark:bg-[#5b4fe8]/20 text-[#5b4fe8] dark:text-[#7b6cff] rounded-full px-3 py-1 text-[11px] font-semibold ml-1">
              {currentStep + 1} / {steps.length}
            </span>

            {/* Token Display */}
            <div className={`ml-auto flex items-center gap-2 ${appMode !== 'deep-work' ? 'opacity-40' : ''}`}>
              <span className="text-xs text-gray-400">Fast-Pass</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-[10px] h-[10px] rounded-full transition-colors ${i < tokens ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Hint Bar */}
          <div className="bg-[#ece9fd] dark:bg-[#5b4fe8]/10 border-b border-[#5b4fe8]/20 border-l-[3px] border-l-[#5b4fe8] px-5 py-2 text-xs text-[#5b4fe8] dark:text-[#7b6cff] font-medium shrink-0">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
              {step?.label || ''}
            </ReactMarkdown>
          </div>

          {/* Fast-Pass Skip Panel */}
          {appMode === 'deep-work' && showSkipPanel && (
            <div className="px-5 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
              <span className="text-sm text-indigo-900 dark:text-indigo-200 font-medium">
                Skip the challenge? Use a Fast-Pass.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleUseToken}
                  disabled={tokens === 0}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    tokens > 0 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Use token ({tokens} left)
                </button>
                <button
                  onClick={handleTakeChallenge}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all"
                >
                  Take the challenge
                </button>
              </div>
            </div>
          )}

          {/* Challenge System */}
          {appMode === 'deep-work' && showChallenge && (
            <div className="fixed inset-0 z-[100] bg-white dark:bg-[#050505] animate-in fade-in zoom-in-95 duration-300">
              <ChallengeMode 
                isDarkMode={document.documentElement.classList.contains('dark')}
                challenge={CHALLENGES[currentStep % CHALLENGES.length]}
                onClose={() => setShowChallenge(false)}
                onSuccess={() => {
                  setIsChallengePassed(true);
                  setDefendedSteps(prev => new Set(prev).add(currentStep));
                  setShowChallenge(false);
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 3000);
                }}
              />
            </div>
          )}

          {appMode === 'deep-work' && !showChallenge && !isChallengePassed && (
            <div className="px-5 py-3 bg-white dark:bg-[#14141f] border-b border-black/5 dark:border-white/5 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="text-indigo-600 w-5 h-5" />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Challenge available for this step</span>
              </div>
              <button
                onClick={() => setShowChallenge(true)}
                className="bg-indigo-600 text-white rounded-lg px-4 py-1.5 text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Take Challenge
              </button>
            </div>
          )}

          {/* Body Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_248px_1fr] min-h-0">
            
            {/* Graph Col */}
            <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#14141f] relative overflow-hidden min-h-[250px]">
              <div className="px-4 py-2.5 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
                <span className="text-[11px] font-bold text-[#1a1a2e] dark:text-[#e8e8f0] tracking-wider uppercase">Graph</span>
                <div className="flex gap-1.5">
                  <button className="bg-transparent border border-black/10 dark:border-white/10 rounded-md text-[#9898b4] text-[10px] px-2 py-1 hover:bg-[#ece9fd] hover:text-[#5b4fe8] transition-colors">⊕</button>
                  <button className="bg-transparent border border-black/10 dark:border-white/10 rounded-md text-[#9898b4] text-[10px] px-2 py-1 hover:bg-[#ece9fd] hover:text-[#5b4fe8] transition-colors">⊖</button>
                  <button onClick={() => setIsFullscreen(!isFullscreen)} className="bg-transparent border border-black/10 dark:border-white/10 rounded-md text-[#9898b4] text-[10px] px-2 py-1 hover:bg-[#ece9fd] hover:text-[#5b4fe8] transition-colors">⛶</button>
                </div>
              </div>
              <div className="flex-1 relative overflow-hidden">
                <GraphVisual nodes={step?.nodes || []} edges={step?.edges || []} isFullscreen={isFullscreen} onToggleFullscreen={() => setIsFullscreen(!isFullscreen)} />
              </div>
              <div className="border-t border-black/10 dark:border-white/10 px-4 py-2 flex gap-3.5 shrink-0">
                <div className="flex items-center gap-1.5 text-[10px] text-[#9898b4]"><div className="w-2.5 h-2.5 rounded-full border-2 border-[#5b4fe8] bg-[#ece9fd] dark:bg-[#5b4fe8]/20"></div>current</div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#9898b4]"><div className="w-2.5 h-2.5 rounded-full border-2 border-[#22c98a] bg-[#e6faf3] dark:bg-[#22c98a]/20"></div>inserted</div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#9898b4]"><div className="w-2.5 h-2.5 rounded-full border-2 border-[#3d3d52] bg-[#2d2d3f]"></div>idle</div>
              </div>
            </div>

            {/* Side Col (Vars + Stack) */}
            <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#14141f] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-black/10 dark:border-white/10 shrink-0">
                <span className="text-[11px] font-bold text-[#1a1a2e] dark:text-[#e8e8f0] tracking-wider uppercase">Variables</span>
              </div>
              <div className="flex flex-col overflow-y-auto max-h-[150px] lg:max-h-none">
                {Object.entries(step?.variables || {}).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between px-4 py-2 border-b border-black/10 dark:border-white/10">
                    <span className="text-[11px] text-[#5b4fe8] dark:text-[#7b6cff] font-medium">{k}</span>
                    <span className="tutor-mono bg-[#ece9fd] dark:bg-[#5b4fe8]/20 text-[#5b4fe8] dark:text-[#7b6cff] border border-[#5b4fe8]/20 rounded-[5px] px-2.5 py-0.5 text-[11px] font-semibold min-w-[38px] text-center transition-colors">
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="px-4 py-2.5 border-t border-b border-black/10 dark:border-white/10 flex justify-between items-center shrink-0 mt-auto lg:mt-0">
                <span className="text-[11px] font-bold text-[#1a1a2e] dark:text-[#e8e8f0] tracking-wider uppercase">Data Structures</span>
              </div>
              <div className="p-3 flex flex-col gap-1.5 flex-1 overflow-y-auto bg-[#f7f7fc] dark:bg-[#1c1c2a]">
                 {dsArray.map((ds, i) => <DSVisual key={i} ds={ds} />)}
                 {dsArray.length === 0 && <span className="text-xs text-[#9898b4] italic">Empty</span>}
              </div>
            </div>

            {/* Code Col */}
            <div className="flex flex-col bg-white dark:bg-[#14141f] overflow-hidden min-h-[250px]">
              <div className="bg-[#f7f7fc] dark:bg-[#1c1c2a] border-b border-black/10 dark:border-white/10 px-3.5 py-2 flex items-center gap-2 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]"></div>
                  <div className="w-[11px] h-[11px] rounded-full bg-[#febc2e]"></div>
                  <div className="w-[11px] h-[11px] rounded-full bg-[#28c840]"></div>
                </div>
                <span className="text-[9px] text-[#9898b4] mx-1">●</span>
                <span className="tutor-mono text-[11px] text-[#5c5c7a] dark:text-[#9898b0] font-medium ml-1">
                  main.{data.code?.language === 'python' ? 'py' : 'js'}
                </span>
                <button onClick={() => onCodeUpdate?.(data.code?.lines.map(l => l.text).join('\n') || '', data.code?.language || 'javascript', step?.highlightLine)} className="ml-auto bg-[#5b4fe8] hover:bg-[#7b6ff0] text-white border-none rounded-lg px-3.5 py-1.5 text-[11px] font-bold flex items-center gap-1.5 transition-colors">
                  <span className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[7px] border-l-white inline-block"></span> Run Code
                </button>
              </div>
              <div className="code-lines flex-1 overflow-y-auto py-2">
                {codeLines}
              </div>
            </div>

          </div>

          {/* Statusbar */}
          <div className="bg-[#f7f7fc] dark:bg-[#1c1c2a] border-t border-black/10 dark:border-white/10 px-5 py-1.5 flex items-center gap-3.5 shrink-0 text-[9px] text-[#9898b4] font-medium tracking-wider">
            <span className="w-[5px] h-[5px] rounded-full bg-[#22c98a] inline-block"></span>
            <span>{data.code?.language === 'python' ? 'Python 3.11' : 'Node.js'}</span>
            <span className="w-[1px] h-[10px] bg-black/10 dark:bg-white/10 inline-block"></span>
            <span>step {currentStep + 1}</span>
            <span className="w-[1px] h-[10px] bg-black/10 dark:bg-white/10 inline-block"></span>
            <span>{step?.nodes?.length || 0} nodes</span>
          </div>
        </div>
      )}

      {/* Bottom row: complexity + comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl mx-auto mt-4">

        {data.complexity && (
          <div className="bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-200 mb-4 flex items-center gap-2">
              <BrainCircuit size={15} className="text-indigo-500" /> Complexity
            </h4>
            {(['time', 'space'] as const).map(k => (
              <div key={k} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-300 capitalize">{k}</span>
                  <span className="font-mono text-slate-400">{data.complexity![k]}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: getComplexityWidth(data.complexity![k]),
                      backgroundColor: k === 'time' ? '#ef4444' : '#3b82f6'
                    }} />
                </div>
              </div>
            ))}
            <div className="text-sm text-gray-600 dark:text-slate-400 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800/50 prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                {data.complexity.explanation}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {data.comparison && data.comparison.length > 0 && (
          <ComparisonTable rows={data.comparison} />
        )}
      </div>

      {/* Quiz */}
      {data.quiz && (
        <div className="bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/30 rounded-2xl overflow-hidden shadow-sm w-full max-w-6xl mx-auto mt-4">
          <div className="bg-indigo-100/50 dark:bg-indigo-500/10 px-5 py-3 border-b border-indigo-200/50 dark:border-indigo-500/20 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 text-sm">Knowledge Check</h4>
          </div>
          <div className="p-5">
            <p className="text-gray-800 dark:text-slate-200 font-medium mb-4">{data.quiz.question}</p>
            <div className="flex flex-col gap-2">
              {data.quiz.options.map((opt, i) => {
                const isCorrect  = i === data.quiz!.answer;
                const isSelected = i === quizSelected;
                let cls = "text-left px-4 py-3 rounded-xl border transition-all text-sm ";
                if (!showQuizAnswer) {
                  cls += "bg-white dark:bg-transparent border-gray-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300";
                } else if (isCorrect) {
                  cls += "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-medium";
                } else if (isSelected) {
                  cls += "bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/50 text-red-800 dark:text-red-300";
                } else {
                  cls += "bg-gray-50 dark:bg-transparent border-gray-200 dark:border-slate-800 opacity-40 text-gray-500 dark:text-slate-500";
                }
                return (
                  <button key={i} onClick={() => handleQuizSelect(i)} disabled={showQuizAnswer} className={cls}>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Quiz explanation */}
            {showQuizAnswer && (
              <div className={`mt-4 p-4 rounded-xl border text-sm ${
                quizSelected === data.quiz.answer
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-gray-50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300'
              }`}>
                <span className="font-semibold mr-2">
                  {quizSelected === data.quiz.answer ? '✅ Correct!' : '❌ Incorrect.'}
                </span>
                {data.quiz.explanation ?? (quizSelected === data.quiz.answer
                  ? 'Well done.'
                  : `The correct answer was: ${data.quiz.options[data.quiz.answer]}`)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-xl px-4 py-3 text-sm shadow-2xl animate-in fade-in slide-in-from-bottom-4 z-[100]">
          +2 Fast-Pass credits earned — deep work session complete
        </div>
      )}
    </div>
  );
}
