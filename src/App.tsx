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
${isCanvas ? `
9. Interactive Code Block (Use this when acting as a coding partner, reviewer, or for step-by-step learning where the user needs to fill in the blanks or write code):
{ "type": "interactive_code", "language": "python", "code": "def solve():\\n    # TODO: Fill in the blank\\n    __\\n    return result", "description": "Brief instruction for the user" }
` : ''}
# Tone & Style:
- Use emojis in titles occasionally.
- Keep "text" blocks concise (max 3 sentences).
- Use "callout" blocks for "Pro-tips" or "Common Interview Gotchas."`;

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

