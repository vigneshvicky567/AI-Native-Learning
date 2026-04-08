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
import { TutorView } from './TutorView';
import { CodeBlock } from './CodeBlock';
import { LoadingBreadcrumb } from './ui/animated-loading-svg-text-shimmer';

export interface Message {
  role: 'user' | 'model';
  text: string;
  files?: { name: string; type: string; url: string }[];
  tutorData?: any;
}

// ─── Parse Claude response into text + visual blocks ─────────────────────────
function parseResponse(text: string) {
  const parts = [];
  const regex = /<visual>([\s\S]*?)<\/visual>/g;
  let last = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: "text", content: text.slice(last, match.index) });
    parts.push({ type: "visual", content: match[1].trim() });
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push({ type: "text", content: text.slice(last) });
  return parts;
}

// ─── Sandboxed iframe renderer ────────────────────────────────────────────────
function VisualFrame({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;

    // Auto-resize to content height
    const onLoad = () => {
      try {
        const h = iframe.contentDocument?.body?.scrollHeight;
        if (h) iframe.style.height = h + "px";
      } catch (_) {}
    };
    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [html]);

  return (
    <iframe
      ref={ref}
      srcDoc={html}
      sandbox="allow-scripts"          // no allow-same-origin = fully sandboxed
      style={{
        width: "100%",
        border: "none",
        borderRadius: 10,
        minHeight: 300,
        background: "transparent",
      }}
      title="visualization"
    />
  );
}

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (text: string, files?: File[]) => void;
  isLoading: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  checkpoints: any[];
  onToggleCheckpoint: (id: number) => void;
}

export function ChatView({ messages, onSendMessage, isLoading, isDarkMode, toggleDarkMode, checkpoints, onToggleCheckpoint }: ChatViewProps) {
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorCode, setEditorCode] = useState('');
  const [editorLanguage, setEditorLanguage] = useState('python');
  const [editorActiveLine, setEditorActiveLine] = useState<number | undefined>(undefined);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      // Use requestAnimationFrame to ensure DOM has updated before scrolling
      requestAnimationFrame(() => {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
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
      className="flex flex-col md:flex-row h-[100dvh] w-full p-0 md:p-3 lg:p-4 font-sans overflow-hidden relative bg-[#fcfcfc] dark:bg-[#050505]"
    >
      <Sidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="flex-1 relative flex flex-col min-h-0 md:ml-2 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 z-10">
        <div className="flex-1 relative overflow-hidden min-h-0 flex flex-col bg-white/80 dark:bg-[#0a0a0a]/90 backdrop-blur-3xl rounded-none md:rounded-[2.5rem] border-0 md:border border-white/80 dark:border-[#1a1a1a] shadow-2xl">
          {/* Background Gradients */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 dark:hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-blue-200/60 to-purple-300/60 rounded-full mix-blend-multiply filter blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-indigo-300/60 to-blue-200/60 rounded-full mix-blend-multiply filter blur-[120px]"></div>
          </div>

          <div className="flex-1 overflow-hidden min-h-0 relative z-10 flex flex-col px-4 sm:px-6 lg:px-8 py-6">
          <Header 
            onOpenCheckpoints={() => setIsChecklistOpen(true)} 
            onToggleEditor={() => setIsEditorOpen(!isEditorOpen)}
            isEditorOpen={isEditorOpen}
          />
          
          <div 
            ref={scrollContainerRef}
            className="flex-1 flex flex-col mt-2 mb-6 max-w-4xl mx-auto w-full overflow-y-auto no-scrollbar min-h-0"
          >
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <Greeting />
                <Cards />
              </div>
            ) : (
              <div className="flex flex-col gap-6 py-4">
                {messages.map((msg, idx) => {
                  if (msg.role === 'model' && msg.text === '') {
                    return null;
                  }

                  return (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] py-4 ${msg.role === 'user' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-100 rounded-3xl px-6 shadow-sm border border-indigo-100 dark:border-indigo-500/20' : 'bg-transparent text-gray-900 dark:text-gray-100 px-2'}`}>
                        {msg.role === 'model' ? (
                          msg.tutorData ? (
                            <TutorView 
                              data={msg.tutorData} 
                              onCodeUpdate={(code, language, activeLine) => {
                                setEditorCode(code);
                                setEditorLanguage(language);
                                setEditorActiveLine(activeLine);
                                setIsEditorOpen(true);
                              }}
                            />
                          ) : (
                            <div className="flex flex-col gap-4">
                              {parseResponse(msg.text).map((part, i) => 
                                part.type === "visual" ? (
                                  <VisualFrame key={i} html={part.content} />
                                ) : (
                                  <div key={i} className="markdown-body prose prose-sm max-w-none font-sans text-gray-900 dark:text-gray-100">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        code({ node, inline, className, children, ...props }: any) {
                                          const match = /language-(\w+)/.exec(className || '');
                                          const codeString = String(children).replace(/\n$/, '');
                                          return !inline && match ? (
                                            <CodeBlock language={match[1]} code={codeString} />
                                          ) : (
                                            <code {...props} className="bg-gray-50 text-pink-600 px-1.5 py-0.5 rounded-md font-mono text-[13px] font-bold border border-gray-200 shadow-sm">
                                              {children}
                                            </code>
                                          );
                                        },
                                        table: ({ children }) => (
                                          <div className="overflow-x-auto my-4">
                                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                                              {children}
                                            </table>
                                          </div>
                                        ),
                                        th: ({ children }) => (
                                          <th className="bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-900">
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
                                      {part.content}
                                    </ReactMarkdown>
                                  </div>
                                )
                              )}
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
                    <div className="bg-transparent px-2 py-4 flex items-center gap-2">
                      <LoadingBreadcrumb text="Thinking" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-auto max-w-3xl mx-auto w-full pb-2 px-2 md:px-0">
            <InputArea onSubmit={onSendMessage} isLoading={isLoading} />
          </div>
        </div>
        </div>
      </main>

      <CodeEditor 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        initialCode={editorCode}
        onChangeCode={setEditorCode}
        language={editorLanguage}
        onRunCode={handleRunCode}
        isLoading={isLoading}
        isDarkMode={isDarkMode}
        activeLine={editorActiveLine}
      />
      <ChecklistSidebar 
        isOpen={isChecklistOpen} 
        onClose={() => setIsChecklistOpen(false)} 
        checkpoints={checkpoints}
        onToggleCheckpoint={onToggleCheckpoint}
      />
    </div>
  );
}
