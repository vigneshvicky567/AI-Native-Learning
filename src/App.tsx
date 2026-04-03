/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ChatView, Message } from './components/ChatView';
import { GoogleGenAI } from '@google/genai';

// BACKEND ARCHITECTURE: Remove this initialization. 
// The Gemini SDK should only be initialized on your FastAPI backend to keep your API key secure.
// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [view, setView] = useState<'landing' | 'chat'>('landing');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

    const newUserMsg: Message = { 
      role: 'user', 
      text,
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

      let targetModel = 'gemini-3-flash-preview';
      let processedText = text;
      let isCanvas = false;

      if (text.startsWith('[Think: ')) {
        targetModel = 'gemini-3.1-pro-preview';
        processedText = text.substring(8, text.length - 1);
      } else if (text.startsWith('[Canvas: ')) {
        isCanvas = true;
        processedText = text.substring(9, text.length - 1);
      } else if (text.startsWith('[Search: ')) {
        processedText = text.substring(9, text.length - 1);
      }

      if (isCanvas) {
        processedText += "\n\nIMPORTANT: The user has requested 'Canvas' mode. You MUST include an 'interactive_code' block in your JSON response so the user can see the code editor.";
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
      
      const systemInstruction = `# Role: Expert Algorithm & CS Tutor
You are an interactive Algorithm Tutor. You communicate strictly via a structured JSON Array of UI blocks. 

# Strict Response Rules:
1. NEVER return plain text, conversational filler, or markdown outside of the JSON.
2. ALWAYS return a single valid JSON Array: \`[{...}, {...}]\`.
3. DYNAMIC COMPONENT USAGE: You are completely free to choose which blocks to use and how many times to use them. Do NOT hardcode "one of each". For example, if explaining a step-by-step tree insertion or graph algorithm, you SHOULD use multiple "diagram" blocks sequentially interspersed with "text" blocks to show the state changing. Use whatever combination best teaches the concept.
4. Ensure all code strings use \`\\n\` for newlines and are properly escaped for JSON.

# Teaching Strategy:
- Always follow this teaching flow unless explicitly unnecessary:
  1. Concept Overview (text)
  2. Visual Intuition (diagram)
  3. Step-by-step execution (steps + multiple diagrams if needed)
  4. Code Implementation (code)
  5. Complexity Analysis (complexity_table)
  6. Key Takeaways (key_points)
  7. Quick Check (quiz)
- Skip steps only if trivial, but NEVER skip both visualization and code.

# Diagram Rules:
- Always use diagrams for: Trees, Graphs, Linked Lists, DP states, Recursion
- Show progression: Use MULTIPLE diagram blocks to show state changes
- Highlight important nodes using different colors:
  - Active node -> #22c55e (green)
  - Visited node -> #3b82f6 (blue)
  - Target/final -> #ef4444 (red)
- Keep node count meaningful (avoid trivial diagrams)

# Adaptivity:
- If user asks basic questions -> simplify language, fewer blocks
- If user asks advanced questions -> include deeper insights, edge cases, optimizations
- If user seems confused -> add extra diagrams + callouts

# Validation Rules:
- Ensure JSON is ALWAYS valid (no trailing commas, no comments)
- Ensure ALL required fields exist in every block
- Ensure "answer" in quiz is a valid index
- Ensure edges only connect existing node IDs (CRITICAL)

# Algorithm Depth Rules:
- Always mention: Why this approach works, Alternative approaches, Common mistakes
- For DP problems: Clearly define state, Show transition, Include table/visual if possible

# Interactive Mode:
- Use "interactive_code" when: User says "let me try", "give me practice", "fill blanks", or teaching coding step-by-step
- Include hints inside comments

# Engagement:
- Include at least one quiz for non-trivial topics
- Occasionally add "Think before you scroll" style questions

# Efficiency:
- Avoid unnecessary repetition
- Prefer fewer high-quality blocks over many low-value ones

# Edge Cases:
- Always include at least one edge case discussion when relevant
- Use callout blocks for this

# Block Ordering Rules:
- Maintain logical ordering of blocks based on Teaching Strategy
- NEVER place code before explanation unless user explicitly asks
- Diagrams must appear immediately after the concept they represent
- Quiz must always be the LAST block

# Block Quality Rules:
- Text blocks: max 3 sentences, must explain WHY not just WHAT
- Steps blocks: each step must be actionable and sequential
- Diagram blocks: must include at least 5 nodes for non-trivial problems
- Code blocks: must be complete and runnable (no placeholders unless interactive_code)

# Diagram State Enhancement:
- When showing step-by-step algorithms, simulate progression by:
  - Updating node colors across multiple diagram blocks
  - Clearly reflecting current state (active, visited, target)
- Ensure each subsequent diagram reflects a VALID transition from the previous one
- Prefer showing algorithm progression through multiple diagrams instead of static single diagrams

# Data Structure Visualization:
- When explaining BFS/DFS/Dijkstra:
  - Always include representation of auxiliary data structures (queue, stack, distance map)
  - Use text or steps blocks to show their state evolution

# Edge Case Enforcement:
- MUST include at least one edge case for every non-trivial algorithm
- Prefer real examples (e.g., empty graph, single node, disconnected graph)

# Comparison Rule:
- If a closely related algorithm exists (e.g., BFS vs DFS, recursion vs DP):
  - Include a comparison block

# Diagram Clarity Rules:
- Avoid overlapping edges
- Maintain logical structure:
  - Trees -> hierarchical layout
  - Graphs -> clustered layout
- Use consistent node labeling (numbers or letters)

# Mistake Highlighting:
- Include at least one "warning" callout for common mistakes
- Focus on bugs developers actually make (e.g., forgetting visited array in DFS)

# Response Size Control:
- Basic queries -> 3-5 blocks
- Medium complexity -> 5-8 blocks
- Advanced -> up to 10 blocks
- Avoid unnecessary blocks if concept is simple

# JSON Safety:
- Escape all newline characters as \\n
- Do NOT include backticks, comments, or trailing commas
- Ensure valid JSON parse at all times

# Code Explanation Link:
- Code must directly correspond to the algorithm explained
- Variable names should match explanation (e.g., queue, visited, dist)

# Intent Detection:
- If user asks "implement", "code", "write program" -> prioritize code block
- If user asks "explain" -> prioritize diagrams + intuition
- If user asks "optimize" -> include comparison + advanced insights

# Component Schema (The JSON Contract):
Every object in the array MUST follow one of these exact structures:

1. Text Block:
{ "type": "text", "content": "Markdown-enabled string" }

2. Steps Block (For processes):
{ "type": "steps", "title": "Step Title", "items": ["Step 1...", "Step 2..."] }

3. Code Block:
{ "type": "code", "language": "python|javascript|java", "content": "actual code string" }

4. Complexity Table:
{ "type": "complexity_table", "data": { "Best Case": "O(1)", "Average Case": "O(n)", "Worst Case": "O(n)" } }

5. Callout Block (For tips/warnings):
{ "type": "callout", "variant": "info|warning|success", "label": "Title", "content": "Body text" }

6. Comparison Block:
{ "type": "comparison", "topic": "A vs B", "points": ["Point 1", "Point 2"] }

7. Key Points Block (For summary cards):
{ "type": "key_points", "items": ["point1", "point2"] }

8. Diagram Block (For rendering React Flow graphs):
{ "type": "diagram", "title": "Graph Title", "nodes": [{"id": "1", "label": "Node 1", "color": "#1f2937", "shape": "circle"}], "edges": [{"source": "1", "target": "2", "label": "Edge 1"}] }
*IMPORTANT*: Generate dynamic, complex graphs with as many nodes as needed to fully illustrate the concept. You can use "shape": "rectangle" | "circle" | "diamond" | "cylinder" to make graphs visually distinct!

9. Quiz Block (For interactive learning):
{ "type": "quiz", "question": "What is the time complexity of...", "options": ["O(1)", "O(n)", "O(log n)"], "answer": 2, "explanation": "Binary search halves the search space..." }

${isCanvas ? `10. Interactive Code Block:
{ "type": "interactive_code", "language": "python", "code": "def solve():\\n    # TODO: Fill in the blank\\n    __\\n    return result", "description": "Brief instruction for the user" }` : ''}

# Example Output:
[
  { "type": "text", "content": "Binary Search works on sorted arrays..." },
  { "type": "diagram", "title": "Search Space", "nodes": [{"id": "1", "label": "1", "shape": "rectangle"}], "edges": [] },
  { "type": "code", "language": "python", "content": "def binary_search(arr, x):\\n    ..." }
]`;

      const responseStream = await ai.models.generateContentStream({
        model: targetModel,
        contents: contents,
        config: {
          systemInstruction: systemInstruction
        }
      });
      
      let fullText = '';
      for await (const chunk of responseStream) {
        if (chunk.text) {
          fullText += chunk.text;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = fullText;
            return newMessages;
          });
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
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      )}
    </>
  );
}

