'use client';

import React, { useState } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  Sun, 
  Moon, 
  Layout, 
  Code2, 
  FileCode2,
  PanelLeft,
  PanelLeftClose
} from 'lucide-react';
import { DIAGRAM_TEMPLATES, DiagramTemplate } from '@/lib/templates';

interface HeaderProps {
  onSelectTemplate: (template: DiagramTemplate) => void;
  onExportSvg: () => void;
  onExportPng: () => void;
  onCopyCode: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  diagramCode: string;
  isEditorOpen: boolean;
  onToggleEditor: () => void;
}

const PencilSparkles: React.FC<{ size?: number }> = ({ size = 19 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Pencil Body */}
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
    {/* Sparkle 1 (Top Left) */}
    <path d="M4.5 4L5 2.5L6.5 2L5 1.5L4.5 0L4 1.5L2.5 2L4 2.5Z" fill="currentColor" stroke="none" />
    {/* Sparkle 2 (Bottom Right Accent) */}
    <path d="M19.5 17L20 15.5L21.5 15L20 14.5L19.5 13L19 14.5L17.5 15L19 15.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  onSelectTemplate,
  onExportSvg,
  onExportPng,
  onCopyCode,
  isDarkMode,
  onToggleTheme,
  isEditorOpen,
  onToggleEditor,
}) => {
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleCopy = () => {
    onCopyCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="header-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onToggleEditor}
          className="btn-icon"
          title={isEditorOpen ? "Collapse Editor" : "Expand Editor"}
          style={{ background: isEditorOpen ? 'var(--bg-tertiary)' : 'transparent' }}
        >
          {isEditorOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
        </button>

        <div 
          style={{
            background: 'var(--accent-primary)',
            borderRadius: '10px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}
        >
          <PencilSparkles size={19} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
            MermaidAI
          </h1>
          <span 
            style={{ 
              fontSize: '0.68rem', 
              fontWeight: 600, 
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              background: 'var(--bg-tertiary)', 
              color: 'var(--text-muted)', 
              padding: '0.15rem 0.5rem', 
              borderRadius: '9999px',
              border: '1px solid var(--border-color)'
            }}
          >
            Studio
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Template Selector */}
        <div style={{ position: 'relative' }}>
          <select
            onChange={(e) => {
              const selected = DIAGRAM_TEMPLATES.find(t => t.id === e.target.value);
              if (selected) onSelectTemplate(selected);
            }}
            defaultValue=""
            className="btn-secondary"
            style={{
              paddingRight: '1.75rem',
              appearance: 'none',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="" disabled>Load Starter Template...</option>
            {DIAGRAM_TEMPLATES.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                {tmpl.name} ({tmpl.category})
              </option>
            ))}
          </select>
          <Layout size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
        </div>

        {/* Copy Code */}
        <button onClick={handleCopy} className="btn-secondary" title="Copy Mermaid Code">
          {copied ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
          <span>{copied ? 'Copied' : 'Copy Code'}</span>
        </button>

        {/* Export Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)} 
            className="btn-primary"
          >
            <Download size={16} />
            <span>Export</span>
          </button>

          {showExportMenu && (
            <div 
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                boxShadow: 'var(--shadow-glow)',
                zIndex: 30,
                minWidth: '160px'
              }}
            >
              <button 
                onClick={() => { onExportSvg(); setShowExportMenu(false); }}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <Code2 size={15} /> Export as SVG
              </button>
              <button 
                onClick={() => { onExportPng(); setShowExportMenu(false); }}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <FileCode2 size={15} /> Export as PNG
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button onClick={onToggleTheme} className="btn-icon" title="Toggle Light/Dark Theme">
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
