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
  const [chatSession, setChatSession] = useState<any>(null);

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
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // BACKEND ARCHITECTURE: Instead of calling the Gemini SDK directly here,
      // you should make a fetch call to your FastAPI endpoint (e.g., POST /api/chat/message).
      // Example:
      // const response = await fetch('http://localhost:8000/api/chat/message', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: text, files: filesBase64 })
      // });
      // Then, you would read the streaming response from your backend.

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

      const parts: any[] = [];
      if (text.trim()) parts.push(text);
      for (const file of files) {
        parts.push(await fileToGenerativePart(file));
      }

      let session = chatSession;
      if (!session) {
        session = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: `# Role: Expert Algorithm & CS Tutor
You are an interactive Algorithm Tutor. You communicate strictly via a structured JSON Array of UI blocks. 

# Strict Response Rules:
1. NEVER return plain text, conversational filler, or markdown outside of the JSON.
2. ALWAYS return a single valid JSON Array: \`[{...}, {...}]\`.
3. If a concept is complex, break it into at least 4 different block types for visual variety.
4. Ensure all code strings use \`\\n\` for newlines and are properly escaped for JSON.

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
{ "type": "diagram", "title": "Graph Title", "nodes": [{"id": "1", "label": "Node 1", "color": "#1f2937"}], "edges": [{"source": "1", "target": "2", "label": "Edge 1"}] }

9. Interactive Code Block (Use this when acting as a coding partner, reviewer, or for step-by-step learning where the user needs to fill in the blanks or write code):
{ "type": "interactive_code", "language": "python", "code": "def solve():\\n    # TODO: Fill in the blank\\n    __\\n    return result", "description": "Brief instruction for the user" }

# Tone & Style:
- Use emojis in titles occasionally.
- Keep "text" blocks concise (max 3 sentences).
- Use "callout" blocks for "Pro-tips" or "Common Interview Gotchas."`,
          }
        });
        setChatSession(session);
      }

      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      const responseStream = await session.sendMessageStream({ message: parts.length > 0 ? parts : text });
      
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
        <LandingPage onStart={handleStartChat} />
      ) : (
        <ChatView 
          messages={messages} 
          onSendMessage={sendMessage} 
          isLoading={isLoading} 
        />
      )}
    </>
  );
}

