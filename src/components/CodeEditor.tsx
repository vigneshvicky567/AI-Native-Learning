import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { X, Minimize2, Maximize2, Terminal } from 'lucide-react';

interface CodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CodeEditor({ isOpen, onClose }: CodeEditorProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/20 z-40 transition-opacity ${isMaximized ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMaximized(false)}
      />

      <div className={`
        flex flex-col bg-[#1E1E1E] shadow-2xl transition-all duration-300 ease-in-out z-50
        ${isMaximized 
          ? 'fixed inset-0 md:inset-4 md:rounded-2xl' 
          : 'fixed bottom-0 left-0 right-0 h-[60vh] rounded-t-2xl md:relative md:h-auto md:w-[350px] lg:w-[450px] md:rounded-[2rem] md:ml-2'
        }
        border border-gray-800 overflow-hidden
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-gray-800 cursor-default select-none">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium bg-[#1E1E1E] px-2 py-1 rounded-md">
              <Terminal size={12} />
              <span>main.py</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMaximized(!isMaximized)} 
              className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
              title={isMaximized ? "Minimize" : "Maximize"}
            >
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
              title="Close Editor"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        {/* Editor Area */}
        <div className="flex-1 w-full relative bg-[#1E1E1E]">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            defaultValue="# Write your Python code here&#10;def hello_world():&#10;    print('Hello, AI Learner!')&#10;&#10;hello_world()"
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
