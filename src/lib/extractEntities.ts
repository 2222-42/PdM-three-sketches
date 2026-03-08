/**
 * extractEntities.ts
 * Pure utility functions to extract company domains and LinkedIn URLs from transcript text.
 * No external dependencies.
 */

/**
 * Extracts domain names from text.
 * Matches patterns like "example.com", "www.example.co.jp", "retool.com", etc.
 * Excludes common non-company domains (e.g., google.com, gmail.com).
 */
const IGNORED_DOMAINS = new Set([
    'google.com', 'gmail.com', 'youtube.com', 'facebook.com', 'twitter.com',
    'x.com', 'instagram.com', 'tiktok.com', 'amazon.com', 'apple.com',
    'microsoft.com', 'github.com', 'wikipedia.org', 'zoom.us', 'slack.com',
]);

export function extractDomains(text: string): string[] {
    // Match domain-like patterns: word.tld or word.word.tld
    const domainRegex = /\b([a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.(?:[a-zA-Z]{2,}\.)?[a-zA-Z]{2,})\b/g;
    const matches = text.match(domainRegex) || [];

    const unique = [...new Set(
        matches
            .map(d => d.toLowerCase())
            .filter(d => !IGNORED_DOMAINS.has(d))
            // Must contain at least one dot and not be just a word.word
            .filter(d => /\.[a-z]{2,}$/.test(d))
    )];

    return unique;
}

/**
 * Extracts LinkedIn company URLs from text.
 * Matches: linkedin.com/company/xxx
 */
export function extractLinkedInCompanyUrls(text: string): string[] {
    const regex = /linkedin\.com\/company\/([a-zA-Z0-9\-_]+)/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
        matches.push(match[0]);
    }
    return [...new Set(matches)];
}
