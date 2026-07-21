'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  AlertCircle, 
  Wand2,
  PanelLeft,
  Loader2,
  Sparkles
} from 'lucide-react';
import { renderMermaidSvg, parseMermaidCode } from '@/lib/mermaid-config';

interface DiagramCanvasProps {
  code: string;
  isDarkMode: boolean;
  onFixWithAi: (errorMessage: string) => void;
  onSvgRendered?: (svgString: string) => void;
  isEditorOpen?: boolean;
  onToggleEditor?: () => void;
  isAiLoading?: boolean;
  children?: React.ReactNode;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  code,
  isDarkMode,
  onFixWithAi,
  onSvgRendered,
  isEditorOpen = true,
  onToggleEditor,
  isAiLoading = false,
  children
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;
    renderIdRef.current += 1;
    const currentRenderId = renderIdRef.current;

    async function updateDiagram() {
      if (!code || !code.trim()) {
        setSvgContent('');
        setErrorMessage(null);
        return;
      }

      setIsRendering(true);

      // Validate syntax first
      const validation = await parseMermaidCode(code, isDarkMode);

      if (!validation.valid) {
        if (isMounted && currentRenderId === renderIdRef.current) {
          setErrorMessage(validation.error || 'Mermaid Syntax Error');
          setIsRendering(false);
        }
        return;
      }

      // Render SVG
      const result = await renderMermaidSvg(String(currentRenderId), code, isDarkMode);

      if (isMounted && currentRenderId === renderIdRef.current) {
        if (result.error) {
          setErrorMessage(result.error);
        } else {
          setSvgContent(result.svg);
          setErrorMessage(null);
          if (onSvgRendered) onSvgRendered(result.svg);
        }
        setIsRendering(false);
      }
    }

    const timer = setTimeout(updateDiagram, 300); // 300ms debounce
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [code, isDarkMode, onSvgRendered]);

  // Zoom controls
  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.2, 0.4));
  const handleResetZoom = () => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Mouse pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="canvas-panel">
      {/* Floating restore editor button when collapsed */}
      {!isEditorOpen && onToggleEditor && (
        <button
          onClick={onToggleEditor}
          className="btn-secondary floating-editor-toggle"
          title="Open Code Editor"
          style={{
            position: 'absolute',
            top: '1.25rem',
            left: '1.25rem',
            zIndex: 15,
            boxShadow: 'var(--shadow-glow)',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(12px)',
            padding: '0.45rem 0.85rem',
            fontSize: '0.825rem'
          }}
        >
          <PanelLeft size={16} />
          <span>Show Editor</span>
        </button>
      )}

      {/* Error Notification Bar */}
      {errorMessage && (
        <div className="error-banner" style={{ margin: '1rem', zIndex: 15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, color: 'var(--color-danger)' }} />
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <strong>Syntax Error:</strong> {errorMessage}
            </div>
          </div>
          <button 
            onClick={() => onFixWithAi(errorMessage)} 
            disabled={isAiLoading}
            className="btn-primary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', flexShrink: 0 }}
          >
            {isAiLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Fixing...</span>
              </>
            ) : (
              <>
                <Wand2 size={14} />
                <span>Fix with AI</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Main SVG Viewport */}
      <div 
        className="canvas-viewport"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isAiLoading && (
          <div className="canvas-ai-loading-overlay">
            <div className="canvas-ai-loading-card">
              <Sparkles size={18} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
              <span>AI Copilot is generating diagram...</span>
            </div>
          </div>
        )}

        {isRendering && !isAiLoading && (
          <div style={{ position: 'absolute', top: '4.5rem', right: '1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-glass)', backdropFilter: 'blur(12px)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', zIndex: 15, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '12px', height: '12px', border: '2px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Rendering...
          </div>
        )}

        {!errorMessage && svgContent ? (
          <div 
            style={{
              transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomScale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : !errorMessage ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.9rem' }}>Type Mermaid syntax or prompt AI to generate a diagram.</p>
          </div>
        ) : null}
      </div>

      {/* Floating AI Action Bar */}
      {children}

      {/* Glassmorphic Floating Toolbar */}
      <div className="floating-toolbar">
        <button onClick={handleZoomIn} className="btn-icon" title="Zoom In">
          <ZoomIn size={16} />
        </button>
        <button onClick={handleZoomOut} className="btn-icon" title="Zoom Out">
          <ZoomOut size={16} />
        </button>
        <button onClick={handleResetZoom} className="btn-icon" title="Reset View">
          <RotateCcw size={16} />
        </button>
        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 0.2rem' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '40px', textAlign: 'center' }}>
          {Math.round(zoomScale * 100)}%
        </span>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
