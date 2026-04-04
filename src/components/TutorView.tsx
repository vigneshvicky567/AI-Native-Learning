import React, { useState, useEffect } from 'react';
import { GraphVisual } from './GraphVisual';
import { CodeBlock } from './CodeBlock';
import { Play, Pause, SkipBack, SkipForward, BrainCircuit, CheckCircle2, Code2 } from 'lucide-react';

interface TutorData {
  explanation?: string;
  steps?: {
    stepIndex: number;
    label: string;
    nodes: any[];
    edges: any[];
    dataStructure?: {
      type: string;
      items: any[];
      current?: any;
    };
    highlightLine?: number;
  }[];
  code?: {
    language: string;
    lines: { lineIndex: number; text: string }[];
  };
  complexity?: {
    time: string;
    space: string;
    explanation: string;
  };
  comparison?: {
    property: string;
    left: string;
    right: string;
    winner: string;
  }[];
  quiz?: {
    question: string;
    options: string[];
    answer: number;
    explanation?: string;
  };
}

export function TutorView({ data, onCodeUpdate }: { data: TutorData, onCodeUpdate?: (code: string, language: string, activeLine?: number) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [showQuizAnswer, setShowQuizAnswer] = useState(false);

  const steps = data.steps || [];
  const hasSteps = steps.length > 0;
  const activeStep = hasSteps ? steps[currentStep] : null;

  // Update external code editor when step changes
  useEffect(() => {
    if (data.code && onCodeUpdate && activeStep) {
      const codeString = data.code.lines.map(l => l.text).join('\n');
      onCodeUpdate(codeString, data.code.language, activeStep.highlightLine !== undefined ? activeStep.highlightLine + 1 : undefined);
    }
  }, [currentStep, data.code, activeStep, onCodeUpdate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && hasSteps) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000); // 2 seconds per step
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length, hasSteps]);

  const handleQuizSelect = (idx: number) => {
    if (showQuizAnswer) return;
    setQuizSelected(idx);
    setShowQuizAnswer(true);
  };

  // Complexity Bar Helper
  const renderComplexityBar = (label: string, value: string, color: string, width: string) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-300">{label}</span>
        <span className="font-mono text-slate-400">{value}</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width, backgroundColor: color }}
        />
      </div>
    </div>
  );

  // Map common complexities to rough percentages for the bar chart
  const getComplexityWidth = (tc: string) => {
    const t = tc.toLowerCase().replace(/\s/g, '');
    if (t.includes('1')) return '10%';
    if (t.includes('logn')) return '25%';
    if (t.includes('nlogn')) return '60%';
    if (t.includes('n^2') || t.includes('n²')) return '85%';
    if (t.includes('2^n') || t.includes('n!')) return '100%';
    if (t.includes('n')) return '40%';
    return '50%'; // default
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto text-gray-900 dark:text-slate-200">
      
      {/* 1. Explanation */}
      {data.explanation && (
        <div className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
          <p className="text-[15px] leading-relaxed text-gray-700 dark:text-slate-300">{data.explanation}</p>
        </div>
      )}

      {/* 2. Main Interactive Area: Graph + Code + DS */}
      {hasSteps && activeStep && (
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Left Column: Graph & Playback */}
          <div className="flex-1 flex flex-col gap-4 min-w-[50%]">
            <div className="bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              
              {/* Playback Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setIsPlaying(false); setCurrentStep(0); }}
                    disabled={currentStep === 0}
                    className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 disabled:opacity-30 transition-colors"
                  >
                    <SkipBack size={16} />
                  </button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                  </button>
                  <button 
                    onClick={() => { setIsPlaying(false); setCurrentStep(Math.min(steps.length - 1, currentStep + 1)); }}
                    disabled={currentStep === steps.length - 1}
                    className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 disabled:opacity-30 transition-colors"
                  >
                    <SkipForward size={16} />
                  </button>
                  <span className="text-xs font-medium text-gray-500 dark:text-slate-500 ml-2">
                    Step {currentStep + 1} / {steps.length}
                  </span>
                </div>
                <div className="text-sm font-medium text-indigo-600 dark:text-indigo-300 flex-1 ml-4 line-clamp-2">
                  {activeStep.label}
                </div>
              </div>

              {/* Graph Visual */}
              <div className="flex-1 relative min-h-[400px]">
                <GraphVisual 
                  nodes={activeStep.nodes} 
                  edges={activeStep.edges} 
                />
              </div>
            </div>
          </div>

          {/* Right Column: Data Structure (Code moved to external editor) */}
          {activeStep.dataStructure && activeStep.dataStructure.type !== 'none' && (
            <div className="w-full lg:w-[250px] flex flex-col gap-4">
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  {activeStep.dataStructure.type} State
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeStep.dataStructure.items.map((item: any, idx: number) => {
                    const isCurrent = item === activeStep.dataStructure?.current;
                    return (
                      <div 
                        key={idx}
                        className={`px-3 py-1.5 rounded-md font-mono text-sm transition-all duration-300 ${
                          isCurrent 
                            ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] -translate-y-1' 
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700'
                        }`}
                      >
                        {String(item)}
                      </div>
                    );
                  })}
                  {activeStep.dataStructure.items.length === 0 && (
                    <span className="text-sm text-gray-400 dark:text-slate-500 italic">Empty</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Bottom Row: Complexity & Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Complexity Card */}
        {data.complexity && (
          <div className="bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-200 mb-4 flex items-center gap-2">
              <BrainCircuit size={16} className="text-indigo-500 dark:text-indigo-400" />
              Complexity Analysis
            </h4>
            {renderComplexityBar('Time Complexity', data.complexity.time, '#ef4444', getComplexityWidth(data.complexity.time))}
            {renderComplexityBar('Space Complexity', data.complexity.space, '#3b82f6', getComplexityWidth(data.complexity.space))}
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800/50">
              {data.complexity.explanation}
            </p>
          </div>
        )}

        {/* Comparison Table */}
        {data.comparison && data.comparison.length > 0 && (
          <div className="bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Algorithm A</th>
                  <th className="px-4 py-3 font-medium">Algorithm B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800/50">
                {data.comparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-300">{row.property}</td>
                    <td className={`px-4 py-3 font-mono ${row.winner === 'left' ? 'text-emerald-600 dark:text-green-400 font-semibold bg-emerald-50 dark:bg-green-400/5' : 'text-gray-600 dark:text-slate-400'}`}>
                      {row.left}
                    </td>
                    <td className={`px-4 py-3 font-mono ${row.winner === 'right' ? 'text-emerald-600 dark:text-green-400 font-semibold bg-emerald-50 dark:bg-green-400/5' : 'text-gray-600 dark:text-slate-400'}`}>
                      {row.right}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Quiz */}
      {data.quiz && (
        <div className="bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/30 rounded-2xl overflow-hidden shadow-sm mt-2">
          <div className="bg-indigo-100/50 dark:bg-indigo-500/10 px-5 py-3 border-b border-indigo-200/50 dark:border-indigo-500/20 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 text-sm">Knowledge Check</h4>
          </div>
          <div className="p-5">
            <p className="text-gray-800 dark:text-slate-200 font-medium mb-4">{data.quiz.question}</p>
            <div className="flex flex-col gap-2">
              {data.quiz.options.map((opt, i) => {
                const isCorrect = i === data.quiz!.answer;
                const isSelected = i === quizSelected;
                
                let btnClass = "text-left px-4 py-3 rounded-xl border transition-all text-sm ";
                if (!showQuizAnswer) {
                  btnClass += "bg-white dark:bg-transparent border-gray-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 text-gray-700 dark:text-slate-300";
                } else {
                  if (isCorrect) {
                    btnClass += "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-medium";
                  } else if (isSelected && !isCorrect) {
                    btnClass += "bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/50 text-red-800 dark:text-red-300";
                  } else {
                    btnClass += "bg-gray-50 dark:bg-transparent border-gray-200 dark:border-slate-800 opacity-50 text-gray-500 dark:text-slate-500";
                  }
                }

                return (
                  <button key={i} onClick={() => handleQuizSelect(i)} disabled={showQuizAnswer} className={btnClass}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {showQuizAnswer && data.quiz.explanation && (
              <div className={`mt-4 p-4 rounded-xl border text-sm ${quizSelected === data.quiz.answer ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' : 'bg-gray-50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300'}`}>
                <span className="font-semibold mr-2">{quizSelected === data.quiz.answer ? "✅ Correct!" : "❌ Incorrect."}</span>
                {data.quiz.explanation}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
