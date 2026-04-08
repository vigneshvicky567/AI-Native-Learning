import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { X, Minimize2, Maximize2, Terminal, Play, Loader2, Wand2 } from 'lucide-react';
import { useAiErrorFix } from '../hooks/useAiErrorFix';

interface CodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  language?: string;
  onRunCode?: (code: string, language: string) => void;
  onChangeCode?: (code: string) => void;
  isLoading?: boolean;
  isDarkMode?: boolean;
  activeLine?: number;
  editorRef?: React.MutableRefObject<any>;
  monacoRef?: React.MutableRefObject<any>;
}

export function CodeEditor({
  isOpen, onClose, initialCode = '', language = 'python',
  onRunCode, onChangeCode, isLoading, isDarkMode = false, activeLine,
  editorRef: externalEditorRef, monacoRef: externalMonacoRef
}: CodeEditorProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [editorWidth, setEditorWidth] = useState(500);
  const [editorHeight, setEditorHeight] = useState(800);
  const [isDraggingWidth, setIsDraggingWidth] = useState(false);
  const [isDraggingHeight, setIsDraggingHeight] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const internalEditorRef = useRef<any>(null);
  const internalMonacoRef = useRef<any>(null);
  const editorRef = externalEditorRef || internalEditorRef;
  const monacoRef = externalMonacoRef || internalMonacoRef;
  
  const decorationsRef = useRef<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const codeActionRef = useRef<any>(null);

  const { fixError } = useAiErrorFix(editorRef, monacoRef, language, setCode);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEditorWidth(Math.max(500, window.innerWidth * 0.4));
      setEditorHeight(window.innerHeight - 32);
    }
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    if (activeLine !== undefined) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [{
        range: new monaco.Range(activeLine, 1, activeLine, 1),
        options: {
          isWholeLine: true,
          className: 'monaco-active-line',
          linesDecorationsClassName: 'monaco-active-line-gutter'
        }
      }]);
      editor.revealLineInCenter(activeLine);
    } else {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }
  }, [activeLine]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingWidth) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 300 && newWidth < window.innerWidth - 50) {
          setEditorWidth(newWidth);
        }
      } else if (isDraggingHeight) {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight > 200 && newHeight < window.innerHeight - 20) {
          setEditorHeight(newHeight);
        }
      }
    };
    const handleMouseUp = () => {
      setIsDraggingWidth(false);
      setIsDraggingHeight(false);
    };
    if (isDraggingWidth || isDraggingHeight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingWidth, isDraggingHeight]);

  // Sync initialCode prop
  useEffect(() => { setCode(initialCode); }, [initialCode]);

  // Run lint / syntax check after each edit (debounced)
  const runDiagnostics = useCallback((currentCode: string, currentLanguage: string) => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;

    const model = editor.getModel();
    if (!model) return;

    // For JS/TS Monaco provides built-in diagnostics automatically.
    // For Python we do a lightweight heuristic check here.
    // In production, wire up a real language server (Pyright, Pylsp).
    const markers: any[] = [];

    if (currentLanguage === 'python') {
      const lines = currentCode.split('\n');
      lines.forEach((line, i) => {
        // Detect common Python mistakes heuristically
        const checks = [
          { pattern: /^\s*print\s+[^(]/, message: 'SyntaxError: Missing parentheses in call to print' },
          { pattern: /=={1}(?!=)\s*(True|False|None)/, message: 'Hint: Use "is" instead of "==" for True/False/None comparisons' },
          { pattern: /except\s*:/, message: 'Warning: Bare except clause — consider catching specific exceptions' },
        ];
        checks.forEach(({ pattern, message }) => {
          if (pattern.test(line)) {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber: i + 1,
              endLineNumber: i + 1,
              startColumn: 1,
              endColumn: line.length + 1,
              message,
              source: 'AI Lint',
            });
          }
        });
      });
    }

    monaco.editor.setModelMarkers(model, 'ai-lint', markers);
    setErrorCount(markers.filter((m: any) => m.severity === monaco.MarkerSeverity.Error).length);
  }, []);

  const handleCodeChange = useCallback((val: string) => {
    setCode(val);
    if (onChangeCode) {
      onChangeCode(val);
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runDiagnostics(val, language);
    }, 800);
  }, [language, runDiagnostics, onChangeCode]);

  // Register the "Fix with AI" code action (lightbulb)
  const registerCodeActions = useCallback(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;

    // Dispose previous registration to avoid duplicates
    codeActionRef.current?.dispose();

    codeActionRef.current = monaco.languages.registerCodeActionProvider('*', {
      provideCodeActions(model: any, _range: any, context: any) {
        if (!context.markers.length) return { actions: [], dispose: () => {} };

        const actions = context.markers.map((marker: any) => ({
          title: `Fix with AI: "${marker.message.slice(0, 50)}${marker.message.length > 50 ? '…' : ''}"`,
          kind: 'quickfix',
          isPreferred: true,
          diagnostics: [marker],
          command: {
            id: 'ai.fix.error',
            title: 'Fix with AI',
            arguments: [marker, model.getValue()],
          },
        }));

        return { actions, dispose: () => {} };
      }
    });

    // Register the command that the action triggers
    monaco.editor.addCommand({
      id: 'ai.fix.error',
      run: (_ctx: any, marker: any, fullCode: string) => {
        fixError(marker, fullCode);
      }
    });
  }, [fixError]);

  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define transparent themes
    monaco.editor.defineTheme('transparentThemeLight', {
      base: 'vs', inherit: true, rules: [],
      colors: {
        'editor.background': '#00000000',
        'editor.lineHighlightBackground': '#00000000',
        'editorLineNumber.background': '#00000000',
        'editorGutter.background': '#00000000',
      }
    });
    monaco.editor.defineTheme('transparentThemeDark', {
      base: 'vs-dark', inherit: true, rules: [],
      colors: {
        'editor.background': '#00000000',
        'editor.lineHighlightBackground': '#00000000',
        'editorLineNumber.background': '#00000000',
        'editorGutter.background': '#00000000',
      }
    });

    // CSS for the AI-fixing line animation
    const style = document.createElement('style');
    style.textContent = `
      .ai-fixing-line {
        background: rgba(99, 102, 241, 0.08) !important;
        animation: ai-pulse 1s ease-in-out infinite;
      }
      @keyframes ai-pulse {
        0%, 100% { background: rgba(99, 102, 241, 0.08) !important; }
        50%       { background: rgba(99, 102, 241, 0.18) !important; }
      }
      .ai-fixing-glyph::before {
        content: '✦';
        color: #6366f1;
        font-size: 12px;
        animation: ai-spin 1s linear infinite;
        display: inline-block;
      }
      @keyframes ai-spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);

    registerCodeActions();

    // Run initial diagnostics if code is pre-populated
    if (initialCode) runDiagnostics(initialCode, language);
  }, [registerCodeActions, runDiagnostics, initialCode, language]);

  if (!isOpen) return null;

  const fileExtMap: Record<string, string> = {
    python: 'py', javascript: 'js', typescript: 'ts',
    cpp: 'cpp', java: 'java', rust: 'rs', go: 'go',
    c: 'c', html: 'html',
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/20 z-40 transition-opacity ${isMaximized ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMaximized(false)}
      />

      <div 
        className={`
          flex flex-col shadow-2xl ease-in-out z-50 font-sans backdrop-blur-xl
          ${isDarkMode ? 'bg-[#050505]/95 border-gray-800' : 'bg-white/95 border-gray-200'}
          ${(!isDraggingWidth && !isDraggingHeight) ? 'transition-all duration-300' : ''}
          ${isMaximized 
            ? 'fixed inset-0 md:inset-4 md:rounded-2xl' 
            : 'fixed bottom-0 left-0 right-0 top-[env(safe-area-inset-top,2rem)] rounded-t-2xl md:top-auto md:relative md:rounded-2xl md:ml-2 md:w-[var(--editor-width)] md:self-end'
          }
          border overflow-hidden
        `}
        style={{
          ...(!isMaximized ? { 
            '--editor-width': `${editorWidth}px`,
            height: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${editorHeight}px` : undefined
          } : {})
        } as React.CSSProperties}
      >
        {!isMaximized && (
          <>
            <div
              className="hidden md:block absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-indigo-500/50 z-50 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDraggingWidth(true);
              }}
            />
            <div
              className="absolute top-0 left-0 right-0 h-2 cursor-row-resize hover:bg-indigo-500/50 z-50 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDraggingHeight(true);
              }}
            />
          </>
        )}
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 bg-transparent border-b cursor-default select-none ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F]"></div>
            </div>
            <div className={`flex items-center gap-2 text-[13px] font-bold px-3 py-1.5 rounded-md border shadow-sm ${isDarkMode ? 'text-gray-300 bg-gray-800 border-gray-700' : 'text-gray-700 bg-gray-100 border-gray-200'}`}>
              <Terminal size={14} />
              <span>main.{fileExtMap[language] ?? 'txt'}</span>
            </div>

            {/* Error badge */}
            {errorCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-500 text-xs font-semibold rounded-md border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                {errorCount} error{errorCount > 1 ? 's' : ''} — click lightbulb to fix
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {onRunCode && (
              <button 
                onClick={() => onRunCode(code, language)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-white/70 text-white text-xs font-bold rounded-md shadow-sm transition-colors"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                {isLoading ? 'Running...' : 'Run Code'}
              </button>
            )}
            <button 
              onClick={() => setIsMaximized(!isMaximized)} 
              className={`w-8 h-8 flex items-center justify-center bg-transparent rounded-md border transition-all duration-200 ${isDarkMode ? 'text-gray-400 hover:text-gray-100 border-gray-700 hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 border-gray-200 hover:bg-gray-100'}`}
              title={isMaximized ? "Minimize" : "Maximize"}
            >
              {isMaximized ? <Minimize2 size={14} strokeWidth={2.5} /> : <Maximize2 size={14} strokeWidth={2.5} />}
            </button>
            <button 
              onClick={onClose} 
              className={`w-8 h-8 flex items-center justify-center bg-transparent rounded-md border transition-all duration-200 ${isDarkMode ? 'text-gray-400 hover:text-gray-100 border-gray-700 hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 border-gray-200 hover:bg-gray-100'}`}
              title="Close Editor"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        
        {/* Editor Area */}
        <div className="flex-1 w-full relative bg-transparent">
          <Editor
            height="100%"
            language={language}
            theme={isDarkMode ? "transparentThemeDark" : "transparentThemeLight"}
            onMount={handleEditorMount}
            value={code}
            onChange={(val) => handleCodeChange(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              smoothScrolling: true,
              cursorBlinking: "smooth",
              lineNumbersMinChars: 3,
              lightbulb: { enabled: true },    // show the lightbulb icon
              quickSuggestions: true,
              glyphMargin: true,               // needed for glyph decorations
            }}
            loading={
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Loading editor...
              </div>
            }
          />
        </div>
      </div>
    </>
  );
}
