import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT_BASE = `
You are an expert Frontend Developer and UX/UI Designer.
Your task is to generate a SINGLE React Functional Component using Tailwind CSS based on the provided requirements.
OUTPUT CONSTRAINTS:
- Output ONLY valid HTML/React code.
- Provide a full HTML structure with Tailwind CDN script (\`<script src="https://cdn.tailwindcss.com"></script>\`) in the <head>.
- Do NOT output any markdown blocks (like \`\`\`html or \`\`\`tsx). Just pure parsable HTML text.
- Use hardcoded mock data that looks realistic.
- Do NOT import any external React hooks or components; if interactivity is needed, use plain inline HTML/JS like \`onclick="alert('...')"\`.
- Keep the component fully contained in one file.
`;

export async function POST(request: Request) {
  try {
    const { structuredData } = await request.json();

    if (!structuredData) {
      return NextResponse.json({ error: 'Structured data is required' }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY is not set' }, { status: 500 });
    }

    const model = openrouter('meta-llama/llama-3.1-70b-instruct');

    // Convert structured data to a string context
    const contextStr = JSON.stringify(structuredData, null, 2);

    // Parallel execution for 3 sketches
    const [resultA, resultB, resultC] = await Promise.all([
      generateText({
        model,
        system: SYSTEM_PROMPT_BASE,
        prompt: `
        Design Concept: "Simplest Possible Solution"
        Focus on extreme simplicity and clean UI. Only show the absolute minimum features required.
        
        Requirements Context:
        ${contextStr}
        `,
      }),
      generateText({
        model,
        system: SYSTEM_PROMPT_BASE,
        prompt: `
        Design Concept: "Data-Visualization Focused"
        Focus on showing data effectively. Use tables, charts (simulated via CSS/HTML), metrics, or dashboards.
        
        Requirements Context:
        ${contextStr}
        `,
      }),
      generateText({
        model,
        system: SYSTEM_PROMPT_BASE,
        prompt: `
        Design Concept: "Mobile/Field-First"
        Focus on a mobile-responsive, touch-friendly interface suitable for a phone screen. Use bottom navigation, large tap targets, etc.
        
        Requirements Context:
        ${contextStr}
        `,
      }),
    ]);

    // Simple markdown sanitizer (in case model ignores instructions)
    const sanitizeResult = (text: string) => {
      let cleaned = text.trim();
      if (cleaned.startsWith('\`\`\`')) {
        const lines = cleaned.split('\n');
        lines.shift(); // remove opening ```
        if (lines[lines.length - 1].startsWith('\`\`\`')) {
          lines.pop(); // remove closing ```
        }
        cleaned = lines.join('\n');
      }
      return cleaned;
    };

    return NextResponse.json({
      sketchA: sanitizeResult(resultA.text),
      sketchB: sanitizeResult(resultB.text),
      sketchC: sanitizeResult(resultC.text)
    });

  } catch (error) {
    console.error("Error generating sketches:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
