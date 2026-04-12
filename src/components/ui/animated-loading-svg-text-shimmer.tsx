import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TextShimmer } from './text-shimmer';

// ---------------------------------------------------------------------------
// Loader Component - Animated Shape Loader
// ---------------------------------------------------------------------------

const SHAPES = [
  {
    name: "Processing...",
    color: "#6366f1", // indigo
    path: "M 50 50 C 66 33 83 33 83 50 C 83 67 66 67 50 50 C 34 33 17 33 17 50 C 17 67 34 67 50 50"
  },
  {
    name: "Analyzing context",
    color: "#22c55e", // green
    path: "M 50 10 A 40 40 0 1 1 49.9 10 M 35 38 A 2 2 0 1 1 34.9 38 M 65 38 A 2 2 0 1 1 64.9 38 M 30 60 Q 50 80 70 60"
  },
  {
    name: "Synthesizing",
    color: "#10b981", // emerald
    path: "M 50 10 A 40 40 0 1 1 49.9 10 M 28 40 Q 35 30 42 40 M 58 40 Q 65 30 72 40 M 25 55 Q 50 85 75 55"
  },
  {
    name: "Refining response",
    color: "#a855f7", // purple
    path: "M 50 10 A 40 40 0 1 1 49.9 10 M 35 38 A 4 4 0 1 1 34.9 38 M 65 38 A 4 4 0 1 1 64.9 38 M 50 65 A 6 6 0 1 1 49.9 65"
  },
  {
    name: "Fact checking",
    color: "#f59e0b", // amber
    path: "M 50 10 A 40 40 0 1 1 49.9 10 M 35 38 A 3 3 0 1 1 34.9 38 M 65 38 A 3 3 0 1 1 64.9 38 M 35 65 Q 40 60 50 65 T 65 65"
  },
  {
    name: "Drafting output",
    color: "#64748b", // slate
    path: "M 50 10 A 40 40 0 1 1 49.9 10 M 28 40 L 42 40 M 58 40 L 72 40 M 40 65 Q 50 62 60 65"
  }
];

interface ShapeLoaderProps {
  shapePath: string;
  size?: number | string;
  strokeWidth?: number | string;
  color?: string;
  onCycle?: () => void;
  className?: string;
}

const ShapeLoader = ({ shapePath, size = 120, strokeWidth = 6, color = "currentColor", onCycle, className }: ShapeLoaderProps) => {
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
      if (!isReady) setIsReady(true);
    }
  }, [shapePath]);

  return (
    <div 
      className={cn("relative flex items-center justify-center animate-[floatRotate_8s_ease-in-out_infinite]", className)} 
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>
          {`
            @keyframes drawStroke {
              0% {
                stroke-dashoffset: var(--path-length);
                opacity: 0;
              }
              10% {
                opacity: 1;
              }
              45%, 55% {
                stroke-dashoffset: 0;
                opacity: 1;
              }
              90% {
                opacity: 1;
              }
              100% {
                stroke-dashoffset: calc(var(--path-length) * -1);
                opacity: 0;
              }
            }
            @keyframes floatRotate {
              0%, 100% { transform: translateY(0) rotate(0deg) scale(0.98); }
              50% { transform: translateY(-2px) rotate(4deg) scale(1.02); }
            }
            .shape-path {
              stroke-dasharray: var(--path-length);
              stroke-dashoffset: var(--path-length);
            }
          `}
        </style>
        <path
          ref={pathRef}
          d={shapePath}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ '--path-length': pathLength } as React.CSSProperties}
          onAnimationIteration={onCycle}
          className={cn(
            "shape-path transition-colors duration-1000",
            isReady ? "animate-[drawStroke_3.5s_infinite]" : "opacity-0"
          )}
        />
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Loading Breadcrumb Component - Animated Loading State with Shimmer Text
// ---------------------------------------------------------------------------

interface LoadingBreadcrumbProps {
  texts?: string[];
  className?: string;
}

export function LoadingBreadcrumb({ 
  texts = [], 
  className 
}: LoadingBreadcrumbProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentShape = SHAPES[currentIdx];
  
  // Use the provided texts if available, otherwise use the shape names
  const [currentText, setCurrentText] = useState(texts.length > 0 ? texts[0] : currentShape.name);

  const handleCycle = () => {
    setCurrentIdx((prev) => (prev + 1) % SHAPES.length);
    if (texts.length > 0) {
      const randomIndex = Math.floor(Math.random() * texts.length);
      setCurrentText(texts[randomIndex]);
    } else {
      setCurrentText(SHAPES[(currentIdx + 1) % SHAPES.length].name);
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-3 text-[15px] font-medium tracking-wide",
      className
    )}>
      <ShapeLoader 
        shapePath={currentShape.path} 
        size={22} 
        strokeWidth={currentShape.name === "Processing..." ? 8 : 6} 
        color={currentShape.color} 
        onCycle={handleCycle}
      />
      
      <TextShimmer duration={2}>
        {currentText}
      </TextShimmer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Example Usage
// ---------------------------------------------------------------------------

export default function LoadingBreadcrumbDemo() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <LoadingBreadcrumb />
    </div>
  );
}
