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

  const handleBeforeMount = (monaco: any) => {
    monaco.editor.defineTheme('fblack-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'f9fafb', background: '000000' },
        { token: 'keyword', foreground: '60a5fa', fontStyle: 'bold' },
        { token: 'string', foreground: '93c5fd' },
        { token: 'comment', foreground: '6b7280' },
      ],
      colors: {
        'editor.background': '#000000',
        'editor.foreground': '#f9fafb',
        'editorGutter.background': '#121212',
        'editorLineNumber.foreground': '#525252',
        'editorLineNumber.activeForeground': '#2563eb',
        'editor.lineHighlightBackground': '#18181b',
        'editorCursor.foreground': '#2563eb',
        'editor.selectionBackground': '#1e3a8a80',
        'editor.wordHighlightBackground': '#2563eb20',
        'editor.wordHighlightStrongBackground': '#2563eb30',
        'editor.selectionHighlightBackground': '#2563eb20',
        'editorOverviewRuler.border': '#00000000',
        'editorOverviewRuler.background': '#000000',
        'editorOverviewRuler.currentContentForeground': '#00000000',
        'editorOverviewRuler.wordHighlightForeground': '#00000000',
        'editorOverviewRuler.selectionHighlightForeground': '#00000000',
      },
    });
  };

  return (
    <div className="editor-container" style={{ width: '100%', height: '100%' }}>
      <Editor
        height="100%"
        defaultLanguage="markdown"
        language="markdown"
        theme={isDarkMode ? 'fblack-dark' : 'light'}
        value={value}
        onChange={handleEditorChange}
        beforeMount={handleBeforeMount}
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
          cursorSmoothCaretAnimation: 'on',
          overviewRulerLanes: 0,
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          occurrencesHighlight: 'off',
          selectionHighlight: false,
        }}
      />
    </div>
  );
};
