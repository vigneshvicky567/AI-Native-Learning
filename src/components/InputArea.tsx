import React, { useState } from 'react';
import { Plus, Mic, ArrowUp, Search, MoreHorizontal, ChevronDown, Box, AudioLines, MousePointer2, Upload, Link2, Copy } from 'lucide-react';

interface InputAreaProps {
  onSubmit?: (text: string) => void;
  isLoading?: boolean;
}

export function InputArea({ onSubmit, isLoading }: InputAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleSubmit = () => {
    if (inputText.trim() && !isLoading && onSubmit) {
      onSubmit(inputText);
      setInputText('');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative font-sans">
      <div 
        className={`bg-white rounded-2xl shadow-sm border border-gray-200 transition-all duration-300 flex flex-col ${isDragging ? 'border-blue-500 border-dashed bg-blue-50 scale-[1.02]' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
      >
        {isDragging ? (
           <div className="flex flex-col items-center justify-center py-12 text-center">
             <p className="text-blue-600 font-bold text-xl mb-2">Drop anything here or browse</p>
             <p className="text-blue-600/70 text-sm mb-6 font-medium">Docs, images, videos, audio files, links &amp; more</p>
             <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm animate-bounce"><Upload size={20} strokeWidth={2.5} /></div>
                <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-sm animate-bounce" style={{animationDelay: '0.1s'}}><Mic size={20} strokeWidth={2.5} /></div>
                <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-sm animate-bounce" style={{animationDelay: '0.2s'}}><Link2 size={20} strokeWidth={2.5} /></div>
             </div>
           </div>
        ) : (
          <div className="p-3">
            <div className="px-5 py-4 flex items-center gap-3 overflow-x-auto no-scrollbar">
              {inputText === '' && (
                <div className="flex-shrink-0 flex items-center gap-2 bg-gray-50 text-gray-900 px-3 py-1.5 rounded-full text-sm font-bold border border-gray-200 shadow-sm">
                  <span className="text-gray-500 font-normal">@</span>
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" fill="currentColor"/>
                      <rect x="3" y="6" width="12" height="12" rx="2" fill="currentColor"/>
                    </svg>
                  </div>
                  <span className="truncate max-w-[140px] text-[14px]">React Hooks Guide</span>
                  <span className="text-gray-500 ml-1 text-[13px] font-medium">Today</span>
                </div>
              )}
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                placeholder={inputText === '' ? "What do you want to learn today?" : "Ask a follow-up. Use @ to tag notes or files."} 
                className="flex-1 min-w-[200px] bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-500 text-[16px] font-medium"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between px-3 pb-2 pt-3">
              {/* Left Actions */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full text-gray-500 hover:text-blue-600 bg-white hover:bg-gray-50 transition-all duration-200">
                  <Plus size={22} strokeWidth={2.5} />
                </button>
                
                <button className="flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm font-bold text-gray-700 hover:text-blue-600 hover:bg-gray-50 whitespace-nowrap transition-all duration-200 border border-gray-200">
                  <Box size={16} strokeWidth={2.5} />
                  Tutor: LearnAI
                  <ChevronDown size={16} className="text-gray-500" strokeWidth={2.5} />
                </button>
                
                <div className="flex items-center gap-1.5 ml-2">
                  <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-pink-500 bg-white hover:bg-gray-50 rounded-full transition-all duration-200"><AudioLines size={18} strokeWidth={2.5} /></button>
                  <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-blue-500 bg-white hover:bg-gray-50 rounded-full transition-all duration-200"><Search size={18} strokeWidth={2.5} /></button>
                  <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-purple-500 bg-white hover:bg-gray-50 rounded-full transition-all duration-200"><MousePointer2 size={18} strokeWidth={2.5} /></button>
                  <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-full transition-all duration-200"><MoreHorizontal size={18} strokeWidth={2.5} /></button>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-3 pl-3 flex-shrink-0">
                <button className="w-12 h-12 flex items-center justify-center rounded-full text-gray-500 hover:text-pink-500 bg-white hover:bg-gray-50 transition-all duration-200 border border-gray-200">
                  <Mic size={20} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-white transition-all duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-sm'}`}
                >
                  <ArrowUp size={22} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
