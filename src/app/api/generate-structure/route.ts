import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

// Initialize OpenAI client with Shisa AI base URL
const shisa = createOpenAI({
    baseURL: 'https://api.shisa.ai/openai/v1',
    apiKey: process.env.SHISA_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { transcript } = await request.json();

        if (!transcript) {
            return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
        }

        if (!process.env.SHISA_API_KEY) {
            return NextResponse.json({ error: 'SHISA_API_KEY is not set' }, { status: 500 });
        }

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
