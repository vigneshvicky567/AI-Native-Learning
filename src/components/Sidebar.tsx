import React from 'react';
import { Plus, Search, Compass, LayoutGrid, History } from 'lucide-react';

export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-16 sm:w-20 flex-col items-center py-6 z-20 bg-white/20 backdrop-blur-sm border-r border-white/40">
        <div className="mb-8">
          <button className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-blue-700 transition-all duration-200">
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>
        
        <nav className="flex flex-col gap-5 flex-1">
          <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-all duration-200">
            <Search size={20} strokeWidth={2.5} />
          </button>
          <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-all duration-200">
            <Compass size={20} strokeWidth={2.5} />
          </button>
          <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-all duration-200">
            <LayoutGrid size={20} strokeWidth={2.5} />
          </button>
          <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-all duration-200">
            <History size={20} strokeWidth={2.5} />
          </button>
        </nav>

        <div className="mt-auto">
          <button className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-sm hover:bg-gray-800 transition-all duration-200">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 6.5L7.5 17.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 6.5L16.5 17.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-md border-t border-white/60 flex justify-around items-center h-16 z-40 px-2 pb-safe shadow-lg">
        <button className="p-3 text-gray-500 hover:text-blue-600 transition-colors">
          <Search size={24} strokeWidth={2.5} />
        </button>
        <button className="p-3 text-gray-500 hover:text-blue-600 transition-colors">
          <Compass size={24} strokeWidth={2.5} />
        </button>
        <div className="relative -top-5">
          <button className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition-all duration-200 border-4 border-gray-50">
            <Plus size={28} strokeWidth={2.5} />
          </button>
        </div>
        <button className="p-3 text-gray-500 hover:text-blue-600 transition-colors">
          <LayoutGrid size={24} strokeWidth={2.5} />
        </button>
        <button className="p-3 text-gray-500 hover:text-blue-600 transition-colors">
          <History size={24} strokeWidth={2.5} />
        </button>
      </nav>
    </>
  );
}
