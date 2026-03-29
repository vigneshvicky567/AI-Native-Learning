import React from 'react';
import { X, CheckCircle2, Circle } from 'lucide-react';

interface ChecklistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChecklistSidebar({ isOpen, onClose }: ChecklistSidebarProps) {
  // BACKEND ARCHITECTURE: Instead of hardcoding these tasks, you should fetch them from your database.
  // Example:
  // const [tasks, setTasks] = useState([]);
  // useEffect(() => {
  //   fetch('http://localhost:8000/api/progress')
  //     .then(res => res.json())
  //     .then(data => setTasks(data.tasks));
  // }, []);
  
  // You would also need a function to handle toggling a task:
  // const toggleTask = async (id, currentStatus) => {
  //   await fetch(`http://localhost:8000/api/progress/${id}`, {
  //     method: 'PUT',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ completed: !currentStatus })
  //   });
  //   // Then update local state
  // };

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
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white/60 backdrop-blur-md shadow-xl border-l border-white/60 z-50 transform transition-transform duration-300 ease-in-out font-sans ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col bg-transparent">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Checkpoints</h2>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/60 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white/80 transition-all duration-200 border border-white/60 shadow-sm">
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="space-y-4">
              {tasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-4 bg-white/60 rounded-2xl shadow-sm border border-white/60 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer">
                  {task.completed ? (
                    <CheckCircle2 className="text-blue-600 mt-0.5 flex-shrink-0" size={20} strokeWidth={2.5} />
                  ) : (
                    <Circle className="text-gray-400 mt-0.5 flex-shrink-0" size={20} strokeWidth={2.5} />
                  )}
                  <div>
                    <p className={`text-[15px] font-bold ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-auto pt-6">
            <div className="bg-white/60 rounded-2xl p-5 shadow-sm border border-white/60">
              <p className="text-[14px] text-gray-900 font-bold mb-3">1/4 Checkpoints completed</p>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
