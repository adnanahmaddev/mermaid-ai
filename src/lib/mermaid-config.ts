import mermaid from 'mermaid';

let isInitialized = false;

export function initializeMermaid(isDarkMode: boolean = true) {
  if (typeof window === 'undefined') return;

  mermaid.initialize({
    startOnLoad: false,
    theme: isDarkMode ? 'dark' : 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    themeVariables: isDarkMode
      ? {
          darkMode: true,
          background: '#000000',
          primaryColor: '#2563eb',
          primaryTextColor: '#f8fafc',
          primaryBorderColor: '#3b82f6',
          lineColor: '#94a3b8',
          secondaryColor: '#60a5fa',
          tertiaryColor: '#1e1e1e'
        }
      : {
          darkMode: false,
          background: '#ffffff',
          primaryColor: '#4f46e5',
          primaryTextColor: '#0f172a',
          primaryBorderColor: '#4338ca',
          lineColor: '#64748b',
          secondaryColor: '#db2777',
          tertiaryColor: '#f1f5f9'
        }
  });

  isInitialized = true;
}

export async function parseMermaidCode(code: string): Promise<{ valid: boolean; error?: string }> {
  if (typeof window === 'undefined') return { valid: false, error: 'SSR environment' };
  
  try {
    await mermaid.parse(code);
    return { valid: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { valid: false, error: errorMessage };
  }
}

export async function renderMermaidSvg(
  id: string,
  code: string,
  isDarkMode: boolean = true
): Promise<{ svg: string; error?: string }> {
  if (typeof window === 'undefined') return { svg: '', error: 'SSR environment' };

  try {
    initializeMermaid(isDarkMode);
    // Ensure clean rendering container ID
    const cleanId = `mermaid-render-${id.replace(/[^a-zA-Z0-9]/g, '')}`;
    const { svg } = await mermaid.render(cleanId, code);
    return { svg };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { svg: '', error: errorMessage };
  }
}
