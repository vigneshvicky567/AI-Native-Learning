import React from 'react';
import { X, CheckCircle2, Circle } from 'lucide-react';

interface ChecklistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  checkpoints?: any[];
  onToggleCheckpoint?: (id: number) => void;
}

export function ChecklistSidebar({ isOpen, onClose, checkpoints = [], onToggleCheckpoint }: ChecklistSidebarProps) {
  const completedCount = checkpoints.filter(c => c.completed).length;
  const totalCount = checkpoints.length;
  const progressPercentage = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#fcfcfc]/95 dark:bg-[#050505]/95 backdrop-blur-xl shadow-xl border-l border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-300 ease-in-out font-sans ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col bg-transparent">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Checkpoints</h2>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-700 shadow-sm">
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="space-y-4">
              {checkpoints.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 text-sm text-center mt-10">
                  No checkpoints yet. Ask me to teach you something in Learn Mode!
                </div>
              ) : (
                checkpoints.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => onToggleCheckpoint && onToggleCheckpoint(task.id)}
                    className="flex items-start gap-3 p-4 bg-transparent rounded-2xl border border-gray-200 dark:border-gray-800 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" size={20} strokeWidth={2.5} />
                    ) : (
                      <Circle className="text-gray-400 dark:text-gray-600 mt-0.5 flex-shrink-0" size={20} strokeWidth={2.5} />
                    )}
                    <div>
                      <p className={`text-[15px] font-bold ${task.completed ? 'text-gray-500 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                        {task.title}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="mt-auto pt-6">
            <div className="bg-transparent rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
              <p className="text-[14px] text-gray-900 dark:text-gray-100 font-bold mb-3">{completedCount}/{totalCount} Checkpoints completed</p>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
