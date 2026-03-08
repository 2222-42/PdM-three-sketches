import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT_BASE = `
You are an expert Frontend Developer and UX/UI Designer.
Your task is to generate a SINGLE React Functional Component using Tailwind CSS based on the provided requirements.

CRITICAL DESIGN REQUIREMENTS (Premium/Modern App-like UI):
- The generated UI MUST look like a high-quality, polished, modern web application (similar to Claude Artifacts).
- Do NOT output basic, barebones HTML. You MUST use rich Tailwind features: shadows (\`shadow-sm\`, \`shadow-md\`, \`shadow-lg\`), rounded corners (\`rounded-lg\`, \`rounded-xl\`, \`rounded-2xl\`), and subtle borders (\`border\`, \`border-slate-200\`).
- Use cohesive and modern color palettes (e.g., slate/gray for text, indigo/violet/blue for primary actions, emerald for success). Avoid plain red/green/blue unless specified.
- Use ample whitespace: generous padding (\`p-4\`, \`p-6\`, \`p-8\`) and margins.
- Ensure proper typography: use \`text-sm\`, \`text-lg\`, \`text-xl\`, \`font-medium\`, \`font-semibold\`, \`tracking-tight\`, \`text-slate-900\` for headings, and \`text-slate-500\` for secondary text.
- Use inline SVGs for all icons to make the UI look realistic and functional. Do NOT use external icon libraries.
- The layout should be structured (e.g., header, sidebar/navigation, main content area, cards for data).

OUTPUT CONSTRAINTS:
- Output ONLY valid HTML/React code.
- Provide a full HTML structure with Tailwind CDN script (\`<script src="https://cdn.tailwindcss.com"></script>\`) in the <head>.
- Do NOT output any markdown blocks (like \`\`\`html or \`\`\`tsx). Just pure parsable HTML text.
- Use hardcoded mock data that looks realistic and rich.
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

    const contextStr = JSON.stringify(structuredData, null, 2);

    // Extract the 3 dynamic ideas
    const ideas = structuredData.ideas || [
      { title: "Simplest Solution (Clean UI)", description: "Focus on extreme simplicity and a clean, premium minimalist UI." },
      { title: "Data-heavy (Charts/Tables)", description: "Focus on showing data effectively with a very high-quality B2B SaaS look." },
      { title: "Mobile First (Responsive)", description: "Focus on a mobile-responsive, touch-friendly, native-app-like interface." }
    ];

    // Parallel execution for 3 sketches
    const sketchesPromises = ideas.slice(0, 3).map((idea: { title: string; description: string }) => {
      return generateText({
        model,
        system: SYSTEM_PROMPT_BASE,
        prompt: `
        Design Concept Title: "${idea.title}"
        Design Approach / Perspective: "${idea.description}"
        
        Focus on implementing this specific approach. Translate the idea into a well-designed, functional UI component.
        
        Requirements Context:
        ${contextStr}
        `,
      });
    });

    const [resultA, resultB, resultC] = await Promise.all(sketchesPromises);

    // Robust markdown sanitizer
    const sanitizeResult = (text: string) => {
      let cleaned = text.trim();

      // Try to extract content inside ```html, ```tsx, ```jsx, or generic ``` blocks
      const codeBlockRegex = /\`\`\`(?:html|tsx|jsx)?\s*([\s\S]*?)\`\`\`/i;
      const match = cleaned.match(codeBlockRegex);

      if (match && match[1]) {
        // If a code block is found, use its content
        cleaned = match[1].trim();
      } else {
        // Fallback: If no code blocks but it starts with conversational text,
        // we might not be able to perfectly extract, but we can try to find the start of HTML.
        // E.g. "Here's the code: <script..." -> "<script..."
        const htmlStartIndex = cleaned.search(/<(?:script|div|main|html|body)/i);
        if (htmlStartIndex > 0) {
          cleaned = cleaned.substring(htmlStartIndex);
        }
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
