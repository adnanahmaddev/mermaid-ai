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
  '🛡️ Error Handling',
  '🔀 Sequence Diagram',
  '📊 Metrics Node',
  '🎨 Simplify Layout'
];

export const AiPromptPanel: React.FC<AiPromptPanelProps> = ({
  onGenerate,
  isLoading,
  currentCode,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [showPills, setShowPills] = useState(false);

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
    <div className="floating-ai-bar">
      {/* Quick Refactoring Pills */}
      {showPills && currentCode && (
        <div className="floating-ai-pills">
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

      <form onSubmit={handleSubmit} className="floating-ai-input-wrapper">
        <div className="floating-ai-icon" title="AI Diagram Copilot">
          <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
        </div>
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder={
            currentCode 
              ? "Ask AI to edit diagram (e.g. 'Add Redis cache layer')..."
              : "Describe a diagram (e.g. 'Flowchart of checkout system')..."
          }
          className="floating-ai-input"
          disabled={isLoading}
        />
        
        {currentCode && (
          <button
            type="button"
            onClick={() => setShowPills(!showPills)}
            className="btn-icon"
            title="Quick Refactoring Presets"
            style={{
              height: '32px',
              width: '32px',
              color: showPills ? 'var(--accent-primary)' : 'var(--text-muted)'
            }}
          >
            <Wand2 size={15} />
          </button>
        )}

        <button 
          type="submit" 
          disabled={isLoading || !inputPrompt.trim()} 
          className="btn-primary"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem', borderRadius: 'var(--radius-sm)' }}
        >
          {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          <span>{isLoading ? 'Generating' : 'Generate'}</span>
        </button>
      </form>
    </div>
  );
};
