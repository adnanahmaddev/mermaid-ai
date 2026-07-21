'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Wand2 } from 'lucide-react';

interface AiPromptPanelProps {
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
  currentCode: string;
}

const QUICK_PILLS = [
  '⚡ Add Cache Layer',
  '🛡️ Add Error Handling & Retry',
  '🔀 Convert to Sequence Diagram',
  '📊 Add Metrics Logging Node',
  '🎨 Simplify & Clean Layout'
];

export const AiPromptPanel: React.FC<AiPromptPanelProps> = ({
  onGenerate,
  isLoading,
  currentCode,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;
    await onGenerate(inputPrompt);
    setInputPrompt('');
  };

  const handlePillClick = async (pillText: string) => {
    if (isLoading) return;
    const cleanPrompt = pillText.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\s*/u, '');
    await onGenerate(cleanPrompt);
  };

  return (
    <div className="ai-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
          <span>AI Diagram Copilot</span>
        </div>
        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
          {currentCode ? 'Mode: Refactor Existing Diagram' : 'Mode: Create New Diagram'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="ai-input-wrapper">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder={
            currentCode 
              ? "Ask AI to edit existing diagram (e.g. 'Add Redis cache between API and DB')..."
              : "Describe a diagram (e.g. 'Flowchart of user registration with email verification')..."
          }
          className="ai-input"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !inputPrompt.trim()} 
          className="btn-primary"
          style={{ minWidth: '95px', justifyContent: 'center' }}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          <span>{isLoading ? 'Generating' : 'Generate'}</span>
        </button>
      </form>

      {/* Quick Refactoring Pills */}
      {currentCode && (
        <div className="quick-pills">
          {QUICK_PILLS.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => handlePillClick(pill)}
              disabled={isLoading}
              className="pill-btn"
            >
              {pill}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
