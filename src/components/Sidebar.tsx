import React from 'react';
import { Plus, Search, Compass, LayoutGrid, History, Moon, Sun, Settings } from 'lucide-react';

interface SidebarProps {
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export function Sidebar({ isDarkMode, toggleDarkMode }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-16 sm:w-20 hover:w-64 flex-col items-start py-4 z-20 bg-transparent transition-all duration-300 group overflow-hidden shrink-0">
        <div className="mb-8 px-2 sm:px-4 w-full flex justify-center group-hover:justify-start">
          {/* New Chat Button */}
          <button className="w-12 h-12 shrink-0 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center text-white dark:text-gray-900 shadow-sm hover:bg-gray-800 dark:hover:bg-white transition-all duration-200">
            <Plus size={24} strokeWidth={2.5} />
          </button>
          <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium text-gray-900 dark:text-gray-100 self-center">New Chat</span>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1 w-full px-2 sm:px-4">
          {/* Search Button */}
          <button className="w-12 h-12 group-hover:w-full shrink-0 rounded-full flex items-center justify-center group-hover:justify-start group-hover:px-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
            <Search size={20} strokeWidth={2.5} className="shrink-0" />
            <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">Search</span>
          </button>
          
          {/* Discover/Explore Button */}
          <button className="w-12 h-12 group-hover:w-full shrink-0 rounded-full flex items-center justify-center group-hover:justify-start group-hover:px-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
            <Compass size={20} strokeWidth={2.5} className="shrink-0" />
            <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">Discover</span>
          </button>
          
          {/* Workspaces/Projects Button */}
          <button className="w-12 h-12 group-hover:w-full shrink-0 rounded-full flex items-center justify-center group-hover:justify-start group-hover:px-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
            <LayoutGrid size={20} strokeWidth={2.5} className="shrink-0" />
            <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">Workspaces</span>
          </button>
          
          {/* Chat History Button */}
          <button className="w-12 h-12 group-hover:w-full shrink-0 rounded-full flex items-center justify-center group-hover:justify-start group-hover:px-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
            <History size={20} strokeWidth={2.5} className="shrink-0" />
            <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">History</span>
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-2 w-full px-2 sm:px-4">
          {toggleDarkMode && (
            /* Dark Mode Toggle Button */
            <button 
              onClick={toggleDarkMode}
              className="w-12 h-12 group-hover:w-full shrink-0 rounded-full flex items-center justify-center group-hover:justify-start group-hover:px-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} strokeWidth={2.5} className="shrink-0" /> : <Moon size={20} strokeWidth={2.5} className="shrink-0" />}
              <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          )}
          
          {/* Settings Button */}
          <button className="w-12 h-12 group-hover:w-full shrink-0 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center group-hover:justify-start group-hover:px-3 text-white dark:text-gray-900 shadow-sm hover:bg-gray-800 dark:hover:bg-white transition-all duration-200">
            <Settings size={20} strokeWidth={2.5} className="shrink-0" />
            <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#fcfcfc]/90 dark:bg-[#050505]/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex justify-around items-center h-16 z-40 px-2 pb-safe shadow-lg">
        <button className="p-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <Search size={24} strokeWidth={2.5} />
        </button>
        <button className="p-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <Compass size={24} strokeWidth={2.5} />
        </button>
        <div className="relative -top-5">
          <button className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition-all duration-200 border-4 border-gray-50 dark:border-gray-900">
            <Plus size={28} strokeWidth={2.5} />
          </button>
        </div>
        {toggleDarkMode && (
          <button 
            onClick={toggleDarkMode}
            className="p-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {isDarkMode ? <Sun size={24} strokeWidth={2.5} /> : <Moon size={24} strokeWidth={2.5} />}
          </button>
        )}
        <button className="p-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <History size={24} strokeWidth={2.5} />
        </button>
      </nav>
    </>
  );
}
