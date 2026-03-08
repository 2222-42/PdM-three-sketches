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

    // Convert structured data to a string context
    const contextStr = JSON.stringify(structuredData, null, 2);

    // Parallel execution for 3 sketches
    const [resultA, resultB, resultC] = await Promise.all([
      generateText({
        model,
        system: SYSTEM_PROMPT_BASE,
        prompt: `
        Design Concept: "Minimalist & Elegant (Simplest Possible Solution)"
        Focus on extreme simplicity and a clean, premium minimalist UI. 
        - Use a lot of white space, subtle gray dividing lines (\`border-b border-gray-100\`), and elegant typography.
        - The main content should probably be centered or in a clean card layout with \`max-w-3xl mx-auto mt-10 rounded-2xl shadow-sm border border-gray-200\`.
        - Use a very restrained color palette (mostly black/white/gray with one accent color).
        
        Requirements Context:
        ${contextStr}
        `,
      }),
      generateText({
        model,
        system: SYSTEM_PROMPT_BASE,
        prompt: `
        Design Concept: "Professional Admin/Data Dashboard"
        Focus on showing data effectively with a very high-quality B2B SaaS look.
        - Create a layout with a sleek top navbar or a side navigation menu. 
        - Use metric/stat cards at the top (\`bg-white rounded-xl shadow-sm border border-slate-200 p-5\`).
        - Implement a beautifully styled data table (with subtle alternating row colors, hover states, status badges using \`bg-green-100 text-green-800 rounded-full px-2.5 py-0.5 text-xs font-medium\`).
        - Include simulated charts/graphs using styled div blocks if appropriate.
        - The background should probably be slightly off-white (e.g., \`bg-slate-50\`).
        
        Requirements Context:
        ${contextStr}
        `,
      }),
      generateText({
        model,
        system: SYSTEM_PROMPT_BASE,
        prompt: `
        Design Concept: "Modern Mobile App Experience"
        Focus on a mobile-responsive, touch-friendly, native-app-like interface.
        - The container should be constrained to a mobile phone ratio (e.g., \`max-w-md mx-auto h-[800px] overflow-y-auto bg-gray-50 shadow-2xl relative rounded-[3rem] border-[14px] border-gray-900\` to look like a phone, or just a generic mobile wrapper).
        - Include a fixed bottom navigation bar with inline SVG icons.
        - Use large tap targets, full-width cards (\`bg-white rounded-2xl p-4 shadow-sm mb-4\`), and engaging micro-interactions (indicated by UI structure).
        - Use a vibrant but professional color palette suitable for consumer or modern B2B field apps.
        
        Requirements Context:
        ${contextStr}
        `,
      }),
    ]);

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
