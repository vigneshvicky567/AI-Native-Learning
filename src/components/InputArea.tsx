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
    <div className="w-full max-w-3xl mx-auto relative">
      <div 
        className={`bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.06)] border transition-all duration-200 flex flex-col ${isDragging ? 'border-[#5B50FF] border-dashed bg-[#5B50FF]/5' : 'border-gray-100'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
      >
        {isDragging ? (
           <div className="flex flex-col items-center justify-center py-10 text-center">
             <p className="text-[#5B50FF] font-medium text-lg mb-1">Drop anything here or browse</p>
             <p className="text-[#5B50FF]/70 text-sm mb-5">Docs, images, videos, audio files, links &amp; more</p>
             <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5B50FF] flex items-center justify-center text-white shadow-md"><Upload size={18} /></div>
                <div className="w-10 h-10 rounded-full bg-[#5B50FF] flex items-center justify-center text-white shadow-md"><Mic size={18} /></div>
                <div className="w-10 h-10 rounded-full bg-[#5B50FF] flex items-center justify-center text-white shadow-md"><Link2 size={18} /></div>
                <div className="w-10 h-10 rounded-full bg-[#5B50FF] flex items-center justify-center text-white shadow-md"><Copy size={18} /></div>
             </div>
           </div>
        ) : (
          <div className="p-2">
            <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {inputText === '' && (
                <div className="flex-shrink-0 flex items-center gap-1.5 bg-gray-100/80 text-gray-700 px-2.5 py-1 rounded-full text-sm font-medium border border-gray-200/50">
                  <span className="text-gray-400 font-normal">@</span>
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" fill="currentColor"/>
                      <rect x="3" y="6" width="12" height="12" rx="2" fill="currentColor"/>
                    </svg>
                  </div>
                  <span className="truncate max-w-[140px] text-[13px]">Onboarding call wit...</span>
                  <span className="text-gray-400 ml-1 text-[13px] font-normal">Today</span>
                </div>
              )}
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                placeholder={inputText === '' ? "create a summary web page" : "Ask a follow-up. Use @ to tag docs or files."} 
                className="flex-1 min-w-[200px] bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-800 text-[15px] font-medium"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between px-2 pb-1 pt-2">
              {/* Left Actions */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <Plus size={20} />
                </button>
                
                <button className="flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap transition-colors shadow-sm">
                  <Box size={14} />
                  Tutor: GPT-5.2
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                
                <div className="flex items-center gap-0.5 ml-1">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"><AudioLines size={16} /></button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"><Search size={16} /></button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"><MousePointer2 size={16} /></button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"><MoreHorizontal size={16} /></button>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2 pl-2 flex-shrink-0">
                <button className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shadow-sm bg-white">
                  <Mic size={16} />
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-white transition-colors shadow-sm ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-[#5B50FF] hover:bg-indigo-700'}`}
                >
                  <ArrowUp size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
