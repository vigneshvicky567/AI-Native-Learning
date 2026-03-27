/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { ChatView, Message } from './components/ChatView';

export default function App() {
  const [view, setView] = useState<'landing' | 'chat'>('landing');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Editor state
  const [code, setCode] = useState<string>("# Write your Python code here\ndef hello_world():\n    print('Hello, AI Learner!')\n\nhello_world()");
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    // Generate a new session ID when component mounts
    setSessionId(crypto.randomUUID());
  }, []);

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
      // Create conversation history for context
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.text
      }));

      // In LEX-AI, we should call the tutor endpoint
      const response = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_message: text,
          conversation_history: conversationHistory,
          current_task: null,
          code_context: code
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      const newModelMsg: Message = {
        role: 'model',
        text: data.reply || "I couldn't generate a response."
      };
      
      setMessages(prev => [...prev, newModelMsg]);

      // Check if the AI wants to update the editor
      if (data.write_to_editor && data.code_suggestion && data.code_suggestion.code) {
        setCode(data.code_suggestion.code);
        setIsEditorOpen(true);
      }
    } catch (error) {
      console.error("Error calling backend API:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error communicating with the server." }]);
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
          code={code}
          setCode={setCode}
          isEditorOpen={isEditorOpen}
          setIsEditorOpen={setIsEditorOpen}
        />
      )}
    </>
  );
}
