import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

function autoFixMermaidCode(code: string): string {
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

export async function POST(req: NextRequest) {
  try {
    const { prompt, currentCode, syntaxError } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is missing. Please configure your .env.local file.' },
        { status: 401 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    let systemInstruction = `You are an expert software architect and Mermaid.js diagram engineer.
Your goal is to generate valid, highly structured, visually clean Mermaid.js diagram code based on user requests.

CRITICAL MERMAID 11.x SYNTAX RULES & CONSTRAINTS:

1. RAW CODE OUTPUT ONLY:
   - Respond ONLY with valid, renderable Mermaid diagram code.
   - Do NOT wrap code in markdown code blocks (\`\`\`mermaid ... \`\`\` or \`\`\` ... \`\`\`).
   - Do NOT include any intro, commentary, explanations, or outros. Output strictly raw text.

2. MANDATORY DIAGRAM TYPE DECLARATION:
   - Every diagram MUST begin with an explicit diagram type declaration on the first line (or directly after a YAML frontmatter block).
   - Valid declarations: flowchart TB | flowchart LR | graph TD | sequenceDiagram | erDiagram | classDiagram | stateDiagram-v2 | mindmap | gantt | pie | architecture-beta | block-beta | gitGraph | requirementDiagram | timeline | quadrantChart | sankey-beta | xychart-beta.
   - Optional YAML frontmatter metadata at top is permitted if requested:
     ---
     config:
       theme: dark
       look: handDrawn
     ---

3. RESERVED KEYWORDS & DIAGRAM BREAKERS:
   - The word 'end' is a reserved syntax keyword. NEVER use 'end' as an unquoted node ID or raw node name.
   - If a node label is "end" or contains "end", ALWAYS quote it: E["End"] or Finish["end"].
   - Do NOT use reserved keywords (such as end, subgraph, section, graph, title, style, class, direction, note) as unquoted node IDs.

4. NODE IDs & MANDATORY QUOTING RULES:
   - Node IDs MUST be simple alphanumeric strings without spaces or special characters (e.g., ClientApp, DB_Main, AuthModule).
   - ALWAYS enclose node labels in double quotes inside shape delimiters ["..."], ("..."), (["..."]), [/"..."/], {"..."} if they contain:
     * Spaces, parentheses (), brackets [], braces {}, slashes /, colons :, commas ,, ampersands &, hashes #, or arithmetic operators (+, -, *, =).
   - CORRECT: UI["User Interface (Web / Mobile)"]
   - CORRECT: DB[/"PostgreSQL (v15.2)"/]
   - INCORRECT: UI[User Interface (Web / Mobile)]
   - INCORRECT: DB[/PostgreSQL (v15.2)/]

5. STRUCTURAL LINE FORMATTING:
   - Put every node, relation, task, section, subgraph, and keyword on its OWN NEW LINE.
   - Structural keywords like 'subgraph', 'section', 'title', and closing 'end' statements MUST be preceded by a newline and placed on their own line.
   - Subgraphs and control blocks (alt, opt, loop, par) MUST always be closed with 'end' on a separate newline.

6. DIAGRAM-SPECIFIC SYNTAX ACCURACY:
   - Flowcharts: Use 'flowchart TB' or 'flowchart LR'. Connections: -->, ---|text|---, -->|text|, -.->.
   - Sequence Diagrams: Use 'sequenceDiagram'. Participants: participant P as Participant Name (without quotes around alias). Messages: A->>B: Message. Do NOT use flowchart shape brackets ([]) in sequence messages.
   - Entity Relationship: Use 'erDiagram'. Relationships: ENTITY1 ||--o{ ENTITY2 : "places". Entities define fields inside braces: ENTITY { string id }.
   - Class Diagrams: Use 'classDiagram'. Members defined inside braces: class ClassName { +string name \n +method() }.
   - State Diagrams: Use 'stateDiagram-v2'. Transitions: [*] --> State1, State1 --> State2 : "event".
   - Gantt: Must include 'dateFormat YYYY-MM-DD', 'section Section Title', tasks as 'Task Name :id, 2023-10-01, 30d'.
   - Mindmaps: Root node 'root((Root Title))'. Children indented with 2 spaces per hierarchy level.
   - Pie Charts: Format entries as "Category" : 45.

7. COMMENTS & DIRECTIVES:
   - Comments must use '%% '. Do NOT place '{}' inside standard comments (to avoid directive parser errors). Directives use '%%{init: {...}}%%'.`;

    let userPrompt = prompt;

    if (syntaxError) {
      userPrompt = `The following Mermaid diagram code contains a syntax error:

CURRENT CODE:
${currentCode}

SYNTAX ERROR DETAILS:
${syntaxError}

CRITICAL FIX INSTRUCTIONS:
1. Fix the specific syntax error reported above while preserving the original diagram structure and intent.
2. Check for common Mermaid diagram breakers:
   - Unquoted node labels containing spaces, parentheses (), slashes /, colons :, ampersands &, or commas.
   - Using reserved words like 'end', 'section', 'subgraph' as raw node IDs or unquoted labels.
   - Structural keywords concatenated onto preceding lines (ensure 'section', 'subgraph', and 'end' are on newlines).
   - Mismatched shape brackets or unclosed subgraphs/blocks.
3. Return ONLY the corrected, valid raw Mermaid diagram code without markdown code blocks.`;
    } else if (currentCode && currentCode.trim().length > 0) {
      userPrompt = `Existing Diagram Code:
${currentCode}

User Edit Request:
${prompt}

Modify the existing Mermaid code to incorporate the user's requested changes while preserving valid syntax.
- Maintain existing diagram structure, layout flow, and style unless requested otherwise.
- Ensure all node labels with special characters (), /, :, &, commas, or spaces are enclosed in double quotes.
- Put every section, subgraph, node, and 'end' statement on its own newline.
- Return ONLY the modified raw Mermaid code without markdown code blocks.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature for high syntax precision
      }
    });

    let code = response.text || '';

    // Clean up markdown block wrapping if Gemini includes it
    code = code.replace(/^```(mermaid)?/gi, '').replace(/```$/gi, '').trim();

    // Auto-fix any missing line breaks or missing quotes
    code = autoFixMermaidCode(code);

    return NextResponse.json({ code });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Gemini API Error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
