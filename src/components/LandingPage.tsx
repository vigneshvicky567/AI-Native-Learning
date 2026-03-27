import React, { useState } from 'react';
import { Play, Mic, ArrowUp, Image as ImageIcon, Plus, Sparkles, MessageSquare, Zap, Globe, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: (prompt: string) => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onStart(prompt);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] relative overflow-x-hidden flex flex-col font-sans text-gray-900">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-blue-200/40 to-purple-300/40 rounded-full mix-blend-multiply filter blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-indigo-300/40 to-blue-200/40 rounded-full mix-blend-multiply filter blur-[120px]"></div>
      </div>

      {/* Navbar */}
      <div className="sticky top-0 z-50 w-full bg-[#F8F9FF]/80 backdrop-blur-xl border-b border-white/60 shadow-sm transition-all duration-300">
        <header className="flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#5B50FF] rounded-sm transform rotate-45 flex items-center justify-center">
               <div className="w-3 h-3 bg-white rounded-sm transform -rotate-45"></div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#1a1a2e]">LearnAI.</span>
          </div>
          
          <nav className="hidden md:flex items-center bg-white/60 backdrop-blur-md rounded-full px-2 py-1.5 shadow-sm border border-white/40">
            <a href="#" className="px-5 py-2 text-sm font-medium bg-white rounded-full shadow-sm text-gray-900">Home</a>
            <a href="#features" className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
            <a href="#topics" className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Topics</a>
          </nav>

          <button onClick={() => onStart('Hello!')} className="bg-[#5B50FF] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md">
            Start Learning
          </button>
        </header>
      </div>

      {/* Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center mt-12 md:mt-20">
        <h1 className="text-5xl md:text-7xl text-[#1a1a2e] mb-6 max-w-4xl leading-[1.15]">
          <span className="font-serif">Master any subject with</span><br />
          <span className="font-serif italic text-[#2D2B5A]">your personal</span> <span className="font-serif">AI Tutor</span>
        </h1>
        
        <p className="text-gray-600 max-w-2xl text-lg mb-10 leading-relaxed">
          Meet the AI tutor that adapts to your learning style, providing personalized explanations, coding environments, and interactive checklists to help you master any topic.
        </p>

        {/* Hero Input Box */}
        <div className="w-full max-w-3xl bg-white/40 backdrop-blur-xl p-3 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 mb-16">
          <form onSubmit={handleSubmit} className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 flex flex-col min-h-[140px] text-left">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What do you want to learn today? e.g., Explain Quantum Computing..."
              className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-800 text-lg font-medium mb-4 px-2"
            />
            
            {/* Mock Image Attachment */}
            <div className="px-2 mb-4">
               <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group cursor-pointer">
                 <img src="https://picsum.photos/seed/ai/100/100" alt="Attached" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
              <div className="flex items-center gap-4 px-2">
                <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Plus size={20} />
                </button>
                <button type="button" className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
                  <ImageIcon size={14} />
                  Upload Notes
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Mic size={18} />
                </button>
                <button type="submit" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5B50FF] text-white hover:bg-indigo-700 transition-colors shadow-md">
                  <ArrowUp size={20} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 bg-white/50 backdrop-blur-sm border-t border-white/60">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a2e] mb-4">Why choose LearnAI?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Everything you need to accelerate your learning and master new skills efficiently.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-50 text-[#5B50FF] rounded-2xl flex items-center justify-center mb-6">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a2e] mb-3">Interactive Coding</h3>
              <p className="text-gray-600 leading-relaxed">Practice coding directly in the browser with our built-in Monaco editor, getting real-time feedback from your AI tutor.</p>
            </div>
            
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-50 text-[#5B50FF] rounded-2xl flex items-center justify-center mb-6">
                <Globe size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a2e] mb-3">Structured Learning</h3>
              <p className="text-gray-600 leading-relaxed">Stay on track with AI-generated checklists and milestones that break down complex topics into manageable steps.</p>
            </div>
            
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-50 text-[#5B50FF] rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a2e] mb-3">Personalized Pace</h3>
              <p className="text-gray-600 leading-relaxed">LearnAI adapts to your speed. It identifies your weak points and provides targeted exercises to strengthen your understanding.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a2e] mb-6">Start learning in minutes</h2>
              <p className="text-gray-600 text-lg mb-10">No setup required. Just tell the AI what you want to learn and dive right in.</p>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#5B50FF] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1a1a2e] mb-2">Set your goal</h4>
                    <p className="text-gray-600">Type in the topic, language, or framework you want to master.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#5B50FF] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1a1a2e] mb-2">Follow the plan</h4>
                    <p className="text-gray-600">LearnAI generates a customized curriculum and interactive checklist for you.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#5B50FF] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1a1a2e] mb-2">Practice & Master</h4>
                    <p className="text-gray-600">Use the built-in code editor and chat interface to practice and ask questions.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl border border-white/80 relative">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative z-10">
                  <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <div className="w-10 h-10 bg-[#5B50FF] rounded-full flex items-center justify-center text-white">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h5 className="font-bold text-[#1a1a2e]">LearnAI Tutor</h5>
                      <p className="text-xs text-green-500 font-medium">Online</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                      <p className="text-sm text-gray-700">Hi there! What would you like to learn today?</p>
                    </div>
                    <div className="bg-[#5B50FF] text-white rounded-2xl rounded-tr-none p-4 max-w-[85%] ml-auto">
                      <p className="text-sm">I want to learn React hooks, specifically useEffect.</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                      <p className="text-sm text-gray-700">Great choice! Let's start with the basics of side effects in React. I've created a checklist for us and opened the code editor so we can practice.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Topics Section */}
      <section id="topics" className="relative z-10 py-24 bg-white/40 backdrop-blur-md border-t border-white/60">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a2e] mb-4">Master any subject</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">From complex mathematics to conversational languages, LearnAI adapts to your specific needs.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Computer Science', 'Mathematics', 'Languages', 'Sciences', 'History', 'Literature', 'Business', 'Arts'].map((topic, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-clay-card border border-white/60 hover:-translate-y-1 hover:shadow-clay-surface transition-all duration-300 cursor-pointer text-center group">
                <div className="w-12 h-12 mx-auto bg-indigo-50 text-[#5B50FF] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles size={24} />
                </div>
                <h3 className="font-bold text-[#1a1a2e]">{topic}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Tools Section */}
      <section id="tools" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row-reverse items-center gap-16">
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a2e] mb-6">Tools built for understanding</h2>
              <p className="text-gray-600 text-lg mb-8">Reading isn't enough. LearnAI provides interactive environments to test your knowledge immediately.</p>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent-pink/10 text-[#DB2777] flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1a1a2e] mb-1">Smart Checklists</h4>
                    <p className="text-gray-600">Break down massive topics into bite-sized, achievable milestones.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 text-[#0EA5E9] flex items-center justify-center flex-shrink-0 mt-1">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1a1a2e] mb-1">Progress Tracking</h4>
                    <p className="text-gray-600">Visualize your learning journey and see how far you've come.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="flex-1 w-full">
              <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-clay-surface border border-white/80 relative">
                <div className="bg-white rounded-3xl p-6 shadow-clay-card border border-white/60">
                  <h3 className="font-bold text-lg mb-4 text-[#1a1a2e]">Your Milestones</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item === 1 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                          <CheckCircle2 size={14} />
                        </div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
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
      <section id="testimonials" className="relative z-10 py-24 bg-white/40 backdrop-blur-md border-t border-white/60">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a2e] mb-4">Loved by learners</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">See how LearnAI is changing the way people master new skills.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah J.", role: "Computer Science Student", text: "The interactive code editor combined with the AI tutor helped me finally understand React hooks. It's like having a senior developer sitting next to me." },
              { name: "Michael T.", role: "Self-taught Designer", text: "I used LearnAI to grasp color theory and typography. The structured checklists kept me focused instead of falling down YouTube rabbit holes." },
              { name: "Elena R.", role: "High School Teacher", text: "I recommend this to all my students for test prep. It adapts to their pace and explains concepts in ways that click for them individually." }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-clay-card border border-white/60 relative">
                <div className="text-[#5B50FF] mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.017 21L16.439 16.09C16.852 15.158 17.058 14.181 17.058 13.159V3H24V13.159C24 15.8 23.341 18.225 22.022 20.434C20.704 22.643 18.91 24.368 16.641 25.609L14.017 21ZM0 21L2.422 16.09C2.835 15.158 3.041 14.181 3.041 13.159V3H10V13.159C10 15.8 9.341 18.225 8.022 20.434C6.704 22.643 4.91 24.368 2.641 25.609L0 21Z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <h4 className="font-bold text-[#1a1a2e]">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a2e] mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">Got questions? We've got answers.</p>
          </div>
          
          <div className="space-y-6">
            {[
              { q: "Do I need any prior knowledge to use LearnAI?", a: "Not at all! LearnAI is designed to adapt to your current skill level, whether you're a complete beginner or an advanced learner looking to fill knowledge gaps." },
              { q: "Can I use LearnAI on my phone?", a: "Yes, LearnAI is fully responsive and works great on mobile devices, tablets, and desktops." },
              { q: "What subjects does LearnAI cover?", a: "LearnAI can help you with a wide range of subjects, from programming and mathematics to history and literature. If there's information about it, LearnAI can teach it." },
              { q: "How does the interactive code editor work?", a: "The built-in code editor allows you to write and execute code directly in your browser. LearnAI can review your code, suggest improvements, and help you debug errors in real-time." }
            ].map((faq, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-clay-card border border-white/60">
                <h3 className="text-xl font-bold text-[#1a1a2e] mb-3">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-12 md:p-20 text-center shadow-clay-surface border border-white/80 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#DB2777]/20 rounded-full mix-blend-multiply filter blur-[80px] pointer-events-none animate-clay-float"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#0EA5E9]/20 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none animate-clay-float-delayed"></div>
            
            <h2 className="text-4xl md:text-6xl font-serif mb-6 relative z-10 text-[#1a1a2e]">Ready to accelerate your learning?</h2>
            <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto relative z-10">Join thousands of students using LearnAI to master new skills and achieve their goals.</p>
            
            <button onClick={() => onStart('Hello!')} className="bg-[#5B50FF] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition-colors shadow-clay-button flex items-center gap-2 mx-auto relative z-10 hover:-translate-y-1 active:scale-95">
              Start Learning for Free
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-[#5B50FF] rounded-sm transform rotate-45 flex items-center justify-center">
                   <div className="w-3 h-3 bg-white rounded-sm transform -rotate-45"></div>
                </div>
                <span className="text-2xl font-bold tracking-tight text-[#1a1a2e]">LearnAI.</span>
              </div>
              <p className="text-gray-500 max-w-sm">Master any subject with the world's most intelligent AI learning platform.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-[#1a1a2e] mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 hover:text-[#5B50FF] transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#5B50FF] transition-colors">Curriculum</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#5B50FF] transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-[#1a1a2e] mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 hover:text-[#5B50FF] transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#5B50FF] transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#5B50FF] transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#5B50FF] transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-[#1a1a2e] mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 hover:text-[#5B50FF] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#5B50FF] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#5B50FF] transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">© 2026 LearnAI. All rights reserved.</p>
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
