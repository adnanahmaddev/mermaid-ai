import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

function autoFixMermaidCode(code: string): string {
  if (!code) return code;
  let fixed = code;

  // 1. Ensure keywords like 'section', 'subgraph' start on a new line if concatenated without newline
  fixed = fixed.replace(/([^\n])\s*\b(section|subgraph)\b/gi, '$1\n$2');

  // 2. Auto-quote unquoted square bracket node labels containing special characters like (), /, :, &, #
  fixed = fixed.replace(/\b([A-Za-z0-9_\-]+)\[([^\]"\n]*[\(\)\/\:\&\#]+[^\]"\n]*)\]/g, (_, id, label) => {
    return `${id}["${label}"]`;
  });

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
Your goal is to generate valid, highly structured, clean Mermaid.js diagram code based on user requests.

CRITICAL SYNTAX CONSTRAINTS:
1. Respond ONLY with valid Mermaid diagram code. Do NOT wrap code in markdown code blocks like \`\`\`mermaid or \`\`\`. Output raw Mermaid code text only.
2. Do NOT include explanatory text, intros, or outros.
3. Ensure syntax adheres strictly to Mermaid 11.x standards (graph TD, flowchart TB, sequenceDiagram, erDiagram, mindmap, gantt, etc.).
4. QUOTING RULE: ALWAYS wrap node labels in double quotes inside brackets if they contain spaces, parentheses (), slashes /, colons :, or special characters.
   - CORRECT: UI["User Interface (Web/Mobile)"]
   - INCORRECT: UI[User Interface (Web/Mobile)]
5. LINE FORMATTING RULE: Put every task, section declaration, and node on its OWN NEW LINE. Keywords like 'section', 'subgraph', 'end', and 'title' must ALWAYS be preceded by a newline.
6. NODE ID RULE: Keep node IDs simple alphanumeric words without spaces or special characters (e.g. UI, WebApp, DB1).`;

    let userPrompt = prompt;

    if (syntaxError) {
      userPrompt = `The following Mermaid diagram code contains a syntax error:

CURRENT CODE:
${currentCode}

SYNTAX ERROR DETAILS:
${syntaxError}

IMPORTANT SYNTAX FIX INSTRUCTIONS:
- If keywords like 'section' or 'subgraph' are concatenated onto the end of a line (e.g. 2023-10-23section), put 'section' on a NEW LINE.
- If node labels contain special characters like parentheses (), slashes /, colons :, or spaces inside brackets (e.g., UI[User Interface (Web/Mobile)]), enclose the label in double quotes like UI["User Interface (Web/Mobile)"].

Fix the syntax error and return ONLY the corrected valid Mermaid diagram code.`;
    } else if (currentCode && currentCode.trim().length > 0) {
      userPrompt = `Existing Diagram Code:
${currentCode}

User Edit Request:
${prompt}

Modify the existing Mermaid code to incorporate the user's requested changes while preserving valid syntax. Put every section and task on a new line and quote all labels containing (), /, or special characters. Return ONLY the modified raw Mermaid code.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
