import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
        return NextResponse.json({ error: 'domain query parameter is required' }, { status: 400 });
    }

    // If API key is not configured, gracefully return not-enriched
    if (!process.env.CRUSTDATA_API_KEY) {
        console.warn('[enrich-company] CRUSTDATA_API_KEY is not set. Skipping enrichment.');
        return NextResponse.json({ enriched: false });
    }

    try {
        const response = await fetch('https://api.crustdata.com/dataset/company/enrich', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CRUSTDATA_API_KEY}`,
                'x-api-version': '2025-11-01',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ company_domains: [domain] }),
            // 5-second timeout via AbortController
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
            console.warn(`[enrich-company] CrustData returned ${response.status} for domain: ${domain}`);
            return NextResponse.json({ enriched: false });
        }

        const data = await response.json();

        // CrustData returns: Array<{ matched_on, match_type, matches: Array<{ confidence_score, company_data }> }>
        // Pick the first matched result with the highest confidence
        const topMatch = Array.isArray(data) && data.length > 0
            ? data[0]?.matches?.[0]?.company_data
            : null;

        if (!topMatch) {
            console.info(`[enrich-company] No company found for domain: ${domain}`);
            return NextResponse.json({ enriched: false });
        }

        // Extract from basic_info (always present) + headcount/funding (may be null at this tier)
        const basicInfo = topMatch.basic_info ?? {};
        const headcountData = topMatch.headcount; // object or null
        const fundingData = topMatch.funding;     // object or null

        // employee_count_range e.g. "201-500" — use as headcount proxy
        const employeeRange = basicInfo.employee_count_range ?? null;
        // industries is an array e.g. ["Software Development", "Technology, ..."]
        const industries: string[] = basicInfo.industries ?? [];
        const industry = industries.length > 0 ? industries[0] : null;

        // funding_stage from funding data if available
        const fundingStage = fundingData?.last_round_type ?? fundingData?.funding_stage ?? null;
        // headcount from headcount data if available
        const headcount = headcountData?.current_employee_count ?? null;

        const result = {
            enriched: true,
            name: (basicInfo.name ?? domain) as string,
            headcount: headcount as number | null,
            employee_count_range: employeeRange as string | null,
            funding_stage: fundingStage as string | null,
            industry: industry as string | null,
            description: (basicInfo.description ?? null) as string | null,
            company_type: (basicInfo.company_type ?? null) as string | null,
            year_founded: (basicInfo.year_founded?.slice(0, 4) ?? null) as string | null,
        };

        console.info(`[enrich-company] Enriched: ${result.name}, range=${result.employee_count_range}, industry=${result.industry}`);
        return NextResponse.json(result);

    } catch (error) {
        // Network error, timeout, or JSON parse failure - graceful fallback
        console.error('[enrich-company] Error calling CrustData API:', error);
        return NextResponse.json({ enriched: false });
    }
}
