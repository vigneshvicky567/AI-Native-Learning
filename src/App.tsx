/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ChatView, Message } from './components/ChatView';
import { GoogleGenAI } from '@google/genai';

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

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
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

# Tone & Style:
- Use emojis in titles occasionally.
- Keep "text" blocks concise (max 3 sentences).
- Use "callout" blocks for "Pro-tips" or "Common Interview Gotchas."`,
          }
        });
        setChatSession(session);
      }

      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      const responseStream = await session.sendMessageStream({ message: text });
      
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

