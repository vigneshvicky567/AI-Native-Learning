"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowDownUp,
  Network,
  GitMerge,
  BrainCircuit,
  Search,
  Activity,
  Code2,
  Lightbulb,
  Paperclip,
  ArrowUpIcon
} from "lucide-react";

interface AutoResizeProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`; // reset first
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

export default function RuixenMoonChat({ onStart }: { onStart?: (prompt: string) => void }) {
  const [message, setMessage] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  });

  const handleSubmit = () => {
    if (message.trim() && onStart) {
      onStart(message);
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center flex flex-col items-center"
      style={{
        backgroundImage:
          "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png')",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Centered AI Title */}
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-white drop-shadow-sm">
            Lexi AI
          </h1>
          <p className="mt-2 text-neutral-200">
            What do you want to learn today?
          </p>
        </div>
      </div>

      {/* Input Box Section */}
      <div className="w-full max-w-3xl mb-[10vh] md:mb-[20vh] px-4 md:px-0">
        <div className="relative bg-black/60 backdrop-blur-md rounded-xl border border-neutral-700">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustHeight();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Type your request..."
            className={cn(
              "w-full px-4 py-3 resize-none border-none",
              "bg-transparent text-white text-sm",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-neutral-400 min-h-[48px]"
            )}
            style={{ overflow: "hidden" }}
          />

          {/* Footer Buttons */}
          <div className="flex items-center justify-between p-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-neutral-700"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Button
                disabled={!message.trim()}
                onClick={handleSubmit}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  !message.trim() ? "bg-neutral-700 text-neutral-400 cursor-not-allowed" : "bg-white text-black hover:bg-neutral-200"
                )}
              >
                <ArrowUpIcon className="w-4 h-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-start md:justify-center overflow-x-auto no-scrollbar w-full pb-2 md:pb-0 md:flex-wrap gap-2 md:gap-3 mt-6 px-1 md:px-0">
          <div className="flex items-center gap-2 md:gap-3 flex-nowrap md:flex-wrap w-max md:w-auto mx-auto">
            <QuickAction 
              icon={<Lightbulb className="w-4 h-4" />} 
              label="Learn" 
              onClick={() => onStart?.("Explain the fundamental concepts of algorithms and data structures to a beginner. Start with arrays and linked lists.")} 
            />
            <QuickAction 
              icon={<Code2 className="w-4 h-4" />} 
              label="Code" 
              onClick={() => onStart?.("Generate a clean, well-commented Python implementation of the Merge Sort algorithm, including its time and space complexity.")} 
            />
            <QuickAction 
              icon={<Activity className="w-4 h-4" />} 
              label="Simulate" 
              onClick={() => onStart?.("Simulate the execution of Dijkstra's shortest path algorithm on a small sample graph, showing the step-by-step state changes.")} 
            />
            <QuickAction 
              icon={<Network className="w-4 h-4" />} 
              label="Visualize" 
              onClick={() => onStart?.("Create a visual diagram representing a Binary Search Tree (BST) and explain how insertion works visually.")} 
            />
            <QuickAction 
              icon={<BrainCircuit className="w-4 h-4" />} 
              label="Patterns" 
              onClick={() => onStart?.("What are the most common algorithmic patterns (like Sliding Window, Two Pointers) used in coding interviews? Provide examples.")} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function QuickAction({ icon, label, onClick }: QuickActionProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border-neutral-700 bg-black/50 text-neutral-300 hover:text-white hover:bg-neutral-700"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  );
}
