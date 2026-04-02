import React from 'react';

export function Cards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative w-full max-w-4xl mx-auto px-2 font-sans">
      {/* Card 1 */}
      <div className="bg-transparent p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col h-[220px] hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group">
        <div className="mb-4 w-14 h-14 rounded-xl bg-pink-50/80 dark:bg-pink-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          {/* Stacked Layers Icon */}
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 12L8 18L20 24L32 18L20 12Z" fill="#DB2777"/>
            <path d="M8 22L20 28L32 22" stroke="#DB2777" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 26L20 32L32 26" stroke="#DB2777" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed mb-auto font-medium">
          Start your journey into programming with interactive Python lessons.
        </p>
        <span className="text-[13px] text-gray-500 dark:text-gray-400 font-bold mt-4 uppercase tracking-wider">Python</span>
      </div>

      {/* Card 2 - Staggered down */}
      <div className="bg-transparent p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col h-[220px] mt-0 md:mt-8 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group">
        <div className="mb-4 w-14 h-14 rounded-xl bg-purple-50/80 dark:bg-purple-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          {/* Generic Book/Study Icon */}
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="10" width="28" height="20" rx="4" fill="#7C3AED" fillOpacity="0.2" stroke="#7C3AED" strokeWidth="2"/>
            <path d="M14 16H26" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
            <path d="M14 22H22" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed mb-auto font-medium">
          Dive deep into limits, derivatives, and integrals with AI-guided problem solving.
        </p>
        <span className="text-[13px] text-gray-500 dark:text-gray-400 font-bold mt-4 uppercase tracking-wider">Calculus</span>
      </div>

      {/* Card 3 */}
      <div className="bg-transparent p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col h-[220px] mt-6 md:mt-0 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group relative">
        
        {/* Robot Character */}
        <div className="absolute -top-[80px] right-0 z-10 animate-bounce pointer-events-none scale-[0.7] origin-bottom-right">
          <div className="relative">
            {/* Speech Bubble */}
            <div className="absolute -top-6 -right-10 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-md text-sm font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap border border-gray-200 dark:border-gray-700 z-20">
              Hey there! 👋<br/><span className="text-blue-600 dark:text-blue-400">Need a boost?</span>
              <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 transform rotate-45"></div>
            </div>
            
            {/* Robot SVG */}
            <svg width="120" height="120" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Body/Base */}
              <path d="M45 110 C 45 90, 95 90, 95 110 L 105 130 C 105 140, 35 140, 35 130 Z" fill="#E2E8F0"/>
              <path d="M48 110 C 48 95, 92 95, 92 110 L 100 128 C 100 135, 40 135, 40 128 Z" fill="#F8FAFC"/>
              
              {/* Neck */}
              <rect x="60" y="85" width="20" height="15" fill="#CBD5E1"/>
              
              {/* Head */}
              <rect x="40" y="40" width="60" height="50" rx="25" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2"/>
              
              {/* Face Screen */}
              <rect x="46" y="46" width="48" height="38" rx="16" fill="#1f2937"/>
              
              {/* Eyes */}
              <path d="M56 60 Q 60 55 64 60" stroke="#0EA5E9" strokeWidth="4" strokeLinecap="round"/>
              <path d="M76 60 Q 80 55 84 60" stroke="#0EA5E9" strokeWidth="4" strokeLinecap="round"/>
              
              {/* Mouth */}
              <path d="M66 70 Q 70 76 74 70" fill="#0EA5E9"/>
              
              {/* Left Arm & Hand */}
              <path d="M35 95 Q 20 100 25 115" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round"/>
              <rect x="18" y="115" width="14" height="20" rx="7" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" transform="rotate(-15 25 115)"/>
              <path d="M22 125 L 28 125" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round"/>
              
              {/* Right Arm & Hand */}
              <path d="M105 95 Q 120 100 115 115" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round"/>
              <rect x="108" y="115" width="14" height="20" rx="7" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" transform="rotate(15 115 115)"/>
              <path d="M112 125 L 118 125" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="mb-4 w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          {/* Generic Calendar Icon */}
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="10" width="24" height="24" rx="4" fill="#0EA5E9" fillOpacity="0.2" stroke="#0EA5E9" strokeWidth="2"/>
            <path d="M8 18H32" stroke="#0EA5E9" strokeWidth="2"/>
            <path d="M14 6V14" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round"/>
            <path d="M26 6V14" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="16" cy="24" r="2" fill="#0EA5E9"/>
            <circle cx="24" cy="24" r="2" fill="#0EA5E9"/>
          </svg>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed mb-auto font-medium">
          Organize your time efficiently, set clear priorities, and stay focused.
        </p>
        <span className="text-[13px] text-gray-500 dark:text-gray-400 font-bold mt-4 uppercase tracking-wider">Planning</span>
      </div>
    </div>
  );
}
