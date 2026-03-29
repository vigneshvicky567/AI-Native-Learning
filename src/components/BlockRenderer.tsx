import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Info, AlertTriangle, CheckCircle2, ListChecks, ArrowRight, Lightbulb } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { GraphVisual } from './GraphVisual';

export interface Block {
  type: string;
  content?: string;
  language?: string;
  title?: string;
  items?: string[];
  data?: Record<string, string>;
  variant?: 'info' | 'warning' | 'success';
  label?: string;
  topic?: string;
  points?: string[];
  nodes?: any[];
  edges?: any[];
}

const markdownComponents = {
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');
    return !inline && match ? (
      <CodeBlock language={match[1]} code={codeString} />
    ) : (
      <code {...props} className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded-md font-mono text-[13px] font-bold border border-gray-200 shadow-sm">
        {children}
      </code>
    );
  }
};

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-5 w-full">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'text':
            return (
              <div key={i} className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{block.content || ''}</ReactMarkdown>
              </div>
            );
            
          case 'code':
            return (
              <CodeBlock key={i} language={block.language || 'text'} code={block.content || ''} />
            );
            
          case 'callout':
            const variants = {
              info: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-900', icon: <Info className="text-blue-500 w-5 h-5" /> },
              warning: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-900', icon: <AlertTriangle className="text-amber-500 w-5 h-5" /> },
              success: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-900', icon: <CheckCircle2 className="text-green-500 w-5 h-5" /> }
            };
            const v = variants[block.variant as keyof typeof variants] || variants.info;
            return (
              <div key={i} className={`flex gap-3 p-4 rounded-xl border-l-4 ${v.bg} ${v.border} shadow-sm my-1`}>
                <div className="flex-shrink-0 mt-0.5">{v.icon}</div>
                <div>
                  {block.label && <h4 className={`font-bold text-sm mb-1 ${v.text}`}>{block.label}</h4>}
                  <div className={`text-[15px] ${v.text} opacity-90 leading-relaxed prose prose-sm max-w-none prose-p:my-0 prose-a:text-blue-600`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{block.content || ''}</ReactMarkdown>
                  </div>
                </div>
              </div>
            );
            
          case 'steps':
            return (
              <div key={i} className="my-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {block.title && (
                  <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-200 flex items-center gap-2.5">
                    <ListChecks className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-gray-900">{block.title}</h4>
                  </div>
                )}
                <div className="p-5 relative">
                  {block.items?.map((item: string, idx: number) => (
                    <div key={idx} className="flex gap-3.5 mb-4 last:mb-0 relative group">
                      {idx !== (block.items?.length || 0) - 1 && (
                        <div className="absolute left-[11px] top-[28px] bottom-[-16px] w-[2px] bg-gray-200"></div>
                      )}
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mt-0.5 shadow-sm relative z-10">
                        {idx + 1}
                      </div>
                      <div className="text-[15px] text-gray-700 pt-0.5 leading-relaxed prose prose-sm max-w-none prose-p:my-0">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{item}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
            
          case 'complexity_table':
            return (
              <div key={i} className="my-2 overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Scenario</th>
                      <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Complexity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(block.data || {}).map(([key, value], idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{key}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">
                          <code className="bg-gray-100 text-pink-600 px-2 py-1 rounded-md font-mono text-xs font-bold border border-gray-200 shadow-sm">{value as React.ReactNode}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
            
          case 'comparison':
            return (
              <div key={i} className="my-2 bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                {block.topic && <h4 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {block.topic}
                </h4>}
                <ul className="space-y-3">
                  {block.points?.map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-[15px] text-gray-700 leading-relaxed">
                      <ArrowRight className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
            
          case 'key_points':
            return (
              <div key={i} className="my-3 flex flex-row flex-wrap gap-3">
                {block.items?.map((item: string, idx: number) => (
                  <div key={idx} className="flex-1 min-w-[200px] bg-gray-50 border border-gray-200 border-l-4 border-l-teal-500 p-4 rounded-lg shadow-sm flex items-start gap-3">
                    <div className="text-[14px] text-gray-800 font-medium leading-relaxed prose prose-sm max-w-none prose-p:my-0 prose-a:text-teal-700">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{item}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            );
            
          case 'diagram':
            return (
              <GraphVisual key={i} title={block.title} nodes={block.nodes || []} edges={block.edges || []} />
            );
            
          default:
            return null;
        }
      })}
    </div>
  );
}
