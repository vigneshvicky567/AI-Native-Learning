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
        flex flex-col bg-[#1E1E1E] shadow-2xl transition-all duration-300 ease-in-out z-50 font-sans
        ${isMaximized 
          ? 'fixed inset-0 md:inset-4 md:rounded-2xl' 
          : 'fixed bottom-0 left-0 right-0 h-[60vh] rounded-t-2xl md:relative md:h-auto md:w-[350px] lg:w-[450px] md:rounded-2xl md:ml-2'
        }
        border border-gray-800 overflow-hidden
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#252526] border-b border-gray-800 cursor-default select-none">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F]"></div>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-300 font-bold bg-[#1E1E1E] px-3 py-1.5 rounded-md border border-gray-800">
              <Terminal size={14} />
              <span>main.py</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMaximized(!isMaximized)} 
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white bg-[#1E1E1E] rounded-md border border-gray-800 hover:bg-[#333] transition-all duration-200"
              title={isMaximized ? "Minimize" : "Maximize"}
            >
              {isMaximized ? <Minimize2 size={14} strokeWidth={2.5} /> : <Maximize2 size={14} strokeWidth={2.5} />}
            </button>
            <button 
              onClick={onClose} 
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white bg-[#1E1E1E] rounded-md border border-gray-800 hover:bg-[#333] transition-all duration-200"
              title="Close Editor"
            >
              <X size={16} strokeWidth={2.5} />
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
