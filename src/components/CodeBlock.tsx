import React, { useState } from 'react';
import { Check, Copy, Code2, ChevronDown, ChevronUp } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-800 shadow-sm my-3 bg-[#282C34]">
      <div 
        className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#21252B] cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-gray-400 text-xs font-mono">
          <Code2 className="w-3.5 h-3.5" />
          <span>{language || 'text'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors bg-gray-800 hover:bg-gray-700 px-2.5 py-1 rounded-md border border-gray-700"
          title="Copy code"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-medium">Copy</span>
            </>
          )}
        </button>
      </div>
      {isOpen && (
        <SyntaxHighlighter
          style={oneDark}
          language={language || 'text'}
          customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px', padding: '16px', background: 'transparent' }}
        >
          {code}
        </SyntaxHighlighter>
      )}
    </div>
  );
}
