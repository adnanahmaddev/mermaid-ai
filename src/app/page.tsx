'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Navbar/Header';
import { DiagramCanvas } from '@/components/Canvas/DiagramCanvas';
import { AiPromptPanel } from '@/components/AiSidebar/AiPromptPanel';
import { DIAGRAM_TEMPLATES, DiagramTemplate } from '@/lib/templates';

const CodeEditor = dynamic(
  () => import('@/components/Editor/CodeEditor').then((mod) => mod.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div style={{ flex: 1, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Loading Editor...
      </div>
    )
  }
);

export default function Home() {
  const [diagramCode, setDiagramCode] = useState<string>(DIAGRAM_TEMPLATES[0].code);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [lastSvgContent, setLastSvgContent] = useState<string>('');

  // Template Loader
  const handleSelectTemplate = (template: DiagramTemplate) => {
    setDiagramCode(template.code);
  };

  // AI Generator & Syntax Fixer
  const handleAiGenerate = async (prompt: string, syntaxError?: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          currentCode: diagramCode,
          syntaxError
        }),
      });

      const data = await res.json();

      if (data.code) {
        setDiagramCode(data.code);
      } else if (data.error) {
        alert(`AI Error: ${data.error}`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      alert(`Network Error: ${errorMsg}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Auto-Fix with AI trigger
  const handleFixWithAi = (errorMessage: string) => {
    handleAiGenerate('Fix syntax error', errorMessage);
  };

  // Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(diagramCode);
  };

  // Export SVG
  const handleExportSvg = () => {
    if (!lastSvgContent) return;
    const blob = new Blob([lastSvgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mermaid-diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export PNG
  const handleExportPng = () => {
    if (!lastSvgContent) return;
    const svgBlob = new Blob([lastSvgContent], { type: 'image/svg+xml;charset=utf-8' });
    const URLObj = window.URL || window.webkitURL || window;
    const svgUrl = URLObj.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width * 2 || 1920; // 2x resolution scale
      canvas.height = img.height * 2 || 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = isDarkMode ? '#000000' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'mermaid-diagram.png';
        a.click();
      }
      URLObj.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
      <Header
        onSelectTemplate={handleSelectTemplate}
        onExportSvg={handleExportSvg}
        onExportPng={handleExportPng}
        onCopyCode={handleCopyCode}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        diagramCode={diagramCode}
      />

      <main className="workspace-grid">
        {/* Left Side: Monaco Editor & AI Copilot Panel */}
        <div className="left-panel">
          <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>MERMAID MARKDOWN EDITOR</span>
            <span>LIVE SYNC ON</span>
          </div>
          <CodeEditor
            value={diagramCode}
            onChange={setDiagramCode}
            isDarkMode={isDarkMode}
          />
          <AiPromptPanel
            onGenerate={(prompt) => handleAiGenerate(prompt)}
            isLoading={isAiLoading}
            currentCode={diagramCode}
          />
        </div>

        {/* Right Side: Interactive Diagram Canvas */}
        <DiagramCanvas
          code={diagramCode}
          isDarkMode={isDarkMode}
          onFixWithAi={handleFixWithAi}
          onSvgRendered={setLastSvgContent}
        />
      </main>
    </div>
  );
}
