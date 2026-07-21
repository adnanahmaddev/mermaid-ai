'use client';

import React from 'react';
import Editor, { OnChange } from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  isDarkMode: boolean;
  hasError?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  isDarkMode,
}) => {
  const handleEditorChange: OnChange = (newValue) => {
    if (newValue !== undefined) {
      onChange(newValue);
    }
  };

  return (
    <div className="editor-container" style={{ width: '100%', height: '100%' }}>
      <Editor
        height="100%"
        defaultLanguage="markdown"
        language="markdown"
        theme={isDarkMode ? 'vs-dark' : 'light'}
        value={value}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          fontFamily: "'Fira Code', monospace",
          wordWrap: 'on',
          tabSize: 2,
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on'
        }}
      />
    </div>
  );
};
