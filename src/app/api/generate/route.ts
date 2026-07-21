import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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

CRITICAL CONSTRAINTS:
1. Respond ONLY with valid Mermaid diagram code. Do NOT wrap code in markdown code blocks like \`\`\`mermaid or \`\`\`. Output raw Mermaid code text only.
2. Do NOT include explanatory text, intros, or outros.
3. Ensure syntax adheres strictly to Mermaid 11.x standards (graph TD, flowchart TB, sequenceDiagram, erDiagram, mindmap, gantt, etc.).
4. Keep node labels clear, concise, and properly quoted if special characters or spaces exist.`;

    let userPrompt = prompt;

    if (syntaxError) {
      userPrompt = `The following Mermaid diagram code contains a syntax error:

CURRENT CODE:
${currentCode}

SYNTAX ERROR DETAILS:
${syntaxError}

Fix the syntax error and return ONLY the corrected valid Mermaid diagram code.`;
    } else if (currentCode && currentCode.trim().length > 0) {
      userPrompt = `Existing Diagram Code:
${currentCode}

User Edit Request:
${prompt}

Modify the existing Mermaid code to incorporate the user's requested changes while preserving valid syntax. Return ONLY the modified raw Mermaid code.`;
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
    code = code.replace(/^```(mermaid)?/g, '').replace(/```$/g, '').trim();

    return NextResponse.json({ code });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Gemini API Error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
