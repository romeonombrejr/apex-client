export type ThemePayload = {
    id: number;
    name: string;
    css: string;
    fontLinks: string[];
};

let cleanedLegacyInline = false;

/**
 * Apply the active theme (or the legacy branding primary color) to the document.
 *
 * Uses a single managed `<style id="app-theme">` tag rather than inline styles on
 * the root element: inline styles beat every stylesheet, which would prevent both
 * the theme and the live editor preview from overriding `--primary`. The tag is
 * server-rendered (see app.blade.php) and reused here — created once, then only
 * its textContent is mutated so it never leapfrogs the editor's preview tag.
 */
export function applyTheme(
    theme: ThemePayload | null | undefined,
    brandingPrimaryColor?: string | null,
): void {
    if (typeof document === 'undefined') {
        return;
    }

    // One-time cleanup of any stale inline `--primary` set by the old applier.
    if (!cleanedLegacyInline) {
        document.documentElement.style.removeProperty('--primary');
        cleanedLegacyInline = true;
    }

    const css =
        theme?.css ??
        (brandingPrimaryColor
            ? `:root, .dark { --primary: ${brandingPrimaryColor}; }`
            : '');

    let styleTag = document.getElementById(
        'app-theme',
    ) as HTMLStyleElement | null;

    if (css) {
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'app-theme';
            document.head.appendChild(styleTag);
        }
        if (styleTag.textContent !== css) {
            styleTag.textContent = css;
        }
    } else if (styleTag) {
        styleTag.textContent = '';
    }

    syncFontLinks(theme?.fontLinks ?? []);
}

function syncFontLinks(urls: string[]): void {
    const wanted = new Set(
        urls.map((url) => new URL(url, window.location.href).href),
    );

    const existing = new Map<string, HTMLLinkElement>();
    document
        .querySelectorAll<HTMLLinkElement>('link[data-app-theme-font]')
        .forEach((el) => existing.set(el.href, el));

    // Add missing.
    wanted.forEach((href) => {
        if (!existing.has(href)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.dataset.appThemeFont = '';
            document.head.appendChild(link);
        }
    });

    // Remove stale.
    existing.forEach((el, href) => {
        if (!wanted.has(href)) {
            el.remove();
        }
    });
}
