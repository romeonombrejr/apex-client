/**
 * THE datetime display convention: the backend sends ISO 8601 timestamps
 * (Carbon `toIso8601String()`), and the UI formats them here — in the
 * viewer's own timezone and locale, via the browser's Intl API. Prefer these
 * helpers over server-side date formatting for anything user-facing.
 */

export function formatDate(iso: string | null | undefined): string {
    if (!iso) {
        return '';
    }

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(iso));
}

export function formatDateTime(iso: string | null | undefined): string {
    if (!iso) {
        return '';
    }

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(iso));
}
