import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { extractDomains } from '@/lib/extractEntities';

// Initialize OpenAI client with Shisa AI base URL
const shisa = createOpenAI({
    baseURL: 'https://api.shisa.ai/openai/v1',
    apiKey: process.env.SHISA_API_KEY,
});

interface EnrichResult {
    enriched: boolean;
    name?: string;
    headcount?: number | null;
    employee_count_range?: string | null;
    funding_stage?: string | null;
    industry?: string | null;
    growth_rate?: string | number | null;
    description?: string | null;
    company_type?: string | null;
    year_founded?: string | null;
}

/**
 * Attempt to enrich company data from a domain using CrustData.
 * Always returns gracefully - never throws.
 */
async function tryEnrichCompany(domain: string, baseUrl: string): Promise<EnrichResult> {
    try {
        const url = `${baseUrl}/api/enrich-company?domain=${encodeURIComponent(domain)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!res.ok) return { enriched: false };
        return await res.json() as EnrichResult;
    } catch {
        return { enriched: false };
    }
}

/**
 * Build a company context string to inject into the LLM prompt.
 */
function buildCompanyContext(enrich: EnrichResult): string {
    if (!enrich.enriched) return '';

    const parts: string[] = [];
    if (enrich.name) parts.push(`Company: ${enrich.name}`);
    if (enrich.headcount != null) parts.push(`Headcount: ${enrich.headcount}`);
    else if (enrich.employee_count_range) parts.push(`Employee Count Range: ${enrich.employee_count_range}`);
    if (enrich.funding_stage) parts.push(`Funding Stage: ${enrich.funding_stage}`);
    if (enrich.industry) parts.push(`Industry: ${enrich.industry}`);
    if (enrich.company_type) parts.push(`Company Type: ${enrich.company_type}`);
    if (enrich.year_founded) parts.push(`Founded: ${enrich.year_founded}`);
    if (enrich.growth_rate != null) parts.push(`Growth Rate: ${enrich.growth_rate}`);

    if (parts.length === 0) return '';

    // Add short description snippet for richer LLM grounding (first 200 chars)
    const descSnippet = enrich.description
        ? `\nCompany description: "${enrich.description.slice(0, 200)}..."`
        : '';

    return `
[Company Context from CrustData]
${parts.join(', ')}${descSnippet}

Use this company context when generating UI ideas:
- Small companies (1-50 employees or Seed stage) → prefer simple, fast-to-ship UIs with minimal features.
- Mid-size companies (50-500 employees, e.g. "201-500" range) → balance between simplicity and advanced features.
- Enterprise (500+ employees or Series C+) → complex dashboards, role-based views, and data-heavy UIs are appropriate.
- Reflect the industry (e.g., Software Development, FinTech, Healthcare) in UI approach, terminology, and color choices.
`;
}

export async function POST(request: Request) {
    try {
        const { transcript } = await request.json();

        if (!transcript) {
            return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
        }

        if (!process.env.SHISA_API_KEY) {
            return NextResponse.json({ error: 'SHISA_API_KEY is not set' }, { status: 500 });
        }

        // --- CrustData Enrichment (best-effort, non-blocking) ---
        let companyContext = '';
        const domains = extractDomains(transcript);
        if (domains.length > 0) {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            console.info(`[generate-structure] Attempting CrustData enrichment for domain: ${domains[0]}`);
            const enrich = await tryEnrichCompany(domains[0], baseUrl);
            companyContext = buildCompanyContext(enrich);
            if (enrich.enriched) {
                console.info(`[generate-structure] CrustData enrichment successful: ${enrich.name}`);
            }
        }
        // --- End CrustData Enrichment ---

        const modelName = process.env.SHISA_MODEL || 'shisa-ai/shisa-v2.1-llama3.3-70b';

        const { object } = await generateObject({
            model: shisa(modelName),
            schema: z.object({
                problems: z.array(z.string()).describe("List of problems or pain points identified in the transcript."),
                requirements: z.array(z.string()).describe("List of functional and non-functional requirements based on EARS syntax where possible."),
                constraints: z.array(z.string()).describe("List of technical, business, or design constraints."),
                workflow: z.string().describe("A step-by-step description of the user workflow."),
                progress: z.string().describe("A short summary of the current progress or state of discussion."),
                ideas: z.array(z.object({
                    title: z.string().describe("Short 2-3 words title summarizing the approach for a UI sketch."),
                    description: z.string().describe("1 sentence describing the perspective and approach of this UI idea based on the conversation.")
                })).length(3).describe("3 distinct perspectives/approaches for UI design based on the conversation.")
            }),
            prompt: `
Analyze the following meeting transcript.
Extract and structure the information into specific categories: problems, requirements, constraints, user workflow, and overall progress.
Crucially, also provide 3 distinct UI design approaches ("ideas") based on the discussion, each with a brief 2-3 word title and a 1-sentence description.
Use Japanese for the output unless the context specifically requires English.
${companyContext}
Meeting Transcript:
"""
${transcript}
"""
            `,
        });

        return NextResponse.json(object);

    } catch (error) {
        console.error("Error generating structure:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

