import React from 'react';
import { Play, Sparkles, MessageSquare, Zap, Globe, BarChart3, CheckCircle2, ArrowRight, Moon, Sun } from 'lucide-react';

import RuixenMoonChat from './ui/ruixen-moon-chat';
import { Cards } from './Cards';
import { Greeting } from './Greeting';
import { Skeleton } from 'boneyard-js/react';

interface LandingPageProps {
  onStart: (prompt: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export function LandingPage({ onStart, isDarkMode, toggleDarkMode }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#050505] relative overflow-x-hidden flex flex-col font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none dark:hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-blue-200/40 to-purple-300/40 rounded-full mix-blend-multiply filter blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-indigo-300/40 to-blue-200/40 rounded-full mix-blend-multiply filter blur-[120px]"></div>
      </div>

      {/* Navbar */}
      <div className="absolute top-0 z-50 w-full bg-transparent transition-all duration-300">
        <header className="flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#5B50FF] rounded-sm transform rotate-45 flex items-center justify-center">
               <div className="w-3 h-3 bg-white rounded-sm transform -rotate-45"></div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Lexi AI.</span>
          </div>
          
          <nav className="hidden md:flex items-center bg-black/40 dark:bg-white/10 backdrop-blur-md rounded-full px-2 py-1.5 shadow-sm border border-white/10 dark:border-white/5">
            <a href="#" className="px-5 py-2 text-sm font-medium bg-white/10 dark:bg-white/20 rounded-full shadow-sm text-white">Home</a>
            <a href="#features" className="px-5 py-2 text-sm font-medium text-neutral-300 dark:text-neutral-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="px-5 py-2 text-sm font-medium text-neutral-300 dark:text-neutral-400 hover:text-white transition-colors">How it Works</a>
            <a href="#topics" className="px-5 py-2 text-sm font-medium text-neutral-300 dark:text-neutral-400 hover:text-white transition-colors">Topics</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={toggleDarkMode}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              {isDarkMode ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
            </button>
            <button onClick={() => onStart('Hello!')} className="bg-[#5B50FF] text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md">
              Start Learning
            </button>
          </div>
        </header>
      </div>

      {/* Hero Content */}
      <RuixenMoonChat onStart={onStart} />

      {/* Quick Start Section */}
      <section className="relative z-10 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Skeleton name="landing-greeting" loading={false}>
            <Greeting />
          </Skeleton>
          <Skeleton name="landing-cards" loading={false}>
            <Cards onSelect={onStart} />
          </Skeleton>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-16 md:py-24 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-white/60 dark:border-gray-800/60">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-[#1a1a2e] dark:text-white mb-4">Why choose Lexi AI?</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">Everything you need to accelerate your learning and master new skills efficiently.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-[#5B50FF] dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a2e] dark:text-white mb-3">Interactive Coding</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Practice coding directly in the browser with our built-in Monaco editor, getting real-time feedback from your AI tutor.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-[#5B50FF] dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                <Globe size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a2e] dark:text-white mb-3">Structured Learning</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Stay on track with AI-generated checklists and milestones that break down complex topics into manageable steps.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-[#5B50FF] dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a2e] dark:text-white mb-3">Personalized Pace</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Lexi AI adapts to your speed. It identifies your weak points and provides targeted exercises to strengthen your understanding.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="flex-1">
              <h2 className="text-3xl md:text-5xl font-serif text-[#1a1a2e] dark:text-white mb-6">Start learning in minutes</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-10">No setup required. Just tell the AI what you want to learn and dive right in.</p>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#5B50FF] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1a1a2e] dark:text-white mb-2">Set your goal</h4>
                    <p className="text-gray-600 dark:text-gray-400">Type in the topic, language, or framework you want to master.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#5B50FF] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1a1a2e] dark:text-white mb-2">Follow the plan</h4>
                    <p className="text-gray-600 dark:text-gray-400">Lexi AI generates a customized curriculum and interactive checklist for you.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#5B50FF] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1a1a2e] dark:text-white mb-2">Practice & Master</h4>
                    <p className="text-gray-600 dark:text-gray-400">Use the built-in code editor and chat interface to practice and ask questions.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-4 sm:p-6 rounded-[2.5rem] shadow-xl border border-white/80 dark:border-gray-700/80 relative">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70"></div>
                
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative z-10">
                  <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="w-10 h-10 bg-[#5B50FF] rounded-full flex items-center justify-center text-white">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h5 className="font-bold text-[#1a1a2e] dark:text-white">Lexi AI Tutor</h5>
                      <p className="text-xs text-green-500 font-medium">Online</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                      <p className="text-sm text-gray-700 dark:text-gray-300">Hi there! What would you like to learn today?</p>
                    </div>
                    <div className="bg-[#5B50FF] text-white rounded-2xl rounded-tr-none p-4 max-w-[85%] ml-auto">
                      <p className="text-sm">I want to learn React hooks, specifically useEffect.</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                      <p className="text-sm text-gray-700 dark:text-gray-300">Great choice! Let's start with the basics of side effects in React. I've created a checklist for us and opened the code editor so we can practice.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Topics Section */}
      <section id="topics" className="relative z-10 py-16 md:py-24 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-t border-white/60 dark:border-gray-800/60">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-[#1a1a2e] dark:text-white mb-4">Master any subject</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">From complex mathematics to conversational languages, Lexi AI adapts to your specific needs.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: 'Computer Science', prompt: 'I want to learn Computer Science. Let\'s start with an overview of the most important concepts.' },
              { name: 'Mathematics', prompt: 'I want to master Mathematics. Can we start with some fundamental algebra or calculus?' },
              { name: 'Languages', prompt: 'I want to learn a new language. How can AI help me practice conversation and grammar?' },
              { name: 'Sciences', prompt: 'I want to explore the Sciences. Let\'s start with some basic physics or chemistry concepts.' },
              { name: 'History', prompt: 'I want to learn about History. Can you give me an overview of a major historical event?' },
              { name: 'Literature', prompt: 'I want to dive into Literature. Let\'s analyze some classic works or literary movements.' },
              { name: 'Business', prompt: 'I want to learn about Business and Economics. Let\'s start with the basics of entrepreneurship.' },
              { name: 'Arts', prompt: 'I want to explore the Arts. Can we talk about art history or different creative techniques?' }
            ].map((topic, i) => (
              <div 
                key={i} 
                onClick={() => onStart(topic.prompt)}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-3xl shadow-clay-card border border-white/60 dark:border-gray-700/60 hover:-translate-y-1 hover:shadow-clay-surface transition-all duration-300 cursor-pointer text-center group"
              >
                <div className="w-12 h-12 mx-auto bg-indigo-50 dark:bg-indigo-900/30 text-[#5B50FF] dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles size={24} />
                </div>
                <h3 className="font-bold text-[#1a1a2e] dark:text-white">{topic.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Tools Section */}
      <section id="tools" className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16">
            <div className="flex-1">
              <h2 className="text-3xl md:text-5xl font-serif text-[#1a1a2e] dark:text-white mb-6">Tools built for understanding</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">Reading isn't enough. Lexi AI provides interactive environments to test your knowledge immediately.</p>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent-pink/10 dark:bg-pink-900/20 text-[#DB2777] dark:text-pink-400 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1a1a2e] dark:text-white mb-1">Smart Checklists</h4>
                    <p className="text-gray-600 dark:text-gray-400">Break down massive topics into bite-sized, achievable milestones.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 dark:bg-blue-900/20 text-[#0EA5E9] dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-1">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1a1a2e] dark:text-white mb-1">Progress Tracking</h4>
                    <p className="text-gray-600 dark:text-gray-400">Visualize your learning journey and see how far you've come.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="flex-1 w-full">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-4 sm:p-6 rounded-[2.5rem] shadow-clay-surface border border-white/80 dark:border-gray-700/80 relative">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-6 shadow-clay-card border border-white/60 dark:border-gray-800/60">
                  <h3 className="font-bold text-lg mb-4 text-[#1a1a2e] dark:text-white">Your Milestones</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item === 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                          <CheckCircle2 size={14} />
                        </div>
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full ${item === 1 ? 'bg-green-500 w-full' : item === 2 ? 'bg-[#5B50FF] w-1/2' : 'w-0'}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-16 md:py-24 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-t border-white/60 dark:border-gray-800/60">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-[#1a1a2e] dark:text-white mb-4">Loved by learners</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">See how Lexi AI is changing the way people master new skills.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah J.", role: "Computer Science Student", text: "The interactive code editor combined with the AI tutor helped me finally understand React hooks. It's like having a senior developer sitting next to me." },
              { name: "Michael T.", role: "Self-taught Designer", text: "I used Lexi AI to grasp color theory and typography. The structured checklists kept me focused instead of falling down YouTube rabbit holes." },
              { name: "Elena R.", role: "High School Teacher", text: "I recommend this to all my students for test prep. It adapts to their pace and explains concepts in ways that click for them individually." }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] shadow-clay-card border border-white/60 dark:border-gray-700/60 relative">
                <div className="text-[#5B50FF] dark:text-indigo-400 mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.017 21L16.439 16.09C16.852 15.158 17.058 14.181 17.058 13.159V3H24V13.159C24 15.8 23.341 18.225 22.022 20.434C20.704 22.643 18.91 24.368 16.641 25.609L14.017 21ZM0 21L2.422 16.09C2.835 15.158 3.041 14.181 3.041 13.159V3H10V13.159C10 15.8 9.341 18.225 8.022 20.434C6.704 22.643 4.91 24.368 2.641 25.609L0 21Z" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <h4 className="font-bold text-[#1a1a2e] dark:text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-[#1a1a2e] dark:text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Got questions? We've got answers.</p>
          </div>
          
          <div className="space-y-6">
            {[
              { q: "Do I need any prior knowledge to use Lexi AI?", a: "Not at all! Lexi AI is designed to adapt to your current skill level, whether you're a complete beginner or an advanced learner looking to fill knowledge gaps." },
              { q: "Can I use Lexi AI on my phone?", a: "Yes, Lexi AI is fully responsive and works great on mobile devices, tablets, and desktops." },
              { q: "What subjects does Lexi AI cover?", a: "Lexi AI can help you with a wide range of subjects, from programming and mathematics to history and literature. If there's information about it, Lexi AI can teach it." },
              { q: "How does the interactive code editor work?", a: "The built-in code editor allows you to write and execute code directly in your browser. Lexi AI can review your code, suggest improvements, and help you debug errors in real-time." }
            ].map((faq, i) => (
              <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-3xl shadow-clay-card border border-white/60 dark:border-gray-700/60">
                <h3 className="text-xl font-bold text-[#1a1a2e] dark:text-white mb-3">{faq.q}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[3rem] p-8 md:p-20 text-center shadow-clay-surface border border-white/80 dark:border-gray-700/80 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#DB2777]/20 dark:bg-[#DB2777]/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] pointer-events-none animate-clay-float"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#0EA5E9]/20 dark:bg-[#0EA5E9]/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] pointer-events-none animate-clay-float-delayed"></div>
            
            <h2 className="text-3xl md:text-6xl font-serif mb-6 relative z-10 text-[#1a1a2e] dark:text-white">Ready to accelerate your learning?</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 max-w-2xl mx-auto relative z-10">Join thousands of students using Lexi AI to master new skills and achieve their goals.</p>
            
            <button onClick={() => onStart('Hello!')} className="bg-[#5B50FF] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition-colors shadow-clay-button flex items-center gap-2 mx-auto relative z-10 hover:-translate-y-1 active:scale-95">
              Start Learning for Free
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-1 sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-[#5B50FF] rounded-sm transform rotate-45 flex items-center justify-center">
                   <div className="w-3 h-3 bg-white rounded-sm transform -rotate-45"></div>
                </div>
                <span className="text-2xl font-bold tracking-tight text-[#1a1a2e] dark:text-white">Lexi AI.</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">Master any subject with the world's most intelligent AI learning platform.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-[#1a1a2e] dark:text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#5B50FF] transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#5B50FF] transition-colors">Curriculum</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#5B50FF] transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-[#1a1a2e] dark:text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#5B50FF] transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#5B50FF] transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#5B50FF] transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#5B50FF] transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-[#1a1a2e] dark:text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#5B50FF] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#5B50FF] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#5B50FF] transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">© 2026 Lexi AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-[#5B50FF] transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-[#5B50FF] transition-colors">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-[#5B50FF] transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
