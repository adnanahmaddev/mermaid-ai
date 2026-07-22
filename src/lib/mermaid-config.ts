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

  // 3. Strip redundant quotes in sequence diagram actor/participant aliases (e.g. actor User as "👤 User" -> actor User as 👤 User)
  fixed = fixed.replace(/^(\s*)(actor|participant)\s+([^\n"'\s]+)\s+as\s+["']([^"'\n]+)["']/gim, '$1$2 $3 as $4');

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
    sequence: { useMaxWidth: false, boxMargin: 10, noteMargin: 10 },
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
          taskTextColor: '#ffffff',
          taskTextDarkColor: '#ffffff',
          taskTextLightColor: '#ffffff',
          taskTextOutsideColor: '#f1f5f9',
          activeTaskBkgColor: '#3b82f6',
          activeTaskBorderColor: '#60a5fa',
          doneTaskBkgColor: '#475569',
          doneTaskBorderColor: '#64748b',
          critBkgColor: '#ef4444',
          critBorderColor: '#f87171',
          // Sequence diagram specific theme variables
          actorBkg: '#1e293b',
          actorBorder: '#3b82f6',
          actorTextColor: '#f8fafc',
          actorLineColor: '#334155',
          signalColor: '#60a5fa',
          signalTextColor: '#f8fafc',
          labelBoxBkgColor: '#121212',
          labelBoxBorderColor: '#334155',
          labelTextColor: '#a1a1aa',
          loopTextColor: '#d4d4d8',
          noteBkgColor: '#1e1e1e',
          noteTextColor: '#f8fafc',
          noteBorderColor: '#3b82f6',
          activationBkgColor: '#2563eb',
          activationBorderColor: '#3b82f6',
          sequenceNumberColor: '#ffffff',
          todayLineColor: '#60a5fa',
          fontSize: '16px'
        }
      : {
          darkMode: false,
          background: '#ffffff',
          primaryColor: '#ffffff',
          primaryTextColor: '#0f172a',
          primaryBorderColor: '#4f46e5',
          lineColor: '#4f46e5',
          secondaryColor: '#e0e7ff',
          tertiaryColor: '#f1f5f9',
          textColor: '#0f172a',
          titleColor: '#0f172a',
          sectionBkgColor: '#f1f5f9',
          altSectionBkgColor: '#ffffff',
          sectionTitleColor: '#0f172a',
          gridColor: '#e2e8f0',
          taskBkgColor: '#818cf8',
          taskBorderColor: '#4f46e5',
          taskTextColor: '#ffffff',
          taskTextDarkColor: '#ffffff',
          taskTextLightColor: '#ffffff',
          taskTextOutsideColor: '#334155',
          activeTaskBkgColor: '#4f46e5',
          activeTaskBorderColor: '#4338ca',
          doneTaskBkgColor: '#cbd5e1',
          doneTaskBorderColor: '#94a3b8',
          critBkgColor: '#f87171',
          critBorderColor: '#ef4444',
          todayLineColor: '#4f46e5',
          // Sequence diagram specific theme variables
          actorBkg: '#ffffff',
          actorBorder: '#4f46e5',
          actorTextColor: '#0f172a',
          actorLineColor: '#cbd5e1',
          signalColor: '#4f46e5',
          signalTextColor: '#0f172a',
          labelBoxBkgColor: '#f1f5f9',
          labelBoxBorderColor: '#cbd5e1',
          labelTextColor: '#334155',
          loopTextColor: '#1e293b',
          noteBkgColor: '#fffbeb',
          noteTextColor: '#78350f',
          noteBorderColor: '#f59e0b',
          activationBkgColor: '#e0e7ff',
          activationBorderColor: '#4f46e5',
          sequenceNumberColor: '#ffffff',
          edgeLabelBackground: '#ffffff',
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

export function prepareExportableSvg(rawSvg: string, isDarkMode: boolean = true): string {
  if (typeof window === 'undefined' || !rawSvg) return rawSvg;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
    const svgEl = doc.documentElement;

    if (!svgEl || svgEl.tagName.toLowerCase() !== 'svg') return rawSvg;

    const bgColor = isDarkMode ? '#000000' : '#ffffff';
    const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
    const subtextColor = isDarkMode ? '#a1a1aa' : '#475569';
    const actorBkg = isDarkMode ? '#1e1e1e' : '#ffffff';
    const actorBorder = isDarkMode ? '#3b82f6' : '#4f46e5';
    const lineStroke = isDarkMode ? '#60a5fa' : '#4f46e5';

    // 1. Embed background rect as first element if not present
    let bgRect: Element | null = doc.getElementById('mermaid-export-bg');
    if (!bgRect) {
      const newBgRect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
      newBgRect.setAttribute('id', 'mermaid-export-bg');
      newBgRect.setAttribute('width', '100%');
      newBgRect.setAttribute('height', '100%');
      newBgRect.setAttribute('fill', bgColor);
      svgEl.insertBefore(newBgRect, svgEl.firstChild);
    } else {
      bgRect.setAttribute('fill', bgColor);
    }

    // 2. Ensure self-contained inline SVG styles
    let styleEl: Element | null = svgEl.querySelector('style');
    if (!styleEl) {
      const newStyleEl = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
      svgEl.appendChild(newStyleEl);
      styleEl = newStyleEl;
    }

    const embeddedStyles = `
      #mermaid-export-bg { fill: ${bgColor} !important; }
      svg { background-color: ${bgColor} !important; font-family: Inter, system-ui, -apple-system, sans-serif !important; }
      .node rect, .node polygon, .node circle, .actor, .classGroup, .entityBox, .stateGroup, .mindmap-node rect, .mindmap-node polygon, .mindmap-node circle, g.mindmap-node rect, g.mindmap-node circle { fill: ${actorBkg} !important; stroke: ${actorBorder} !important; stroke-width: 1.5px !important; rx: 6px !important; ry: 6px !important; }
      text, tspan, .node text, .node text tspan, text.actor, text.actor > tspan, .classText, .mindmap-node text, .mindmap-node text tspan, text.entityTitle, text.attribute-name, text.attribute-type, text.attribute-key { fill: ${textColor} !important; font-weight: 500 !important; font-family: Inter, system-ui, -apple-system, sans-serif !important; }
      rect.attribute-box, .attribute-box-odd, .attribute-box-even { fill: ${isDarkMode ? '#0f172a' : '#f8fafc'} !important; stroke: ${isDarkMode ? '#334155' : '#cbd5e1'} !important; }
      .cluster rect, .cluster polygon, .labelBox { fill: ${isDarkMode ? 'rgba(15, 23, 42, 0.7)' : 'rgba(241, 245, 249, 0.75)'} !important; stroke: ${isDarkMode ? '#334155' : '#cbd5e1'} !important; rx: 8px !important; }
      .cluster-title, .cluster span, .labelText, .labelText > tspan { fill: ${subtextColor} !important; font-weight: 600 !important; font-size: 12px !important; }
      .edgePath path, .flowchart-link, .messageLine0, .messageLine1, .er.relationshipLine, path.er, .mindmap-line, path.mindmap-line { stroke: ${lineStroke} !important; stroke-width: 1.5px !important; }
      [id$="-arrowhead"] path, .marker, marker path, .er.relationshipLineHead { fill: ${lineStroke} !important; stroke: ${lineStroke} !important; }
      .actor-line { stroke: ${isDarkMode ? '#334155' : '#cbd5e1'} !important; stroke-width: 1.5px !important; stroke-dasharray: 4 4 !important; }
      .edgeLabel, .edgeLabel p, .edgeLabel text, .edgeLabel span, .messageText, .er.relationshipLabel { color: ${textColor} !important; fill: ${textColor} !important; font-size: 12px !important; font-weight: 500 !important; }
      .edgeLabel rect, .edgeLabel polygon { fill: ${isDarkMode ? '#0f172a' : '#ffffff'} !important; stroke: ${isDarkMode ? '#334155' : '#cbd5e1'} !important; rx: 4px !important; ry: 4px !important; }
      .er.relationshipLabelBox { fill: ${isDarkMode ? '#0f172a' : '#ffffff'} !important; stroke: ${isDarkMode ? '#334155' : '#cbd5e1'} !important; }
      .sequenceNumber { fill: #ffffff !important; font-weight: 700 !important; font-size: 11px !important; }
      [id$="-sequencenumber"] { fill: ${actorBorder} !important; stroke: ${actorBorder} !important; stroke-width: 1.5px !important; }
      .sectionTitle { fill: ${textColor} !important; font-weight: 600 !important; }
      .grid text, .tick text { fill: ${subtextColor} !important; }
      .task0, .task1, .task2, .task3 { fill: ${actorBkg} !important; stroke: ${actorBorder} !important; rx: 4px !important; }
      .active0, .active1, .active2, .active3 { fill: ${isDarkMode ? '#2563eb' : '#6366f1'} !important; stroke: ${lineStroke} !important; rx: 4px !important; }
      .done0, .done1, .done2, .done3 { fill: ${isDarkMode ? '#334155' : '#cbd5e1'} !important; stroke: ${isDarkMode ? '#475569' : '#94a3b8'} !important; rx: 4px !important; }
      .crit0, .crit1, .crit2, .crit3 { fill: ${isDarkMode ? '#7f1d1d' : '#f87171'} !important; stroke: #ef4444 !important; rx: 4px !important; }
      .taskText, .taskText0, .taskText1, .taskText2, .taskText3, .taskTextDark0, .taskTextDark1, .taskTextDark2, .taskTextDark3, .doneText0, .doneText1, .doneText2, .doneText3, .activeText0, .activeText1, .activeText2, .activeText3 { fill: #ffffff !important; font-weight: 600 !important; }
      .taskTextOutsideRight, .taskTextOutsideLeft { fill: ${textColor} !important; }
    `;

    styleEl.textContent = (styleEl.textContent || '') + embeddedStyles;

    return new XMLSerializer().serializeToString(doc);
  } catch {
    return rawSvg;
  }
}
