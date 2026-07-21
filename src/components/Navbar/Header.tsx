'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Sun, 
  Moon, 
  Layout, 
  Code2, 
  FileCode2 
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
}

export const Header: React.FC<HeaderProps> = ({
  onSelectTemplate,
  onExportSvg,
  onExportPng,
  onCopyCode,
  isDarkMode,
  onToggleTheme,
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
        <div 
          style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            borderRadius: '10px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}
        >
          <Sparkles size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Mermaid<span style={{ color: 'var(--accent-primary)' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
            AI Diagram Studio
          </p>
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
