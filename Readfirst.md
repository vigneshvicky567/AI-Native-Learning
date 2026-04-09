# Lexi AI - Project Overview

## About the Project
Lexi AI is an AI-native learning website dashboard inspired by a modern assistant interface. It acts as a Computer Science tutor that teaches algorithms and data structures visually. The application is built using React, Vite, Tailwind CSS, and integrates directly with the Gemini API to provide step-by-step graph tutorials, interactive HTML widgets, and learning checkpoints.

## What Works
- **Chat Interface**: Users can interact with the Gemini API.
- **Visual Tutorials**: The AI can return JSON-based step-by-step graph tutorials or custom interactive HTML widgets (`<visual>` tags).
- **LaTeX Support**: Mathematical equations are rendered beautifully using KaTeX across the chat, tutor view, and block renderer.
- **Skeleton Loading**: High-fidelity skeleton screens (via `boneyard-js`) provide a stable UI during loading states.
- **Checkpoints**: The AI can generate learning checkpoints which are displayed in a sidebar and can be toggled by the user.
- **Code Editor**: A built-in code editor for users to write and "run" code (currently simulated by the AI).
- **UI/UX**: Dark mode toggle, responsive design, and a polished landing page with optimized iframe visualizations (no scrollbars, auto-resizing).

## What Doesn't Work (Needs Improvement)
- **Security**: The application currently calls the Gemini API directly from the client side, exposing the API key.
- **Code Execution**: The "Run Code" feature currently asks Gemini to simulate the output rather than executing it in a secure sandbox.
- **Persistence**: Chat history and checkpoints are stored in local React state and are lost upon page refresh. There is no database integration yet.

## File Structure in Brief

### Root Files
- `package.json`: Project dependencies and scripts.
- `metadata.json`: Application metadata (name, description).
- `FASTAPI_ARCHITECTURE.md`: Documentation outlining the planned FastAPI backend architecture.
- `Readfirst.md`: This file.

### `src/` Directory
- `main.tsx`: Entry point. Includes `boneyard-js` registry and ResizeObserver fixes.
- `App.tsx`: Main application component. Manages global state and Gemini API communication.
- `index.css`: Global CSS, including Tailwind imports and custom styles.
- `bones/`: Contains generated skeleton screen definitions and registry.

### `src/components/` Directory
- `LandingPage.tsx`: Initial screen with hero section and quick-start cards.
- `ChatView.tsx`: Main chat interface. Includes `VisualFrame` for sandboxed visualizations.
- `TutorView.tsx`: Renders structured JSON data (graphs, code, complexity, quizzes). Now supports LaTeX in explanations.
- `BlockRenderer.tsx`: Renders various content blocks with LaTeX support.
- `GraphVisual.tsx`: Renders node/edge graph visualizations using XYFlow.
- `CodeBlock.tsx`: Syntax-highlighted code snippets.
- `Cards.tsx` & `Greeting.tsx`: UI components for the landing and chat start states.

## Actions Taken & Outcomes
- **Action**: Integrated LaTeX rendering support.
- **Outcome**: Added `remark-math`, `rehype-katex`, and `katex`. Mathematical formulas are now correctly rendered in `ChatView`, `TutorView`, and `BlockRenderer`.
- **Action**: Optimized Iframe visualization rendering.
- **Outcome**: Fixed `VisualFrame` in `ChatView.tsx` to prevent scrollbars (`scrolling="no"`) and implemented a robust auto-resize mechanism.
- **Action**: Integrated `boneyard-js` for skeleton screens.
- **Outcome**: Captured skeletons for `Greeting` and `Cards`. Users now see stable loading states that match the final layout.
- **Action**: Updated `TutorView` for better educational content.
- **Outcome**: Switched to `ReactMarkdown` for labels and complexity explanations to support LaTeX and rich formatting.
- **Action**: Implemented the "Defend Button" system in `TutorView.tsx`.
- **Outcome**: In "Deep Work" mode, users must answer AI-generated challenges to progress through steps.
- **Action**: Added an `appMode` state to control the learning experience.
- **Outcome**: Users can switch between "Deep Work", "Crisis Mode", and "Quick Check" via a new selector in the header.
- **Action**: Performed methodical code review and optimization of `TutorView.tsx`.
- **Outcome**: 
  - **Performance**: Moved CSS-in-render to `index.css`, preventing layout thrashing and font re-loading.
  - **AI Handling**: Implemented robust JSON extraction for Gemini responses.
  - **Educational Context**: Replaced static BST questions with context-aware AI challenges based on the current algorithm step.
  - **Accessibility**: Added `aria-label` to all symbol-only buttons for screen reader support.
  - **Render Waste**: Memoized expensive array transformations and code rendering using `useMemo`.
