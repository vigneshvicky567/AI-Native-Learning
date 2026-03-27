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
            systemInstruction: "You are a helpful AI learning assistant. Provide clear, concise, and educational answers. Use markdown for formatting.",
          }
        });
        setChatSession(session);
      }

      const response = await session.sendMessage({ message: text });
      
      const newModelMsg: Message = { role: 'model', text: response.text || "I couldn't generate a response." };
      setMessages(prev => [...prev, newModelMsg]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error processing your request." }]);
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

