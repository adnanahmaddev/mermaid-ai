import mermaid from 'mermaid';

let isInitialized = false;
let lastTheme: string | null = null;

export function autoFixMermaidCode(code: string): string {
  if (!code) return code;
  let fixed = code;

  // 1. Ensure structural keywords like 'section', 'subgraph' start on a new line if concatenated without newline
  fixed = fixed.replace(/([^\n])\s*\b(section|subgraph)\b/gi, '$1\n$2');

  // 2. Auto-quote unquoted square bracket node labels containing special characters like (), /, :, &, #, commas
  fixed = fixed.replace(/\b([A-Za-z0-9_\-]+)\[([^\]"\n]*[\(\)\/\:\&\#\,]+[^\]"\n]*)\]/g, (_, id, label) => {
    return `${id}["${label}"]`;
  });

  return fixed;
}

export function initializeMermaid(isDarkMode: boolean = true) {
  if (typeof window === 'undefined') return;

  const theme = isDarkMode ? 'dark' : 'default';

  // Skip re-initialization if the theme hasn't changed — repeated calls to
  // mermaid.initialize() corrupt the parser's internal token/type registry,
  // causing "Cannot read properties of undefined (reading 'type')" errors.
  if (isInitialized && lastTheme === theme) return;

  mermaid.initialize({
    startOnLoad: false,
    theme,
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: 16,
    flowchart: { useMaxWidth: false, htmlLabels: true },
    sequence: { useMaxWidth: false },
    gantt: { useMaxWidth: false, leftPadding: 150 },
    er: { useMaxWidth: false, minEntityWidth: 120, minEntityHeight: 75, diagramPadding: 15 },
    state: { useMaxWidth: false },
    class: { useMaxWidth: false },
    journey: { useMaxWidth: false },
    mindmap: { useMaxWidth: false },
    themeVariables: isDarkMode
      ? {
          darkMode: true,
          background: '#0a0a0c',
          primaryColor: '#2563eb',
          primaryTextColor: '#f8fafc',
          primaryBorderColor: '#3b82f6',
          lineColor: '#94a3b8',
          secondaryColor: '#60a5fa',
          tertiaryColor: '#1e293b',
          textColor: '#f1f5f9',
          titleColor: '#f8fafc',
          sectionBkgColor: '#1e293b',
          altSectionBkgColor: '#0f172a',
          sectionTitleColor: '#f1f5f9',
          gridColor: '#334155',
          taskBkgColor: '#2563eb',
          taskTextColor: '#0f172a',
          taskTextDarkColor: '#0f172a',
          taskTextLightColor: '#ffffff',
          taskTextOutsideColor: '#f1f5f9',
          activeTaskBkgColor: '#3b82f6',
          activeTaskBorderColor: '#60a5fa',
          doneTaskBkgColor: '#475569',
          doneTaskBorderColor: '#64748b',
          critBkgColor: '#ef4444',
          critBorderColor: '#f87171',
          fontSize: '16px'
        }
      : {
          darkMode: false,
          background: '#ffffff',
          primaryColor: '#4f46e5',
          primaryTextColor: '#0f172a',
          primaryBorderColor: '#4338ca',
          lineColor: '#64748b',
          secondaryColor: '#db2777',
          tertiaryColor: '#f1f5f9',
          textColor: '#0f172a',
          titleColor: '#0f172a',
          sectionBkgColor: '#f1f5f9',
          altSectionBkgColor: '#ffffff',
          sectionTitleColor: '#0f172a',
          gridColor: '#e2e8f0',
          taskBkgColor: '#818cf8',
          taskTextColor: '#0f172a',
          taskTextDarkColor: '#0f172a',
          taskTextLightColor: '#ffffff',
          taskTextOutsideColor: '#334155',
          activeTaskBkgColor: '#4f46e5',
          activeTaskBorderColor: '#4338ca',
          doneTaskBkgColor: '#cbd5e1',
          doneTaskBorderColor: '#94a3b8',
          critBkgColor: '#f87171',
          critBorderColor: '#ef4444',
          fontSize: '16px'
        }
  });

  isInitialized = true;
  lastTheme = theme;
}

export async function parseMermaidCode(code: string, isDarkMode: boolean = true): Promise<{ valid: boolean; error?: string }> {
  if (typeof window === 'undefined') return { valid: false, error: 'SSR environment' };

  // Ensure Mermaid is initialized before parsing so the parser has a valid
  // token registry and won't throw "Cannot read properties of undefined (reading 'type')".
  initializeMermaid(isDarkMode);
  
  try {
    const sanitizedCode = autoFixMermaidCode(code);
    await mermaid.parse(sanitizedCode);
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
    const sanitizedCode = autoFixMermaidCode(code);
    // Ensure clean rendering container ID
    const cleanId = `mermaid-render-${id.replace(/[^a-zA-Z0-9]/g, '')}`;
    let { svg } = await mermaid.render(cleanId, sanitizedCode);

    // Strip restrictive inline max-width styles injected by Mermaid so diagram scales properly to canvas
    svg = svg.replace(/style="[^"]*max-width:\s*[^";]+;?/gi, (match) => {
      return match.replace(/max-width:\s*[^";]+;?/gi, '');
    });

    return { svg };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { svg: '', error: errorMessage };
  }
}
