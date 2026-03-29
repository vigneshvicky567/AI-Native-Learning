import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface GraphVisualProps {
  title?: string;
  nodes: any[];
  edges: any[];
}

export function GraphVisual({ title, nodes, edges }: GraphVisualProps) {
  const rfNodes = useMemo(() => {
    return nodes.map((n, i) => ({
      id: n.id || String(i),
      position: n.position || { x: (i % 3) * 200 + 50, y: Math.floor(i / 3) * 100 + 50 },
      data: { label: n.label || n.id },
      style: {
        background: n.color || '#1f2937', // dark background
        color: '#ffffff', // white text
        border: '1px solid #374151',
        borderRadius: '8px',
        padding: '10px 16px',
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }
    }));
  }, [nodes]);

  const rfEdges = useMemo(() => {
    return edges.map((e, i) => ({
      id: e.id || `e-${e.source}-${e.target}-${i}`,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: true,
      style: { stroke: '#9ca3af', strokeWidth: 2 },
      labelStyle: { fill: '#374151', fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8, rx: 4, ry: 4 }
    }));
  }, [edges]);

  return (
    <div className="my-3 border border-gray-200 rounded-xl shadow-sm overflow-hidden bg-white flex flex-col">
      {title && (
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
        </div>
      )}
      <div className="h-[400px] w-full relative">
        <ReactFlow nodes={rfNodes} edges={rfEdges} fitView attributionPosition="bottom-right">
          <Background color="#e5e7eb" gap={16} />
          <Controls />
          <MiniMap nodeColor={(n) => n.style?.background as string || '#1f2937'} />
        </ReactFlow>
      </div>
    </div>
  );
}
