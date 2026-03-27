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
      <div className="flex items-center gap-2 text-gray-600 font-medium w-24">
        {/* Logo removed as requested */}
      </div>
      
      <div className="text-[13px] font-semibold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
        Daily Learner
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleEditor}
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${isEditorOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          title="Toggle Code Editor"
        >
          <Code2 size={16} />
        </button>
        <button 
          onClick={onOpenCheckpoints}
          className="flex items-center gap-1.5 bg-[#1C1C28] text-white px-3 sm:px-4 py-2 rounded-full text-xs font-medium hover:bg-black transition-colors"
        >
          <CheckSquare size={14} className="text-gray-300" />
          <span className="hidden sm:inline">Checkpoints</span>
        </button>
      </div>
    </header>
  );
}
