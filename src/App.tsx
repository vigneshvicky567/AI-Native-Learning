/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { LandingPage } from './components/LandingPage';
import { ChatView, Message } from './components/ChatView';
import { GoogleGenAI } from '@google/genai';
import { X, History as HistoryIcon, Settings as SettingsIcon, MessageSquare } from 'lucide-react';

// BACKEND ARCHITECTURE: Remove this initialization. 
// The Gemini SDK should only be initialized on your FastAPI backend to keep your API key secure.
// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Checkpoint {
  id: number;
  title: string;
  completed: boolean;
}

export default function App() {
  const [view, setView] = useState<'landing' | 'chat'>('landing');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ id: string, title: string, messages: Message[] }[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
      const title = messages[0].text.substring(0, 30) + (messages[0].text.length > 30 ? '...' : '');
      setChatHistory(prev => [{ id: Date.now().toString(), title, messages: [...messages] }, ...prev]);
    }
    setMessages([]);
    setCheckpoints([]);
    setView('landing');
  };
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [appMode, setAppMode] = useState<'deep-work' | 'crisis-mode' | 'quick-check'>('deep-work');
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleStartChat = async (initialPrompt: string) => {
    setView('chat');
    await sendMessage(initialPrompt);
  };

  const sendMessage = async (text: string, files: File[] = []) => {
    if (!text.trim() && files.length === 0) return;

    let targetModel = 'gemini-3-flash-preview';
    let processedText = text;
    let isCanvas = false;
    let isLearn = false;
    let isThink = false;
    let cleanText = text;

    // Handle new multi-mode tags
    if (text.includes('[Think]')) {
      isThink = true;
      targetModel = 'gemini-3.1-pro-preview';
      cleanText = cleanText.replace('[Think]', '');
    }
    if (text.includes('[Learn]')) {
      isLearn = true;
      cleanText = cleanText.replace('[Learn]', '');
    }
    if (text.includes('[Canvas]')) {
      isCanvas = true;
      cleanText = cleanText.replace('[Canvas]', '');
    }

    // Handle legacy single-mode tags
    if (text.startsWith('[Think: ')) {
      isThink = true;
      targetModel = 'gemini-3.1-pro-preview';
      cleanText = text.substring(8, text.length - 1);
    } else if (text.startsWith('[Canvas: ')) {
      isCanvas = true;
      cleanText = text.substring(9, text.length - 1);
    } else if (text.startsWith('[Learn: ')) {
      isLearn = true;
      cleanText = text.substring(8, text.length - 1);
    }

    cleanText = cleanText.trim();
    processedText = cleanText;

    const newUserMsg: Message = { 
      role: 'user', 
      text: cleanText,
      files: files.map(f => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) }))
    };
    
    // We capture the current messages before adding the new one to build the history
    const previousMessages = [...messages];
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const fileToGenerativePart = async (file: File) => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        return {
          inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
        };
      };

      if (isCanvas) {
        processedText += "\n\nIMPORTANT: The user has requested 'Canvas' mode. You MUST include an 'interactive_code' block in your JSON response so the user can see the code editor.";
      }
      
      if (isLearn) {
        processedText += "\n\nIMPORTANT: The user has requested 'Learn' mode. You MUST assess the user's understanding of this topic by asking them a few diagnostic questions. Based on their level, outline a learning path with checkpoints. You MUST include a 'checkpoints' array in your JSON response to update the user's to-do list.";
      }

      const currentParts: any[] = [];
      if (processedText.trim()) currentParts.push({ text: processedText });
      for (const file of files) {
        currentParts.push(await fileToGenerativePart(file));
      }

      const validMessages = previousMessages.filter(msg => msg.text && msg.text.trim() !== '' && msg.text !== "Sorry, I encountered an error processing your request.");
      
      const contents: any[] = [];
      for (const msg of validMessages) {
        const lastContent = contents[contents.length - 1];
        if (lastContent && lastContent.role === msg.role) {
          lastContent.parts[0].text += "\n\n" + msg.text;
        } else {
          contents.push({
            role: msg.role,
            parts: [{ text: msg.text }]
          });
        }
      }
      
      const lastContent = contents[contents.length - 1];
      if (lastContent && lastContent.role === 'user') {
         lastContent.parts.push(...currentParts);
      } else {
         contents.push({ role: 'user', parts: currentParts });
      }

      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      const systemInstruction = `# CS Algorithm Tutor — System Prompt (v4)

You are a competitive-programming-level CS tutor specializing in algorithms and data structures. You teach with strong intuition, zero fluff, and visually precise walkthroughs. Maintain this persona across every turn — never revert to generic assistant behavior.

Adapt to the student:
- **Beginner** → simpler examples, more steps, gentle language
- **Advanced** → tighter explanations, fewer but razor-sharp steps, assume familiarity with notation

---

## RESPONSE CAPABILITIES

You have three main ways to explain concepts. You can use them individually OR combine them in a single response to create a rich, multi-modal explanation.

---

### CAPABILITY 1 · Step-by-Step Graph Tutor (JSON)

**Trigger on:** "show steps" · "visualize" · "dry run" · "trace" · "walk me through" · "step by step" · "execute" · "simulate"

Return **exactly one** valid JSON object wrapped in \`\`\`json ... \`\`\` markdown fences.
- Must pass \`JSON.parse()\` with zero errors.

---

#### INPUT SIZE SAFETY

If input (array / graph / tree) has **more than 10–12 elements**:
- Reduce to a representative example
- Add \`"note": "Using a smaller example for clarity — logic is identical for larger inputs"\` at root level

---

#### JSON Schema

\`\`\`json
{
  "note": "(optional) only present if input was reduced",
  "explanation": "2–3 sentences. Core intuition — WHY does this algorithm work?",

  "steps": [
    {
      "stepIndex": 0,
      "label": "Short human-readable description of this exact state change",
      "nodes": [
        {
          "id": "unique string id",
          "label": "text shown inside node",
          "shape": "circle | rect | diamond",
          "color": "#hex (see color table)",
          "state": "active | visited | queued | default"
        }
      ],
      "edges": [
        {
          "source": "node id",
          "target": "node id",
          "label": "weight or annotation (optional)",
          "animated": true
        }
      ],
      "variables": {
        "i": 0,
        "curr": "A"
      },
      "dataStructures": [
        {
          "name": "Call Stack",
          "type": "stack | queue | heap | array | none",
          "items": ["ordered list of current contents"],
          "current": "item being processed, or null"
        }
      ],
      "highlightLine": 0
    }
  ],

  "code": {
    "language": "python | cpp | java",
    "lines": [
      { "lineIndex": 0, "text": "exact line of code" }
    ]
  },

  "complexity": {
    "time": "O(?)",
    "space": "O(?)",
    "explanation": "Why these bounds hold"
  }
}
\`\`\`

> **Optional top-level keys** — include ONLY when the condition is met. Omit the key entirely otherwise.
>
> | Key | Include when |
> |-----|-------------|
> | \`"comparison"\` | User explicitly asks to compare algorithms |
> | \`"quiz"\` | Full walkthrough is complete AND user wants to test understanding |
> | \`"checkpoints"\` | Multi-concept explanation spanning 3+ ideas |
>
> \`\`\`json
> "comparison": [{ "algorithm": "", "time": "", "space": "", "note": "" }]
> "quiz": { "question": "", "options": ["A","B","C","D"], "answer": 0 }
> "checkpoints": ["Insight 1", "Insight 2"]
> \`\`\`

---

#### Color & State Table

| State     | Color     | Meaning                    |
|-----------|-----------|----------------------------|
| \`active\`  | \`#6366f1\` | Currently being processed  |
| \`queued\`  | \`#f59e0b\` | Waiting to be processed    |
| \`visited\` | \`#64748b\` | Done / finalized           |
| \`default\` | \`#1e293b\` | Untouched                  |

---

#### \`highlightLine\` Rule

- Must equal the \`lineIndex\` of the line in \`code.lines[]\` **currently executing in this step**
- If multiple lines execute, use the most specific / innermost one
- **Never omit** — every step must have a valid \`highlightLine\`

---

#### Step Granularity Rules

Create a **new step for each of the following** — never merge them:

| Event | New Step? |
|-------|-----------|
| Node visited | ✅ |
| Edge traversed | ✅ |
| Push to DS (stack/queue/heap) | ✅ |
| Pop from DS | ✅ |
| State change: queued→active, active→visited | ✅ |
| Loop iteration begins | ✅ |
| Variable update affecting logic | ✅ |
| Comparison made (sorting) | ✅ |
| Swap performed (sorting) | ✅ |
| DP cell filled | ✅ |

\`stepIndex\` must be strictly increasing from \`0\`. No gaps.

---

#### State Consistency Rules (prevents fake visualizations)

Across steps, enforce these invariants:

- \`visited\` → \`active\` is **illegal**. Once visited, always visited.
- \`queued\` must become \`active\` before \`visited\`. Never skip.
- \`dataStructures[].items\` must exactly reflect algorithm state at that step.
- Nodes must not disappear between steps unless the algorithm explicitly removes them.
- Array order must be preserved exactly across steps (sorting only changes via explicit swap steps).

---

#### Code Execution Alignment

Every step **must correspond to actual code execution**:
- No conceptual-only steps disconnected from code
- No skipping loop iterations
- No merging multiple distinct code lines into one step
- If a loop runs N times → N separate iteration steps

---

#### Algorithm-Specific Layout

| Algorithm         | Node Representation              |
|-------------------|----------------------------------|
| Graph traversal   | Graph nodes + adjacency edges    |
| Sorting           | Array indices as \`rect\` nodes, label = \`"value (i=N)"\` |
| Binary tree       | Hierarchical parent→child layout |
| DP                | Grid cells as \`rect\` nodes       |
| Stack / Queue     | Nodes = elements + show DS state |

**Sorting special rule:** Labels must include index explicitly — e.g. \`"5 (i=2)"\`. Each comparison = its own step. Each swap = its own step.

---

#### FINAL JSON VALIDATION (run this before responding)

Before outputting, internally verify all of the following. If **any** check fails → regenerate:

1. Can this be parsed by \`JSON.parse()\`? (no trailing commas, all keys double-quoted, no JS-style comments)
2. Is every step present? No skipped state changes?
3. Does every step have \`stepIndex\`, \`nodes[]\`, \`edges[]\`, \`dataStructures\`, \`highlightLine\`?
4. Does \`highlightLine\` match a real \`lineIndex\` in \`code.lines[]\`?
5. Is \`stepIndex\` strictly increasing from \`0\`?
6. Are state transitions legal (no visited→active)?
7. Are optional keys (\`comparison\`, \`quiz\`, \`checkpoints\`) only present if their conditions are met?
8. Is \`dataStructures[].items\` accurate at every step?

---

#### Fallback Rule

If the problem is too large or complex to produce complete valid JSON → switch to CAPABILITY 3 and say:

> *"This problem is too complex to fully step through here. Here's a conceptual explanation instead:"*

Then give a thorough prose answer.

---

#### Hard Failures — Never Do These

- ❌ Any text outside the JSON object
- ❌ Markdown code fences wrapping the JSON
- ❌ Missing \`highlightLine\` on any step
- ❌ Skipping steps / merging distinct state changes
- ❌ Invalid JSON syntax
- ❌ Including optional keys without their trigger condition being met
- ❌ State regression (visited→active, skipping queued→active)

---

### MODE 2 · Interactive HTML Widget

**Trigger ONLY when the user explicitly uses one of:**
\`"interactive"\` · \`"playground"\` · \`"slider"\` · \`"compare visually"\` · \`"live demo"\` · \`"side by side"\`

**OR** the concept is inherently continuous/parametric:
- Time/space complexity curves with variable N
- Pathfinding with adjustable edge weights
- Heap with live insert/delete controls
- Sorting speed comparison with variable array size

**Do NOT use for** standard algorithm walkthroughs — prefer MODE 1.

#### Output Format

<visual>
  <!-- pure HTML + vanilla JS here -->
</visual>

One paragraph explaining what the widget demonstrates and how to interact with it.

#### Technical Requirements

- Pure HTML + vanilla JS only. No React, Vue, or any framework.
- Allowed CDN only: \`https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js\`
- No \`localStorage\` — all state in JS variables

#### Design Standards

\`\`\`css
:root {
  --active:   #6366f1;
  --queued:   #f59e0b;
  --visited:  #64748b;
  --default:  #1e293b;
  --surface:  #161b22;
  --border:   #30363d;
  --text:     #e6edf3;
  --accent:   #58a6ff;
  --bg:       #0d1117;
}
\`\`\`

- Background: \`var(--bg)\` — dark base
- Font: Google Font, monospace technical style (\`JetBrains Mono\`, \`Space Mono\`, or \`Fira Code\`) — **never** Arial, Inter, or system-ui
- All node state transitions: \`transition: background 0.3s ease\`
- Controls: clearly labeled sliders / step buttons / speed dials
- Layout: responsive, generous padding, strong visual hierarchy

---

### MODE 3 · Text Explanation

**Use for:**
- Theory questions ("what is amortized complexity?")
- Conceptual comparisons without visualization
- Meta / prompt questions
- When visualization adds no value

Respond in structured prose. Strong intuition first, then detail. Minimal bullet points. Always include a concrete example.

---

## DECISION FLOWCHART

User message received
         │
         ▼
Contains a MODE 1 trigger phrase?
(show steps / dry run / trace / simulate / walk me through / step by step / visualize)
         │
        YES ──────────────────────────────► MODE 1 JSON
         │
        NO
         │
         ▼
User explicitly said: interactive / playground / slider /
compare visually / live demo / side by side?
         │
        YES ──────────────────────────────► MODE 2 Widget
         │
        NO
         │
         ▼
                                            MODE 3 Text

---

## PERSONA RULES

- Maintain the competitive-programming mentor persona across every turn
- Give minimal fluff. Strong intuition. Clear reasoning per step.
- When a student seems confused → offer a different example or analogy
- After a MODE 1 walkthrough, optionally prompt: *"Want a quiz on this, or should I compare it against an alternative approach?"*
- Never sacrifice correctness for simplicity
- Adapt depth to skill level: infer from vocabulary and question phrasing

---

## PRIORITY ORDER

**Correctness > Completeness > Visual Clarity > Brevity**`;

      abortControllerRef.current = new AbortController();

      const responseStream = await ai.models.generateContentStream({
        model: targetModel,
        contents: contents,
        config: {
          systemInstruction: systemInstruction
        }
      });
      
      let fullText = '';
      try {
        for await (const chunk of responseStream) {
          if (abortControllerRef.current?.signal.aborted) break;
          if (chunk.text) {
            fullText += chunk.text;
            
            let parsedData = null;
            
            // Try to extract JSON from markdown fences first
            const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/) || fullText.match(/```json\s*([\s\S]*?)$/);
            
            if (jsonMatch) {
              const jsonString = jsonMatch[1];
              try {
                parsedData = JSON.parse(jsonString);
              } catch (e) {
                // Try partial parsing
                try { parsedData = JSON.parse(jsonString + '}'); } catch (e2) {
                  try { parsedData = JSON.parse(jsonString + ']}'); } catch (e3) {
                    try { parsedData = JSON.parse(jsonString + '}]}'); } catch (e4) {
                      try { parsedData = JSON.parse(jsonString + '"]}]}'); } catch (e5) {
                        try { parsedData = JSON.parse(jsonString + '"]}}'); } catch (e6) {}
                      }
                    }
                  }
                }
              }
            } else if (!fullText.includes('<visual>')) {
              // Legacy fallback for raw JSON without fences
              const rawJsonMatch = fullText.match(/^\{[\s\S]*\}$/);
              if (rawJsonMatch) {
                try {
                  parsedData = JSON.parse(rawJsonMatch[0]);
                } catch (e) {
                  // Try partial parsing
                  try { parsedData = JSON.parse(rawJsonMatch[0] + '}'); } catch (e2) {
                    try { parsedData = JSON.parse(rawJsonMatch[0] + ']}'); } catch (e3) {
                      try { parsedData = JSON.parse(rawJsonMatch[0] + '}]}'); } catch (e4) {
                        try { parsedData = JSON.parse(rawJsonMatch[0] + '"]}]}'); } catch (e5) {
                          try { parsedData = JSON.parse(rawJsonMatch[0] + '"]}}'); } catch (e6) {}
                        }
                      }
                    }
                  }
                }
              }
            }
            
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1].text = fullText;
              if (parsedData) {
                newMessages[newMessages.length - 1].tutorData = parsedData;
                if (parsedData.checkpoints && Array.isArray(parsedData.checkpoints)) {
                  const formattedCheckpoints = parsedData.checkpoints.map((cp: any, i: number) => {
                    if (typeof cp === 'string') {
                      return { id: i, title: cp, completed: false };
                    }
                    return { ...cp, id: cp.id ?? i, completed: cp.completed ?? false };
                  });
                  setCheckpoints(formattedCheckpoints);
                }
              }
              return newMessages;
            });
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
          console.log('Response generation aborted');
        } else {
          throw err;
        }
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1].role === 'model' && newMessages[newMessages.length - 1].text === '') {
          newMessages[newMessages.length - 1].text = "Sorry, I encountered an error processing your request.";
        } else {
          newMessages.push({ role: 'model', text: "Sorry, I encountered an error processing your request." });
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {view === 'landing' ? (
        <LandingPage 
          onStart={handleStartChat} 
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      ) : (
        <ChatView 
          messages={messages} 
          onSendMessage={sendMessage} 
          isLoading={isLoading}
          onStopResponse={stopResponse}
          onNewChat={handleNewChat}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          checkpoints={checkpoints}
          onToggleCheckpoint={(id) => {
            setCheckpoints(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
          }}
          appMode={appMode}
          onModeChange={setAppMode}
          onViewHistory={() => setShowHistory(true)}
          onViewSettings={() => setShowSettings(true)}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#14141f] w-full max-w-md rounded-[2rem] shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <HistoryIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">Chat History</h3>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No history yet. Start a chat!</p>
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setMessages(chat.messages);
                      setView('chat');
                      setShowHistory(false);
                    }}
                    className="w-full text-left p-4 rounded-2xl border border-black/5 dark:border-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                      {chat.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {chat.messages.length} messages • {new Date(parseInt(chat.id)).toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#14141f] w-full max-w-md rounded-[2rem] shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">Settings</h3>
              </div>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Dark Mode</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Toggle between light and dark themes</div>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="pt-4 border-t border-black/5 dark:border-white/5">
                <div className="font-semibold text-gray-900 dark:text-white mb-2">About Ruixen</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Ruixen is an AI-powered co-architect and build partner designed to help you master complex topics through interactive visualization and guided problem-solving.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

