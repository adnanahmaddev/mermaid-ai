'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Navbar/Header';
import { DiagramCanvas } from '@/components/Canvas/DiagramCanvas';
import { AiPromptPanel } from '@/components/AiSidebar/AiPromptPanel';
import { DIAGRAM_TEMPLATES, DiagramTemplate } from '@/lib/templates';
import { prepareExportableSvg } from '@/lib/mermaid-config';

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
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(true);

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

  // Clear Canvas Code
  const handleClearCode = () => {
    setDiagramCode('');
  };

  // Export SVG
  const handleExportSvg = () => {
    if (!lastSvgContent) return;
    const formattedSvg = prepareExportableSvg(lastSvgContent, isDarkMode);
    const blob = new Blob([formattedSvg], { type: 'image/svg+xml' });
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

    try {
      // Clean SVG to remove external font @import rules that taint HTML5 canvas
      let cleanSvg = prepareExportableSvg(lastSvgContent, isDarkMode);
      cleanSvg = cleanSvg.replace(/@import\s+url\([^)]+\);?/gi, '');

      // Parse dimensions to ensure accurate canvas scaling
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(cleanSvg, 'image/svg+xml');
      const svgEl = svgDoc.documentElement;

      let width = parseFloat(svgEl.getAttribute('width') || '0');
      let height = parseFloat(svgEl.getAttribute('height') || '0');

      if (!width || !height) {
        const viewBox = svgEl.getAttribute('viewBox');
        if (viewBox) {
          const parts = viewBox.split(/[\s,]+/).map(Number);
          if (parts.length === 4) {
            width = parts[2];
            height = parts[3];
          }
        }
      }

      width = width || 800;
      height = height || 600;

      svgEl.setAttribute('width', String(width));
      svgEl.setAttribute('height', String(height));
      cleanSvg = new XMLSerializer().serializeToString(svgDoc);

      const encodedSvg = encodeURIComponent(cleanSvg);
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const scale = 2; // 2x high resolution rendering
        const canvas = document.createElement('canvas');
        canvas.width = (img.naturalWidth || width) * scale;
        canvas.height = (img.naturalHeight || height) * scale;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = isDarkMode ? '#000000' : '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          try {
            const pngUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = 'mermaid-diagram.png';
            a.click();
          } catch (taintErr) {
            console.error('Canvas export tainted:', taintErr);
            handleExportSvg();
          }
        }
      };

      img.onerror = () => {
        handleExportSvg();
      };

      img.src = dataUrl;
    } catch (err) {
      console.error('PNG conversion error:', err);
      handleExportSvg();
    }
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
      <Header
        onSelectTemplate={handleSelectTemplate}
        onExportSvg={handleExportSvg}
        onExportPng={handleExportPng}
        onCopyCode={handleCopyCode}
        onClearCode={handleClearCode}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        diagramCode={diagramCode}
        isEditorOpen={isEditorOpen}
        onToggleEditor={() => setIsEditorOpen(!isEditorOpen)}
      />

      <main className={`workspace-grid ${!isEditorOpen ? 'editor-collapsed' : ''}`}>
        {/* Left Side: Monaco Markdown Code Editor */}
        <div className={`left-panel ${!isEditorOpen ? 'collapsed' : ''}`}>
          <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>MERMAID MARKDOWN EDITOR</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {diagramCode && (
                <button
                  onClick={handleClearCode}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.725rem' }}
                  title="Clear editor code"
                >
                  Clear
                </button>
              )}
              <span>LIVE SYNC ON</span>
            </div>
          </div>
          <CodeEditor
            value={diagramCode}
            onChange={setDiagramCode}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Right Side: Interactive Canvas with Floating AI Copilot Action Bar */}
        <DiagramCanvas
          code={diagramCode}
          isDarkMode={isDarkMode}
          onFixWithAi={handleFixWithAi}
          onSvgRendered={setLastSvgContent}
          isEditorOpen={isEditorOpen}
          onToggleEditor={() => setIsEditorOpen(!isEditorOpen)}
          isAiLoading={isAiLoading}
        >
          <AiPromptPanel
            onGenerate={(prompt) => handleAiGenerate(prompt)}
            isLoading={isAiLoading}
            currentCode={diagramCode}
          />
        </DiagramCanvas>
      </main>
    </div>
  );
}
