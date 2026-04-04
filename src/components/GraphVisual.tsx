import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, LocateFixed } from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────
const RECT_W = 160;
const RECT_H = 52;
const CIRCLE_SIZE = 80;
const DIAMOND_SIZE = 96;

// ─── Custom Node Components ───────────────────────────────────────────────────

const handleStyle = {
  width: 8,
  height: 8,
  background: '#6366f1',
  border: '2px solid #fff',
  borderRadius: '50%',
};

function RectNode({ data, selected }: any) {
  return (
    <div
      style={{
        width: RECT_W,
        height: RECT_H,
        background: data.color || 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#f8fafc',
        border: selected ? '2px solid #6366f1' : '1.5px solid rgba(255,255,255,0.12)',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 600,
        boxShadow: selected
          ? '0 0 0 3px rgba(99,102,241,0.35), 0 8px 24px rgba(0,0,0,0.3)'
          : '0 4px 14px rgba(0,0,0,0.25)',
        transition: 'all 0.2s ease',
        cursor: 'default',
        letterSpacing: '0.01em',
      }}
    >
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <span style={{ padding: '0 12px', textAlign: 'center', lineHeight: 1.3 }}>
        {data.label}
      </span>
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  );
}

function CircleNode({ data, selected }: any) {
  return (
    <div
      style={{
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        background: data.color || 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        color: '#f8fafc',
        border: selected ? '2px solid #a78bfa' : '1.5px solid rgba(255,255,255,0.18)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 700,
        boxShadow: selected
          ? '0 0 0 3px rgba(167,139,250,0.4), 0 8px 24px rgba(0,0,0,0.3)'
          : '0 4px 14px rgba(0,0,0,0.25)',
        transition: 'all 0.2s ease',
        cursor: 'default',
        textAlign: 'center',
        padding: '0 8px',
        lineHeight: 1.3,
      }}
    >
      {/* Handles at actual top/bottom center of circle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, top: -4 }}
      />
      {data.label}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ ...handleStyle, bottom: -4 }}
      />
    </div>
  );
}

function DiamondNode({ data, selected }: any) {
  return (
    <div
      style={{
        width: DIAMOND_SIZE,
        height: DIAMOND_SIZE,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Visual diamond — purely decorative, does NOT affect handle positions */}
      <div
        style={{
          position: 'absolute',
          inset: 10,
          background: data.color || 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
          border: selected ? '2px solid #38bdf8' : '1.5px solid rgba(255,255,255,0.15)',
          borderRadius: 6,
          transform: 'rotate(45deg)',
          boxShadow: selected
            ? '0 0 0 3px rgba(56,189,248,0.35), 0 8px 24px rgba(0,0,0,0.3)'
            : '0 4px 14px rgba(0,0,0,0.25)',
          transition: 'all 0.2s ease',
        }}
      />
      {/* Label sits on top, un-rotated */}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          color: '#f8fafc',
          fontSize: 12,
          fontWeight: 700,
          textAlign: 'center',
          padding: '0 8px',
          lineHeight: 1.3,
          pointerEvents: 'none',
        }}
      >
        {data.label}
      </span>
      {/* Handles on the bounding box edges */}
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  );
}

const nodeTypes = {
  rect: RectNode,
  circle: CircleNode,
  diamond: DiamondNode,
};

// ─── Dagre Layout ─────────────────────────────────────────────────────────────

function getNodeDimensions(shape?: string) {
  if (shape === 'circle') return { w: CIRCLE_SIZE, h: CIRCLE_SIZE };
  if (shape === 'diamond') return { w: DIAMOND_SIZE, h: DIAMOND_SIZE };
  return { w: RECT_W, h: RECT_H };
}

