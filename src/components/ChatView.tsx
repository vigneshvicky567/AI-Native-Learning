import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Greeting } from './Greeting';
import { Cards } from './Cards';
import { InputArea } from './InputArea';
import { ChecklistSidebar } from './ChecklistSidebar';
import { CodeEditor } from './CodeEditor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BlockRenderer, Block } from './BlockRenderer';
import { CodeBlock } from './CodeBlock';

export interface Message {
  role: 'user' | 'model';
  text: string;
  files?: { name: string; type: string; url: string }[];
}

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (text: string, files?: File[]) => void;
  isLoading: boolean;
}

function tryParseBlocks(buffer: string): Block[] | null {
  try {
    const cleaned = buffer.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    try {
      let cleaned = buffer.replace(/^```json\n?/, '').trim();
      if (!cleaned.startsWith('[')) return null;
      
      const lastBrace = cleaned.lastIndexOf('}');
      if (lastBrace === -1) return []; // Return empty array to hide raw JSON while first block streams
      
      cleaned = cleaned.substring(0, lastBrace + 1) + ']';
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed;
    } catch (e2) {
      // If we still can't parse it, but it started with '[', it's likely streaming JSON.
      // Return empty array to avoid flashing raw JSON text.
      return [];
    }
  }
  return null;
}

export function ChatView({ messages, onSendMessage, isLoading }: ChatViewProps) {
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorCode, setEditorCode] = useState('');
  const [editorLanguage, setEditorLanguage] = useState('python');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpenEditor = (code: string, language: string) => {
    setEditorCode(code);
    setEditorLanguage(language);
    setIsEditorOpen(true);
  };

  const handleRunCode = (code: string, language: string) => {
    // BACKEND ARCHITECTURE: Instead of sending a prompt to Gemini to simulate running code,
    // send the code to a FastAPI endpoint (e.g., POST /api/code/execute) that runs the code 
    // in a secure sandbox (like Docker) and returns the actual output.
    // Example:
    // const response = await fetch('http://localhost:8000/api/code/execute', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ code, language })
    // });
    // const result = await response.json();
    // Then, you can either display the result in the editor or send it to Gemini for review.
    
    const prompt = `I have written the following ${language} code. Please act as my coding partner and reviewer. Simulate running it, tell me the output, and guide me step-by-step if there are errors or improvements needed (do not just give me the straight answer immediately):\n\n\`\`\`${language}\n${code}\n\`\`\``;
    onSendMessage(prompt);
  };

  return (
    <div 
      className="flex flex-col md:flex-row h-[100dvh] w-full p-0 md:p-2 lg:p-3 font-sans overflow-hidden relative bg-[#F8F9FF]"
    >
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-blue-200/60 to-purple-300/60 rounded-full mix-blend-multiply filter blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-indigo-300/60 to-blue-200/60 rounded-full mix-blend-multiply filter blur-[120px]"></div>
      </div>

      <Sidebar />
      
      <main className="flex-1 relative overflow-hidden bg-white/40 backdrop-blur-md md:rounded-2xl shadow-sm flex flex-col md:ml-2 border border-white/60 pb-16 md:pb-0 z-10">
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
                {messages.map((msg, idx) => {
                  let parsedBlocks: Block[] | null = null;
                  if (msg.role === 'model') {
                    parsedBlocks = tryParseBlocks(msg.text);
                  }

                  if (msg.role === 'model' && msg.text === '') {
                    return null;
                  }

                  return (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-6 py-4 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white/60 backdrop-blur-md text-gray-900 border border-white/60 rounded-tl-sm'}`}>
                        {msg.role === 'model' ? (
                          parsedBlocks ? (
                            <BlockRenderer blocks={parsedBlocks} onOpenEditor={handleOpenEditor} />
                          ) : (
                            <div className="markdown-body prose prose-sm max-w-none font-sans text-gray-900">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const codeString = String(children).replace(/\n$/, '');
                                    return !inline && match ? (
                                      <CodeBlock language={match[1]} code={codeString} />
                                    ) : (
                                      <code {...props} className="bg-white/50 text-pink-600 px-1.5 py-0.5 rounded-md font-mono text-[13px] font-bold border border-white/60 shadow-sm">
                                        {children}
                                      </code>
                                    );
                                  },
                                  table: ({ children }) => (
                                    <div className="overflow-x-auto my-4">
                                      <table className="min-w-full divide-y divide-white/60 border border-white/60 rounded-lg overflow-hidden">
                                        {children}
                                      </table>
                                    </div>
                                  ),
                                  th: ({ children }) => (
                                    <th className="bg-white/50 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                      {children}
                                    </th>
                                  ),
                                  td: ({ children }) => (
                                    <td className="px-4 py-3 text-sm text-gray-700 border-t border-gray-200">
                                      {children}
                                    </td>
                                  ),
                                }}
                              >
                                {msg.text}
                              </ReactMarkdown>
                            </div>
                          )
                        ) : (
                          <div className="flex flex-col gap-2">
                            {msg.files && msg.files.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {msg.files.map((f, i) => (
                                  f.type.startsWith('image/') ? (
                                    <img key={i} src={f.url} alt={f.name} className="max-w-[200px] max-h-[200px] rounded-lg object-cover border border-blue-400" />
                                  ) : (
                                    <div key={i} className="flex items-center gap-2 bg-blue-700 px-3 py-2 rounded-lg text-sm">
                                      <span className="truncate max-w-[150px]">{f.name}</span>
                                    </div>
                                  )
                                ))}
                              </div>
                            )}
                            {msg.text && <p className="text-[16px] leading-relaxed font-medium">{msg.text}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {isLoading && (messages.length === 0 || messages[messages.length - 1].role === 'user' || (messages[messages.length - 1].role === 'model' && messages[messages.length - 1].text === '')) && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-tl-sm px-6 py-5 flex items-center gap-2">
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

      <CodeEditor 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        initialCode={editorCode}
        language={editorLanguage}
        onRunCode={handleRunCode}
        isLoading={isLoading}
      />
      <ChecklistSidebar isOpen={isChecklistOpen} onClose={() => setIsChecklistOpen(false)} />
    </div>
  );
}
