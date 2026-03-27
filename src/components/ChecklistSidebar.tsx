import React from 'react';
import { X, CheckCircle2, Circle } from 'lucide-react';

interface ChecklistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChecklistSidebar({ isOpen, onClose }: ChecklistSidebarProps) {
  const tasks = [
    { id: 1, title: 'Complete Python Basics', completed: true },
    { id: 2, title: 'Review Calculus Limits', completed: false },
    { id: 3, title: 'Read World History Ch. 4', completed: false },
    { id: 4, title: 'Practice Coding Exercises', completed: false },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Checkpoints</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors p-1 rounded-md hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id} className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                  {task.completed ? (
                    <CheckCircle2 className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                  ) : (
                    <Circle className="text-gray-300 mt-0.5 flex-shrink-0" size={16} />
                  )}
                  <div>
                    <p className={`text-xs font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {task.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-auto pt-5 border-t border-gray-100">
            <div className="bg-indigo-50 rounded-xl p-3.5">
              <p className="text-xs text-indigo-800 font-medium">1/4 Checkpoints completed</p>
              <div className="w-full bg-indigo-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
