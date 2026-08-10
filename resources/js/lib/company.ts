/**
 * Suggest a company name from an email's domain (romeo@digitalfeet.com →
 * "Digitalfeet"). Returns null for free mail providers and invalid emails —
 * a gmail address says nothing about the company.
 */
const FREE_PROVIDERS = new Set([
    'gmail',
    'googlemail',
    'yahoo',
    'ymail',
    'outlook',
    'hotmail',
    'live',
    'msn',
    'icloud',
    'me',
    'aol',
    'proton',
    'protonmail',
    'gmx',
    'zoho',
    'mail',
    'yandex',
]);

export function suggestCompanyFromEmail(email: string): string | null {
    const domain = email.split('@')[1]?.trim().toLowerCase();

    if (!domain || !domain.includes('.')) {
        return null;
    }

    const name = domain.split('.')[0];

    if (!name || FREE_PROVIDERS.has(name)) {
        return null;
    }

    return name.charAt(0).toUpperCase() + name.slice(1);
}
