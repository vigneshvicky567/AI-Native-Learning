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
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-blue-200/40 to-purple-300/40 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-indigo-300/40 to-blue-200/40 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#5B50FF] rounded-sm transform rotate-45 flex items-center justify-center">
             <div className="w-3 h-3 bg-white rounded-sm transform -rotate-45"></div>
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#1a1a2e]">Karla.</span>
        </div>
        
        <nav className="hidden md:flex items-center bg-white/60 backdrop-blur-md rounded-full px-2 py-1.5 shadow-sm border border-white/40">
          <a href="#" className="px-5 py-2 text-sm font-medium bg-white rounded-full shadow-sm text-gray-900">Home</a>
          <a href="#features" className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
          <a href="#how-it-works" className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
          <a href="#pricing" className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
        </nav>

        <button className="bg-[#5B50FF] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md">
          Contact
        </button>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center mt-12 md:mt-20">
        <h1 className="text-5xl md:text-7xl text-[#1a1a2e] mb-6 max-w-4xl leading-[1.15]">
          <span className="font-serif">Automate, Engage, and</span><br />
          <span className="font-serif italic text-[#2D2B5A]">Grow with</span> <span className="font-serif">AI Chat</span>
        </h1>
        
        <p className="text-gray-600 max-w-2xl text-lg mb-10 leading-relaxed">
          Meet the AI chatbot that understands, learns, and delivers your personal assistant for everything from customer support to creative ideas.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <button className="bg-[#5B50FF] text-white px-8 py-3.5 rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 w-full sm:w-auto">
            Try It Free
          </button>
          <button className="flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm text-gray-800 px-6 py-3.5 rounded-full font-medium hover:bg-white transition-colors shadow-sm w-full sm:w-auto">
            <div className="w-8 h-8 bg-indigo-100 text-[#5B50FF] rounded-full flex items-center justify-center">
              <Play size={14} fill="currentColor" className="ml-0.5" />
            </div>
            Watch Demo
          </button>
        </div>

        {/* Hero Input Box */}
        <div className="w-full max-w-3xl bg-white/40 backdrop-blur-xl p-3 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 mb-16">
          <form onSubmit={handleSubmit} className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 flex flex-col min-h-[140px] text-left">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Explain me about this image..."
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
                  Create Image
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

        {/* Logos */}
        <div className="flex flex-col items-center gap-8 pb-16 w-full max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-2 text-[#5B50FF] font-semibold">
            <Sparkles size={20} />
            <span className="text-[#1a1a2e] text-lg">Connect Karla to the apps you love</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale">
            <span className="text-2xl font-bold font-serif italic">Phoenix</span>
            <span className="text-2xl font-bold tracking-tighter">foxen</span>
            <span className="text-2xl font-bold tracking-widest uppercase">Boycott</span>
            <span className="text-2xl font-bold">Arts<span className="font-light">Mafia</span></span>
            <span className="text-2xl font-bold lowercase">natural</span>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 bg-white/50 backdrop-blur-sm border-t border-white/60">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a2e] mb-4">Why choose Karla?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Everything you need to automate conversations and delight your customers at scale.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-50 text-[#5B50FF] rounded-2xl flex items-center justify-center mb-6">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a2e] mb-3">Instant Responses</h3>
              <p className="text-gray-600 leading-relaxed">Zero latency. Karla answers customer queries instantly, 24/7, ensuring no one is left waiting.</p>
            </div>
            
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-50 text-[#5B50FF] rounded-2xl flex items-center justify-center mb-6">
                <Globe size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a2e] mb-3">Global Reach</h3>
              <p className="text-gray-600 leading-relaxed">Speak to your customers in their native tongue. Karla fluently understands and replies in over 50 languages.</p>
            </div>
            
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-50 text-[#5B50FF] rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a2e] mb-3">Smart Analytics</h3>
              <p className="text-gray-600 leading-relaxed">Gain deep insights into customer behavior, common questions, and satisfaction scores with our dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a2e] mb-6">Get started in minutes</h2>
              <p className="text-gray-600 text-lg mb-10">No coding required. Train your AI and deploy it across your channels seamlessly.</p>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#5B50FF] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1a1a2e] mb-2">Connect your data</h4>
                    <p className="text-gray-600">Upload your PDFs, link your website, or connect your knowledge base.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#5B50FF] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1a1a2e] mb-2">Train your AI</h4>
                    <p className="text-gray-600">Karla learns your brand voice and product details automatically.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#5B50FF] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1a1a2e] mb-2">Go live</h4>
                    <p className="text-gray-600">Deploy the widget to your website or integrate with your favorite messaging apps.</p>
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
                      <h5 className="font-bold text-[#1a1a2e]">Karla AI</h5>
                      <p className="text-xs text-green-500 font-medium">Online</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                      <p className="text-sm text-gray-700">Hi there! How can I help you today?</p>
                    </div>
                    <div className="bg-[#5B50FF] text-white rounded-2xl rounded-tr-none p-4 max-w-[85%] ml-auto">
                      <p className="text-sm">I need help setting up my account.</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                      <p className="text-sm text-gray-700">I can certainly help with that! First, could you tell me if you're setting up a personal or business account?</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 bg-white/50 backdrop-blur-sm border-t border-white/60">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a2e] mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Choose the plan that best fits your needs. No hidden fees.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-2xl font-bold text-[#1a1a2e] mb-2">Starter</h3>
              <p className="text-gray-500 mb-6">Perfect for trying out Karla.</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-[#1a1a2e]">$0</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 size={20} className="text-green-500" />
                  100 AI responses/mo
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 size={20} className="text-green-500" />
                  1 Data source
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 size={20} className="text-green-500" />
                  Standard support
                </li>
              </ul>
              <button className="w-full py-3 rounded-full border-2 border-[#5B50FF] text-[#5B50FF] font-medium hover:bg-indigo-50 transition-colors">
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#1a1a2e] p-8 rounded-[2rem] shadow-xl border border-gray-800 flex flex-col relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-400 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-gray-400 mb-6">For growing businesses.</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">$49</span>
                <span className="text-gray-400">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={20} className="text-[#5B50FF]" />
                  Unlimited AI responses
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={20} className="text-[#5B50FF]" />
                  Unlimited Data sources
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={20} className="text-[#5B50FF]" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={20} className="text-[#5B50FF]" />
                  Priority support
                </li>
              </ul>
              <button className="w-full py-3 rounded-full bg-[#5B50FF] text-white font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/30">
                Start Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:col-span-2 lg:col-span-1">
              <h3 className="text-2xl font-bold text-[#1a1a2e] mb-2">Enterprise</h3>
              <p className="text-gray-500 mb-6">Custom solutions for large teams.</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-[#1a1a2e]">Custom</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 size={20} className="text-green-500" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 size={20} className="text-green-500" />
                  Custom integrations
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 size={20} className="text-green-500" />
                  Dedicated success manager
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 size={20} className="text-green-500" />
                  SLA guarantees
                </li>
              </ul>
              <button className="w-full py-3 rounded-full border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="bg-gradient-to-br from-[#5B50FF] to-purple-600 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full filter blur-3xl"></div>
            
            <h2 className="text-4xl md:text-6xl font-serif mb-6 relative z-10">Ready to transform your customer experience?</h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">Join thousands of businesses using Karla to automate support, engage visitors, and drive sales.</p>
            
            <button className="bg-white text-[#5B50FF] px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors shadow-xl flex items-center gap-2 mx-auto relative z-10">
              Get Started for Free
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
                <span className="text-2xl font-bold tracking-tight text-[#1a1a2e]">Karla.</span>
              </div>
              <p className="text-gray-500 max-w-sm">Automate, engage, and grow with the world's most intelligent AI chatbot platform.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-[#1a1a2e] mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 hover:text-[#5B50FF] transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#5B50FF] transition-colors">Integrations</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#5B50FF] transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#5B50FF] transition-colors">Changelog</a></li>
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
            <p className="text-gray-400 text-sm">© 2026 Karla AI. All rights reserved.</p>
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
