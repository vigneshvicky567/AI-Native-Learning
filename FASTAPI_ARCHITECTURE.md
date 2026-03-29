# FastAPI Backend Architecture Guide

This document outlines the architecture and endpoints you need to build in your new FastAPI backend to replace the current client-side logic.

## Architecture Overview

Currently, this React application talks directly to the Gemini API. This is great for prototyping, but in a production environment, it exposes your API key and limits what you can do (like securely executing code or saving user data to a database).

**The New Architecture:**
1. **Frontend (React/Vite)**: Handles the UI, rendering markdown, managing local state, and displaying the code editor.
2. **Backend (FastAPI)**: Acts as the secure middleman. It securely holds your Gemini API key, talks to the Gemini API, manages your database (PostgreSQL/MongoDB), and securely executes code.

```text
[ React Frontend ]  <-- HTTP/WebSockets -->  [ FastAPI Backend ]
                                                    |
                                    +---------------+---------------+
                                    |                               |
                            [ Gemini API ]                  [ Database ]
```

## Required FastAPI Endpoints

Here are the endpoints you should build in your FastAPI app to support the current frontend features:

### 1. Chat & AI Generation
Currently, `App.tsx` uses `@google/genai` to stream responses directly. You should replace this with a streaming FastAPI endpoint.

* **Endpoint**: `POST /api/chat/message`
* **Description**: Receives the user's message (and any base64 encoded files), sends it to Gemini using the Python SDK, and streams the response back to the frontend.
* **Request Body**:
  ```json
  {
    "session_id": "uuid-string",
    "message": "Explain quicksort",
    "files": [
      { "mime_type": "image/png", "data": "base64_string..." }
    ]
  }
  ```
* **Response**: Server-Sent Events (SSE) or WebSocket streaming the text chunks back to the client.

### 2. Chat History (Database)
Currently, messages are stored in React state and lost on refresh.

* **Endpoint**: `GET /api/chat/history/{session_id}`
* **Description**: Fetches previous messages from your database to populate the UI on load.
* **Response**:
  ```json
  {
    "messages": [
      { "role": "user", "text": "Hello" },
      { "role": "model", "text": "Hi there! How can I help?" }
    ]
  }
  ```

### 3. Secure Code Execution
Currently, the "Run Code" button just sends a prompt to Gemini asking it to *simulate* running the code. With a backend, you can actually run the code securely.

* **Endpoint**: `POST /api/code/execute`
* **Description**: Receives code from the frontend editor, runs it in a secure sandbox (like a Docker container or using a service like Piston), and returns the actual `stdout` and `stderr`.
* **Request Body**:
  ```json
  {
    "language": "python",
    "code": "print('Hello World')"
  }
  ```
* **Response**:
  ```json
  {
    "stdout": "Hello World\n",
    "stderr": "",
    "exit_code": 0
  }
  ```

### 4. Checkpoints / Progress Tracking
Currently, the tasks in `ChecklistSidebar.tsx` are hardcoded.

* **Endpoint**: `GET /api/progress`
* **Description**: Fetches the user's current learning checkpoints.
* **Response**:
  ```json
  {
    "tasks": [
      { "id": 1, "title": "Complete Python Basics", "completed": true },
      { "id": 2, "title": "Review Calculus Limits", "completed": false }
    ]
  }
  ```

* **Endpoint**: `PUT /api/progress/{task_id}`
* **Description**: Toggles the completion status of a specific task.
* **Request Body**: `{ "completed": true }`

## Next Steps for the Frontend
I have added comments throughout your React codebase (look for `// BACKEND ARCHITECTURE:`) to show exactly where you need to swap out the current logic for `fetch()` calls to your new FastAPI endpoints.