function getLayoutedElements(nodes: any[], edges: any[], direction = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 80,
    marginx: 20,
    marginy: 20,
  });

  const isHorizontal = direction === 'LR';

  nodes.forEach((node) => {
    const { w, h } = getNodeDimensions(node.data?._shape);
    dagreGraph.setNode(node.id, { width: w, height: h });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const pos = dagreGraph.node(node.id);
      if (!pos) return { ...node, position: { x: 0, y: 0 } };
      const { w, h } = getNodeDimensions(node.data?._shape);
      return {
        ...node,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        position: { x: pos.x - w / 2, y: pos.y - h / 2 },
      };
    }),
    edges,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface GraphVisualProps {
  title?: string;
  nodes: any[];
  edges: any[];
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
}

function GraphVisualInner({ title, nodes: initialNodes = [], edges: initialEdges = [], direction = 'TB' }: GraphVisualProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    // 1. Map incoming nodes → ReactFlow nodes with correct type
    const formattedNodes = initialNodes.map((n, i) => {
      const shape: 'circle' | 'diamond' | 'rect' =
        n.shape === 'circle' ? 'circle' : n.shape === 'diamond' ? 'diamond' : 'rect';

      return {
        id: n.id !== undefined ? String(n.id) : String(i),
        type: shape,
        data: {
          label: n.label ?? n.id,
          color: n.color,
          _shape: shape,       // stored for dagre dimension lookup
        },
        position: n.position || { x: 0, y: 0 },
      };
    });

    const validIds = new Set(formattedNodes.map((n) => n.id));

    // 2. Map edges
    const formattedEdges = initialEdges
      .filter((e) => e.source !== undefined && e.target !== undefined)
      .map((e, i) => ({
        id: e.id ? String(e.id) : `e-${e.source}-${e.target}-${i}`,
        source: String(e.source),
        target: String(e.target),
        label: e.label,
        type: 'smoothstep',
        animated: e.animated ?? false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: '#6366f1',
        },
        style: { stroke: '#6366f1', strokeWidth: 2 },
        labelStyle: { fill: 'currentColor', fontWeight: 600, fontSize: 11 },
        labelBgStyle: { fill: 'var(--bg-color, #1e293b)', fillOpacity: 0.85, rx: 4, ry: 4 },
        labelBgPadding: [6, 4] as [number, number],
      }))
      .filter((e) => validIds.has(e.source) && validIds.has(e.target));

    // 3. Run dagre only when positions are absent
    const needsLayout = formattedNodes.every((n) => !initialNodes.find((o) => String(o.id) === n.id)?.position);
    if (needsLayout) {
      return getLayoutedElements(formattedNodes, formattedEdges, direction);
    }
    return { nodes: formattedNodes, edges: formattedEdges };
  }, [initialNodes, initialEdges, direction]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  // Re-fit when fullscreen toggles
  useEffect(() => {
    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50);
  }, [isFullscreen, fitView]);

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-50 bg-white dark:bg-[#0a0f1e] flex flex-col'
    : 'w-full h-full flex flex-col';

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 backdrop-blur-sm">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-200 tracking-wide">
          {title || 'Graph'}
        </h4>
        <div className="flex items-center gap-1">
          <button
            onClick={() => zoomIn({ duration: 200 })}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => zoomOut({ duration: 200 })}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => fitView({ padding: 0.15, duration: 400 })}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
            title="Fit View"
          >
            <LocateFixed size={14} />
          </button>
          <div className="w-px h-4 bg-gray-300 dark:bg-slate-700 mx-1" />
          <button
            onClick={() => setIsFullscreen((f) => !f)}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, node) => setSelectedNode(node.id === selectedNode ? null : node.id)}
          onPaneClick={() => setSelectedNode(null)}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          nodesDraggable
          preventScrolling={false}
          zoomOnScroll={false}
          panOnScroll={false}
          attributionPosition="bottom-right"
          proOptions={{ hideAttribution: false }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            color="rgba(156, 163, 175, 0.3)"
            gap={20}
            size={1.5}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

// Wrap in provider so useReactFlow works
export function GraphVisual(props: GraphVisualProps) {
  return (
    <ReactFlowProvider>
      <GraphVisualInner {...props} />
    </ReactFlowProvider>
  );
}
