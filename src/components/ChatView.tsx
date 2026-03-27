import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Greeting } from './Greeting';
import { Cards } from './Cards';
import { InputArea } from './InputArea';
import { ChecklistSidebar } from './ChecklistSidebar';
import { CodeEditor } from './CodeEditor';
import ReactMarkdown from 'react-markdown';

export interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export function ChatView({ messages, onSendMessage, isLoading }: ChatViewProps) {
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-[#EAEAF2] p-0 md:p-2 lg:p-3 font-sans overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 relative overflow-hidden bg-white md:rounded-[2rem] lg:rounded-[2.5rem] shadow-sm flex flex-col md:ml-2 border-t md:border border-white/50 pb-16 md:pb-0">
        {/* Soft Background Gradients */}
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-gradient-to-b from-[#FFF0E5] to-transparent rounded-full mix-blend-multiply filter blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-gradient-to-t from-[#E8F0FF] to-transparent rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none"></div>
        
        <div className="flex-1 overflow-y-auto relative z-10 flex flex-col px-4 sm:px-6 lg:px-8 py-4">
          <Header 
            onOpenCheckpoints={() => setIsChecklistOpen(true)} 
            onToggleEditor={() => setIsEditorOpen(!isEditorOpen)}
            isEditorOpen={isEditorOpen}
          />
          
          <div className="flex-1 flex flex-col mt-2 mb-6 max-w-4xl mx-auto w-full overflow-y-auto no-scrollbar">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <Greeting />
                <Cards />
              </div>
            ) : (
              <div className="flex flex-col gap-6 py-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${msg.role === 'user' ? 'bg-[#5B50FF] text-white' : 'bg-gray-50 border border-gray-100 text-gray-800'}`}>
                      {msg.role === 'model' ? (
                        <div className="markdown-body prose prose-sm max-w-none">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-[15px] leading-relaxed">{msg.text}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <div className="mt-auto max-w-3xl mx-auto w-full pb-2">
            <InputArea onSubmit={onSendMessage} isLoading={isLoading} />
          </div>
        </div>
      </main>

      <CodeEditor isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} />
      <ChecklistSidebar isOpen={isChecklistOpen} onClose={() => setIsChecklistOpen(false)} />
    </div>
  );
}
