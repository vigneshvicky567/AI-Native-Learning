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
      
      <div className="text-[15px] font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-white/60">
        Daily Learner
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleEditor}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-sm border hover:bg-white/80 ${isEditorOpen ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'bg-white/60 backdrop-blur-md border-white/60 text-gray-500 hover:text-blue-600'}`}
          title="Toggle Code Editor"
        >
          <Code2 size={20} strokeWidth={2.5} />
        </button>
        <button 
          onClick={onOpenCheckpoints}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-gray-800 transition-all duration-200"
        >
          <CheckSquare size={18} className="text-white/80" strokeWidth={2.5} />
          <span className="hidden sm:inline">Checkpoints</span>
        </button>
      </div>
    </header>
  );
}
