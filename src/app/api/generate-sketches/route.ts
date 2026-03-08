import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const shisa = createOpenAI({
  baseURL: 'https://api.shisa.ai/openai/v1',
  apiKey: process.env.SHISA_API_KEY,
});

function buildSketchPrompt(idea: { title: string; description: string }, context: string): string {
  return [
    'You are an expert Frontend Developer. Generate a SINGLE complete HTML page as a UI prototype.',
    '',
    'DESIGN REQUIREMENTS:',
    '- Use Tailwind CSS CDN. Include <script src="https://cdn.tailwindcss.com"></script> in <head>.',
    '- Modern, premium app-like design with cards, shadows, rounded corners, and color gradients.',
    '- Use inline SVGs for icons. No external icon libraries.',
    '- Include realistic, hardcoded mock data.',
    '- Structure: header nav + main content area + cards/tables.',
    '- Tailwind classes: shadow-md, rounded-xl, text-slate-900, indigo/violet for actions, emerald for success.',
    '',
    'OUTPUT FORMAT - CRITICAL:',
    '- Your entire output MUST be a valid HTML document starting with <!DOCTYPE html> or <html>',
    '- Do NOT output JSON.',
    '- Do NOT call functions or tools.',
    '- Do NOT output code blocks like ```html. Output the raw HTML directly.',
    '- Do NOT explain or describe what you will do. Just output the HTML.',
    '',
    'Design Concept: ' + idea.title,
    'Approach: ' + idea.description,
    '',
    'Requirements:',
    context,
    '',
    'BEGIN HTML OUTPUT NOW:',
  ].join('\n');
}

export async function POST(request: Request) {
  try {
    const { structuredData } = await request.json();

    if (!structuredData) {
      return NextResponse.json({ error: 'Structured data is required' }, { status: 400 });
    }

    if (!process.env.SHISA_API_KEY) {
      return NextResponse.json({ error: 'SHISA_API_KEY is not set' }, { status: 500 });
    }

    const modelName = process.env.SHISA_MODEL || 'shisa-ai/shisa-v2.1-llama3.3-70b';
    const model = shisa(modelName);

    // Format context as bullet-point text instead of JSON to prevent hallucination
    const problemsList = Array.isArray(structuredData.problems)
      ? structuredData.problems.join('; ')
      : String(structuredData.problems || '');
    const reqsList = Array.isArray(structuredData.requirements)
      ? structuredData.requirements.join('; ')
      : String(structuredData.requirements || '');
    const constraintsList = Array.isArray(structuredData.constraints)
      ? structuredData.constraints.join('; ')
      : String(structuredData.constraints || '');

    const contextText =
      '- Problems: ' + problemsList + '\n' +
      '- Requirements: ' + reqsList + '\n' +
      '- Constraints: ' + constraintsList + '\n' +
      '- Workflow: ' + String(structuredData.workflow || '') + '\n' +
      '- Progress: ' + String(structuredData.progress || '');

    const ideas: Array<{ title: string; description: string }> = structuredData.ideas || [
      { title: 'Simplest Clean UI', description: 'Focus on extreme simplicity and a clean, premium minimalist UI.' },
      { title: 'Data-heavy Dashboard', description: 'Show data effectively with a very high-quality B2B SaaS look.' },
      { title: 'Mobile First', description: 'Focus on a mobile-responsive, touch-friendly, native-app-like interface.' },
    ];

    // Parallel execution for 3 sketches
    const sketchesPromises = ideas.slice(0, 3).map((idea) => {
      return generateText({
        model,
        prompt: buildSketchPrompt(idea, contextText),
      });
    });

    const [resultA, resultB, resultC] = await Promise.all(sketchesPromises);

    // Robust sanitizer: extract HTML if wrapped in markdown or JSON
    const sanitizeResult = (text: string): string => {
      let cleaned = text.trim();

      // 1. If model wrapped in ```html ... ``` or just ``` ... ```
      const codeBlockMatch = cleaned.match(/```(?:html|tsx|jsx)?\s*([\s\S]*?)```/i);
      if (codeBlockMatch && codeBlockMatch[1]) {
        return codeBlockMatch[1].trim();
      }

      // 2. If model returned JSON/function call format, extract anything inside "html" key or just return error fallback
      if (cleaned.startsWith('{') || cleaned.startsWith('json')) {
        // Try to find an html string embedded inside
        const htmlInJson = cleaned.match(/"html"\s*:\s*"([\s\S]+?)"\s*}/);
        if (htmlInJson) {
          return htmlInJson[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
        // Could not extract, return a fallback error UI
        return '<html><body style="font-family:sans-serif;padding:2rem;color:#e11d48;"><h2>Generation Error</h2><p>The AI returned JSON instead of HTML. Please try again.</p></body></html>';
      }

      // 3. Find the start of any HTML tag
      const htmlStartIndex = cleaned.search(/<(?:!DOCTYPE|html|script|div|main|body)/i);
      if (htmlStartIndex > 0) {
        cleaned = cleaned.substring(htmlStartIndex);
      }

      return cleaned;
    };

    return NextResponse.json({
      sketchA: sanitizeResult(resultA.text),
      sketchB: sanitizeResult(resultB.text),
      sketchC: sanitizeResult(resultC.text),
    });

  } catch (error) {
    console.error('Error generating sketches:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
