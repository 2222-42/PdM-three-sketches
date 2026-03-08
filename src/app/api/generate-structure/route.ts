import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { transcript } = await request.json();

        if (!transcript) {
            return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock Response
        return NextResponse.json({
            problems: [
                "Current dashboards are cluttered and hard to read",
                "Inventory levels are not updated in real-time",
                "Managers can't quickly see which items are low on stock"
            ],
            requirements: [
                "Clear overview of total inventory value",
                "Highlight items with low stock instantly",
                "Provide a way to search or filter specific products",
                "Mobile-friendly view for warehouse floor"
            ],
            constraints: [
                "Must be visually simple to reduce cognitive load",
                "Data is refreshed every 15 minutes",
            ],
            workflow: "1. Open app -> 2. See high-level summary cards -> 3. View list of low-stock items -> 4. Tap item for details/reorder",
            progress: "Initial mock generation based on Transcript input"
        });

    } catch (error) {
        console.error("Error generating structure:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
