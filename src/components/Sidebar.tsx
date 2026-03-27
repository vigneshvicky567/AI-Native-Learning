import React from 'react';
import { Plus, Search, Compass, LayoutGrid, History } from 'lucide-react';

export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-14 sm:w-16 flex-col items-center py-4 z-20">
        <div className="mb-6">
          <button className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1C1C28] rounded-full flex items-center justify-center text-white shadow-md hover:bg-black transition-colors">
            <Plus size={20} />
          </button>
        </div>
        
        <nav className="flex flex-col gap-3 flex-1">
          <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors bg-white shadow-sm hover:shadow-md">
            <Search size={18} />
          </button>
          <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors bg-white shadow-sm hover:shadow-md">
            <Compass size={18} />
          </button>
          <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors bg-white shadow-sm hover:shadow-md">
            <LayoutGrid size={18} />
          </button>
          <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors bg-white shadow-sm hover:shadow-md">
            <History size={18} />
          </button>
        </nav>

        <div className="mt-auto">
          <button className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1C1C28] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md hover:scale-105 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 6.5L7.5 17.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 6.5L16.5 17.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-16 z-40 px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button className="p-3 text-gray-400 hover:text-gray-900 transition-colors">
          <Search size={22} />
        </button>
        <button className="p-3 text-gray-400 hover:text-gray-900 transition-colors">
          <Compass size={22} />
        </button>
        <div className="relative -top-5">
          <button className="w-12 h-12 bg-[#1C1C28] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-black transition-colors border-4 border-[#EAEAF2]">
            <Plus size={24} />
          </button>
        </div>
        <button className="p-3 text-gray-400 hover:text-gray-900 transition-colors">
          <LayoutGrid size={22} />
        </button>
        <button className="p-3 text-gray-400 hover:text-gray-900 transition-colors">
          <History size={22} />
        </button>
      </nav>
    </>
  );
}
