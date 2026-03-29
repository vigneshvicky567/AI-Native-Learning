import React from 'react';
import { PromptInputBox } from './ui/ai-prompt-box';

interface InputAreaProps {
  onSubmit?: (text: string, files?: File[]) => void;
  isLoading?: boolean;
}

export function InputArea({ onSubmit, isLoading }: InputAreaProps) {
  const handleSend = (message: string, files?: File[]) => {
    if (onSubmit) {
      onSubmit(message, files);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative font-sans">
      <PromptInputBox 
        onSend={handleSend} 
        isLoading={isLoading} 
        placeholder="What do you want to learn today?"
      />
    </div>
  );
}
