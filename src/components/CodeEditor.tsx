import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { X, Minimize2, Maximize2, Terminal, Play, Loader2 } from 'lucide-react';

interface CodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  language?: string;
  onRunCode?: (code: string, language: string) => void;
  isLoading?: boolean;
  isDarkMode?: boolean;
}

export function CodeEditor({ isOpen, onClose, initialCode = '', language = 'python', onRunCode, isLoading, isDarkMode = false }: CodeEditorProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [editorWidth, setEditorWidth] = useState(typeof window !== 'undefined' ? Math.max(600, window.innerWidth * 0.4) : 600);
  const [editorHeight, setEditorHeight] = useState(typeof window !== 'undefined' ? window.innerHeight - 24 : 800);
  const [isDraggingWidth, setIsDraggingWidth] = useState(false);
  const [isDraggingHeight, setIsDraggingHeight] = useState(false);

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
      document.body.style.userSelect = '';
    };
  }, [isDraggingWidth, isDraggingHeight]);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  if (!isOpen) return null;

  const handleRun = () => {
    if (onRunCode) {
      onRunCode(code, language);
    }
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
          flex flex-col shadow-2xl ease-in-out z-50 font-sans bg-[#fcfcfc]/95 dark:bg-[#050505]/95 backdrop-blur-xl
          ${(!isDraggingWidth && !isDraggingHeight) ? 'transition-all duration-300' : ''}
          ${isMaximized 
            ? 'fixed inset-0 md:inset-4 md:rounded-2xl' 
            : 'fixed bottom-0 left-0 right-0 rounded-t-2xl md:relative md:rounded-2xl md:ml-2 md:w-[var(--editor-width)] md:self-end'
          }
          border border-gray-200 dark:border-gray-800 overflow-hidden
        `}
        style={{
          ...(!isMaximized ? { 
            '--editor-width': `${editorWidth}px`,
            height: `${editorHeight}px`
          } : {})
        } as React.CSSProperties}
      >
        {!isMaximized && (
          <>
            <div
              className="hidden md:block absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/50 z-50 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDraggingWidth(true);
              }}
            />
            <div
              className="absolute top-0 left-0 right-0 h-2 cursor-row-resize hover:bg-blue-500/50 z-50 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDraggingHeight(true);
              }}
            />
          </>
        )}
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-transparent border-b border-gray-200 dark:border-gray-800 cursor-default select-none">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F]"></div>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-700 dark:text-gray-300 font-bold bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <Terminal size={14} />
              <span>main.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'txt'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onRunCode && (
              <button 
                onClick={handleRun}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:text-white/70 text-white text-xs font-bold rounded-md shadow-sm transition-colors"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                {isLoading ? 'Running...' : 'Run Code'}
              </button>
            )}
            <button 
              onClick={() => setIsMaximized(!isMaximized)} 
              className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-transparent rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              title={isMaximized ? "Minimize" : "Maximize"}
            >
              {isMaximized ? <Minimize2 size={14} strokeWidth={2.5} /> : <Maximize2 size={14} strokeWidth={2.5} />}
            </button>
            <button 
              onClick={onClose} 
              className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-transparent rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
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
            theme={isDarkMode ? 'transparentThemeDark' : 'transparentTheme'}
            beforeMount={(monaco) => {
              monaco.editor.defineTheme('transparentTheme', {
                base: 'vs',
                inherit: true,
                rules: [],
                colors: {
                  'editor.background': '#00000000',
                  'editor.lineHighlightBackground': '#00000000',
                  'editorLineNumber.background': '#00000000',
                  'editorGutter.background': '#00000000',
                }
              });
              monaco.editor.defineTheme('transparentThemeDark', {
                base: 'vs-dark',
                inherit: true,
                rules: [],
                colors: {
                  'editor.background': '#00000000',
                  'editor.lineHighlightBackground': '#00000000',
                  'editorLineNumber.background': '#00000000',
                  'editorGutter.background': '#00000000',
                }
              });
            }}
            value={code}
            onChange={(val) => setCode(val || '')}
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
