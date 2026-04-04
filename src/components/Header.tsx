import React from 'react';
import { CheckSquare, Code2 } from 'lucide-react';

interface HeaderProps {
  onOpenCheckpoints: () => void;
  onToggleEditor: () => void;
  isEditorOpen: boolean;
}

export function Header({ onOpenCheckpoints, onToggleEditor, isEditorOpen }: HeaderProps) {
  return (
    <header className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2 text-gray-500 font-medium w-24">
        {/* Logo removed as requested */}
      </div>
      
      <div className="text-[15px] font-bold text-gray-900 dark:text-gray-100 absolute left-1/2 transform -translate-x-1/2 px-4 py-1.5">
        Daily Learner
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleEditor}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 border hover:bg-gray-100 dark:hover:bg-gray-800 ${isEditorOpen ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700' : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
          title="Toggle Code Editor"
        >
          <Code2 size={20} strokeWidth={2.5} />
        </button>
        <button 
          onClick={onOpenCheckpoints}
          className="flex items-center justify-center sm:px-5 w-10 h-10 sm:w-auto sm:h-auto sm:py-2.5 bg-gray-900 dark:bg-gray-800 text-white rounded-full text-sm font-bold shadow-sm hover:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-200"
        >
          <CheckSquare size={18} className="text-white/80" strokeWidth={2.5} />
          <span className="hidden sm:inline sm:ml-2">Checkpoints</span>
        </button>
      </div>
    </header>
  );
}
