import { useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

interface Marker {
  message: string;
  startLineNumber: number;
  endLineNumber: number;
  startColumn: number;
  endColumn: number;
}

export function useAiErrorFix(
  editorRef: React.RefObject<any>,
  monacoRef: React.RefObject<any>,
  language: string,
  onCodeChange: (code: string) => void
) {
  const isFixingRef = useRef(false);

  const fixError = useCallback(async (marker: Marker, fullCode: string) => {
    if (isFixingRef.current) return;
    isFixingRef.current = true;

    // Show a "Fixing..." decoration on the error line
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const loadingDecorations = editor.deltaDecorations([], [{
      range: new monaco.Range(
        marker.startLineNumber, 1,
        marker.endLineNumber, 1
      ),
      options: {
        isWholeLine: true,
        className: 'ai-fixing-line',
        glyphMarginClassName: 'ai-fixing-glyph',
      }
    }]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Fix this ${language} code error. Return ONLY the corrected full code, no explanation, no markdown fences.

Error: ${marker.message}
Error at line ${marker.startLineNumber}

Full code:
${fullCode}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });

      let fixedCode = response.text || '';
      // Strip any accidental markdown fences
      fixedCode = fixedCode.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();

      if (fixedCode.trim()) {
        // Animate the replacement — full model edit with undo support
        editor.executeEdits('ai-fix', [{
          range: editor.getModel().getFullModelRange(),
          text: fixedCode.trim(),
        }]);
        onCodeChange(fixedCode.trim());
      }
    } catch (err) {
      console.error('AI fix failed:', err);
    } finally {
      editor.deltaDecorations(loadingDecorations, []);
      isFixingRef.current = false;
    }
  }, [editorRef, monacoRef, language, onCodeChange]);

  return { fixError };
}
