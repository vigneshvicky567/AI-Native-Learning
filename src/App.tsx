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
      
      const systemInstruction = `You are an expert CS tutor that teaches algorithms and data structures visually.

For EVERY response, you must return a single valid JSON object (no markdown, no extra text).

## SCHEMA:

{
  "explanation": "string — plain english summary, 2-3 sentences max",

  "steps": [
    {
      "stepIndex": 0,
      "label": "string — what is happening at this step",
      "nodes": [
        { "id": "1", "label": "1", "shape": "circle|rect|diamond", "color": "#hex", "state": "active|visited|queued|default" }
      ],
      "edges": [
        { "source": "1", "target": "2", "label": "optional", "animated": true }
      ],
      "dataStructure": {
        "type": "stack|queue|heap|none",
        "items": [3, 1, 4],
        "current": 3
      },
      "highlightLine": 2
    }
  ],

  "code": {
    "language": "python",
    "lines": [
      { "lineIndex": 0, "text": "def dfs(graph, node, visited):" },
      { "lineIndex": 1, "text": "    if node in visited: return" },
      { "lineIndex": 2, "text": "    visited.add(node)" },
      { "lineIndex": 3, "text": "    for neighbor in graph[node]:" },
      { "lineIndex": 4, "text": "        dfs(graph, neighbor, visited)" }
    ]
  },

  "complexity": {
    "time": "O(V + E)",
    "space": "O(V)",
    "explanation": "We visit every vertex and edge once"
  },

  "comparison": [
    { "property": "Time", "left": "O(V+E)", "right": "O(V+E)", "winner": "tie|left|right" },
    { "property": "Space", "left": "O(V)", "right": "O(H)", "winner": "right" }
  ],

  "quiz": {
    "question": "What data structure does BFS use?",
    "options": ["Stack", "Queue", "Heap", "Array"],
    "answer": 1
  }
}

## RULES:

- steps[] drives ALL animation — every graph change must be a new step
- highlightLine in each step must match the lineIndex of the code line executing at that moment
- node states map to colors: active=#6366f1, visited=#64748b, queued=#f59e0b, default=#1e293b
- If topic has no graph (e.g. sorting), use nodes as array indices, edges as comparisons
- comparison[] only if user asks to compare two things
- quiz is optional — add when a concept is fully explained
- Never explain the JSON. Never wrap in markdown. Raw JSON only.`;

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
          
          // Try to extract JSON from the text
          const jsonMatch = fullText.match(/\{[\s\S]*\}/);
          let parsedData = null;
          
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
          
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = fullText;
            if (parsedData) {
              newMessages[newMessages.length - 1].tutorData = parsedData;
            }
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

