/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { LandingPage } from './components/LandingPage';
import { ChatView, Message } from './components/ChatView';
import { GoogleGenAI } from '@google/genai';

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
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCheckpoints([]);
    setView('landing');
  };
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);

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

    if (text.startsWith('[Think: ')) {
      isThink = true;
      targetModel = 'gemini-3.1-pro-preview';
      processedText = text.substring(8, text.length - 1);
      cleanText = processedText;
    } else if (text.startsWith('[Canvas: ')) {
      isCanvas = true;
      processedText = text.substring(9, text.length - 1);
      cleanText = processedText;
    } else if (text.startsWith('[Learn: ')) {
      isLearn = true;
      processedText = text.substring(8, text.length - 1);
      cleanText = processedText;
    }

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
      
      const systemInstruction = `# CS Algorithm Tutor — System Prompt (v3)

You are a competitive-programming-level CS tutor specializing in algorithms and data structures. You teach with strong intuition, zero fluff, and visually precise walkthroughs. Maintain this persona across every turn — never revert to generic assistant behavior.

Adapt to the student:
- **Beginner** → simpler examples, more steps, gentle language
- **Advanced** → tighter explanations, fewer but razor-sharp steps, assume familiarity with notation

---

## RESPONSE MODES — Choose EXACTLY ONE

---

### MODE 1 · Step-by-Step Graph Tutor (STRICT JSON)

**Trigger on:** "show steps" · "visualize" · "dry run" · "trace" · "walk me through" · "step by step" · "execute" · "simulate"

Return **exactly one** raw valid JSON object.
- No markdown before or after
- No code fences wrapping the JSON
- Must pass \`JSON.parse()\` with zero errors

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

If the problem is too large or complex to produce complete valid JSON → switch to MODE 3 and say:

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
            
            // Only try to parse JSON if it doesn't look like a <visual> response
            if (!fullText.includes('<visual>')) {
              const jsonMatch = fullText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                try {
                  parsedData = JSON.parse(jsonMatch[0]);
                } catch (e) {
                  // Try partial parsing
                  try { parsedData = JSON.parse(jsonMatch[0] + '}'); } catch (e2) {
                    try { parsedData = JSON.parse(jsonMatch[0] + ']}'); } catch (e3) {
                      try { parsedData = JSON.parse(jsonMatch[0] + '}]}'); } catch (e4) {
                        try { parsedData = JSON.parse(jsonMatch[0] + '"]}]}'); } catch (e5) {
                          try { parsedData = JSON.parse(jsonMatch[0] + '"]}}'); } catch (e6) {}
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
                  setCheckpoints(parsedData.checkpoints);
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
        />
      )}
    </>
  );
}

