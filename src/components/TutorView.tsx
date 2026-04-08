import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GraphVisual } from './GraphVisual';
import { CodeBlock } from './CodeBlock';
import { motion } from 'motion/react';
import {
  Play, Pause, SkipBack, SkipForward, ChevronsLeft, ChevronsRight,
  BrainCircuit, CheckCircle2, ChevronDown, ChevronUp, Maximize2, Minimize2,
  Keyboard, GripHorizontal
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
}

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

function complexityWidth(tc: string): string {
  const t = tc.toLowerCase().replace(/\s/g, '');
  for (const [re, w] of COMPLEXITY_WIDTHS) if (re.test(t)) return w;
  return '45%';
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

export function TutorView({ data, onCodeUpdate }: TutorViewProps) {
  const [currentStep, setCurrentStep]     = useState(0);
  const [isPlaying, setIsPlaying]         = useState(false);
  const [speedIdx, setSpeedIdx]           = useState(1);          // default 1× (2000ms)
  const [quizSelected, setQuizSelected]   = useState<number | null>(null);
  const [showQuizAnswer, setShowQuizAnswer] = useState(false);
  const [isFullscreen, setIsFullscreen]   = useState(false);
  const [showKeyHelp, setShowKeyHelp]     = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const steps    = data.steps || [];
  const hasSteps = steps.length > 0;
  const step     = hasSteps ? steps[currentStep] : null;
  const isFirst  = currentStep === 0;
  const isLast   = currentStep === steps.length - 1;
  const progress = hasSteps ? ((currentStep) / (steps.length - 1)) * 100 : 0;

  // Resolve data structures for current step
  const dsArray: DSState[] = step
    ? step.dataStructures
      ?? (step.dataStructure && step.dataStructure.type !== 'none' ? [step.dataStructure] : [])
    : [];

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
  const goNext  = useCallback(() => { setIsPlaying(false); goTo(currentStep + 1); }, [currentStep, goTo]);

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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="flex flex-col gap-6 w-full max-w-5xl mx-auto text-gray-900 dark:text-slate-200">

      {/* Note banner */}
      {data.note && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-xl px-4 py-2.5 text-sm text-blue-700 dark:text-blue-300">
          ℹ️ {data.note}
        </div>
      )}

      {/* Main area */}
      {hasSteps && step && (
        <div className={`flex flex-col lg:flex-row gap-4 ${isFullscreen ? 'absolute inset-0 z-50 bg-gray-50 dark:bg-[#0a0f1e] p-4 overflow-y-auto' : ''}`}>

          {/* Left: Graph + controls */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">

              {/* Playback bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex-wrap">
                {/* Controls */}
                <button onClick={goFirst}  disabled={isFirst} title="First step (↑)"
                  className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 disabled:opacity-30 transition-colors">
                  <ChevronsLeft size={15} />
                </button>
                <button onClick={goPrev}   disabled={isFirst} title="Prev (←)"
                  className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 disabled:opacity-30 transition-colors">
                  <SkipBack size={15} />
                </button>
                <button onClick={() => setIsPlaying(p => !p)} disabled={isLast}
                  className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors shadow-sm">
                  {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
                </button>
                <button onClick={goNext}   disabled={isLast}  title="Next (→)"
                  className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 disabled:opacity-30 transition-colors">
                  <SkipForward size={15} />
                </button>
                <button onClick={goLast}   disabled={isLast}  title="Last step (↓)"
                  className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 disabled:opacity-30 transition-colors">
                  <ChevronsRight size={15} />
                </button>

                {/* Step counter */}
                <span className="text-xs font-medium text-gray-400 dark:text-slate-500 ml-1">
                  {currentStep + 1} / {steps.length}
                </span>

                {/* Speed selector */}
                <div className="flex items-center gap-1 ml-2">
                  {SPEEDS.map((s, i) => (
                    <button key={i} onClick={() => setSpeedIdx(i)}
                      className={`text-xs px-2 py-0.5 rounded-md font-mono transition-colors ${
                        i === speedIdx
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-700'
                      }`}>
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Keyboard help */}
                <button onClick={() => setShowKeyHelp(p => !p)}
                  className="ml-auto p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 transition-colors" title="Keyboard shortcuts">
                  <Keyboard size={14} />
                </button>

                {/* Fullscreen */}
                <button onClick={() => setIsFullscreen(p => !p)}
                  className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 transition-colors">
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>

              {/* Keyboard shortcuts popover */}
              {showKeyHelp && (
                <div className="px-4 py-3 bg-gray-50 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-800 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-slate-400">
                  {[['← / h', 'Previous step'], ['→ / l', 'Next step'], ['Space', 'Play / Pause'], ['↑ / k', 'First step'], ['↓ / j', 'Last step'], ['Esc', 'Exit fullscreen']].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <kbd className="font-mono bg-gray-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-slate-300">{k}</kbd>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Scrubber */}
              <div
                className="h-1.5 bg-gray-200 dark:bg-slate-800 cursor-pointer relative"
                onClick={handleScrubberClick}
                title="Click to jump to step"
              >
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Step label */}
              <div className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-300 border-b border-gray-100 dark:border-slate-800 line-clamp-1">
                {step.label}
              </div>

              {/* Graph */}
              <div className="flex-1 relative min-h-[380px] overflow-hidden">
                <GraphVisual
                  nodes={step.nodes}
                  edges={step.edges}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={() => setIsFullscreen(p => !p)}
                />

                {/* Floating Panels (Fullscreen Only) */}
                {isFullscreen && (
                  <motion.div 
                    drag 
                    dragMomentum={false}
                    className="absolute top-4 right-4 flex flex-col gap-3 z-10 w-72 pointer-events-auto cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex justify-center -mb-2 opacity-50 hover:opacity-100 transition-opacity">
                      <div className="bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm border border-gray-200 dark:border-slate-700">
                        <GripHorizontal size={14} className="text-gray-500" />
                      </div>
                    </div>
                    <VariablesPanel vars={step.variables ?? {}} />
                    {dsArray.map((ds, i) => <DSVisual key={i} ds={ds} />)}
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Right: side panels (Normal View Only) */}
          {!isFullscreen && (
            <div className="w-full lg:w-[290px] flex flex-col gap-3 min-w-0">
              {/* Explanation */}
              {data.explanation && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <BrainCircuit size={14} className="text-indigo-500 dark:text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Intuition</span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-gray-700 dark:text-slate-300">{data.explanation}</p>
                </div>
              )}

              {/* Variables */}
              <VariablesPanel vars={step.variables ?? {}} />

              {/* Data structures */}
              {dsArray.map((ds, i) => <DSVisual key={i} ds={ds} />)}
            </div>
          )}
        </div>
      )}

      {/* Bottom row: complexity + comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
                      width: complexityWidth(data.complexity![k]),
                      backgroundColor: k === 'time' ? '#ef4444' : '#3b82f6'
                    }} />
                </div>
              </div>
            ))}
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800/50">
              {data.complexity.explanation}
            </p>
          </div>
        )}

        {data.comparison && data.comparison.length > 0 && (
          <ComparisonTable rows={data.comparison} />
        )}
      </div>

      {/* Checkpoints */}
      {data.checkpoints && data.checkpoints.length > 0 && (
        <CheckpointsBanner checkpoints={data.checkpoints} />
      )}

      {/* Quiz */}
      {data.quiz && (
        <div className="bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/30 rounded-2xl overflow-hidden shadow-sm">
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
    </div>
  );
}
