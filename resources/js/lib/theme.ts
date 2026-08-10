/**
 * Theme editor helpers. Keep DEFAULT_LIGHT / DEFAULT_DARK in sync with
 * resources/css/app.css and app/Support/ThemeCss.php (KEYS).
 */

export type VarMap = Record<string, string>;
export type ThemeMode = 'light' | 'dark';
export type ThemeFonts = {
    sans: string | null;
    serif: string | null;
    mono: string | null;
};

export type WorkingTheme = {
    id: number | null;
    name: string;
    light: VarMap;
    dark: VarMap;
    radius: string;
    button_size: ButtonSize;
    fonts: ThemeFonts;
};

export const DEFAULT_RADIUS = '0.625rem';

export type ButtonSize = 'sm' | 'default' | 'lg' | 'xl';

export const DEFAULT_BUTTON_SIZE: ButtonSize = 'default';

export const BUTTON_SIZE_OPTIONS: { value: ButtonSize; label: string }[] = [
    { value: 'sm', label: 'Small' },
    { value: 'default', label: 'Default' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra large' },
];

/**
 * Mirrors app/Support/ThemeCss.php BUTTON_SIZES. Scoping Tailwind's
 * --spacing to buttons scales every spacing-derived utility on them
 * (h-*, px-*, gap-*, size-*), so all button size variants shrink/grow
 * proportionally. `default` emits no CSS.
 */
const BUTTON_SIZE_CSS: Record<
    ButtonSize,
    { spacing: string; fontSize: string } | null
> = {
    sm: { spacing: '0.225rem', fontSize: '0.8125rem' },
    default: null,
    lg: { spacing: '0.275rem', fontSize: '0.9375rem' },
    xl: { spacing: '0.3rem', fontSize: '1rem' },
};

export const DEFAULT_LIGHT: VarMap = {
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.145 0 0)',
    card: 'oklch(1 0 0)',
    'card-foreground': 'oklch(0.145 0 0)',
    popover: 'oklch(1 0 0)',
    'popover-foreground': 'oklch(0.145 0 0)',
    primary: 'oklch(0.205 0 0)',
    'primary-foreground': 'oklch(0.985 0 0)',
    secondary: 'oklch(0.97 0 0)',
    'secondary-foreground': 'oklch(0.205 0 0)',
    muted: 'oklch(0.97 0 0)',
    'muted-foreground': 'oklch(0.556 0 0)',
    accent: 'oklch(0.97 0 0)',
    'accent-foreground': 'oklch(0.205 0 0)',
    destructive: 'oklch(0.577 0.245 27.325)',
    'destructive-foreground': 'oklch(0.577 0.245 27.325)',
    border: 'oklch(0.922 0 0)',
    input: 'oklch(0.922 0 0)',
    ring: 'oklch(0.87 0 0)',
    'chart-1': 'oklch(0.646 0.222 41.116)',
    'chart-2': 'oklch(0.6 0.118 184.704)',
    'chart-3': 'oklch(0.398 0.07 227.392)',
    'chart-4': 'oklch(0.828 0.189 84.429)',
    'chart-5': 'oklch(0.769 0.188 70.08)',
    sidebar: 'oklch(0.985 0 0)',
    'sidebar-foreground': 'oklch(0.145 0 0)',
    'sidebar-primary': 'oklch(0.205 0 0)',
    'sidebar-primary-foreground': 'oklch(0.985 0 0)',
    'sidebar-accent': 'oklch(0.97 0 0)',
    'sidebar-accent-foreground': 'oklch(0.205 0 0)',
    'sidebar-border': 'oklch(0.922 0 0)',
    'sidebar-ring': 'oklch(0.87 0 0)',
};

export const DEFAULT_DARK: VarMap = {
    background: 'oklch(0.145 0 0)',
    foreground: 'oklch(0.985 0 0)',
    card: 'oklch(0.145 0 0)',
    'card-foreground': 'oklch(0.985 0 0)',
    popover: 'oklch(0.145 0 0)',
    'popover-foreground': 'oklch(0.985 0 0)',
    primary: 'oklch(0.985 0 0)',
    'primary-foreground': 'oklch(0.205 0 0)',
    secondary: 'oklch(0.269 0 0)',
    'secondary-foreground': 'oklch(0.985 0 0)',
    muted: 'oklch(0.269 0 0)',
    'muted-foreground': 'oklch(0.708 0 0)',
    accent: 'oklch(0.269 0 0)',
    'accent-foreground': 'oklch(0.985 0 0)',
    destructive: 'oklch(0.396 0.141 25.723)',
    'destructive-foreground': 'oklch(0.637 0.237 25.331)',
    border: 'oklch(0.269 0 0)',
    input: 'oklch(0.269 0 0)',
    ring: 'oklch(0.439 0 0)',
    'chart-1': 'oklch(0.488 0.243 264.376)',
    'chart-2': 'oklch(0.696 0.17 162.48)',
    'chart-3': 'oklch(0.769 0.188 70.08)',
    'chart-4': 'oklch(0.627 0.265 303.9)',
    'chart-5': 'oklch(0.645 0.246 16.439)',
    sidebar: 'oklch(0.205 0 0)',
    'sidebar-foreground': 'oklch(0.985 0 0)',
    'sidebar-primary': 'oklch(0.985 0 0)',
    'sidebar-primary-foreground': 'oklch(0.985 0 0)',
    'sidebar-accent': 'oklch(0.269 0 0)',
    'sidebar-accent-foreground': 'oklch(0.985 0 0)',
    'sidebar-border': 'oklch(0.269 0 0)',
    'sidebar-ring': 'oklch(0.439 0 0)',
};

export const THEME_KEYS = Object.keys(DEFAULT_LIGHT);

export const THEME_GROUPS: { label: string; keys: string[] }[] = [
    {
        label: 'Base',
        keys: ['background', 'foreground', 'border', 'input', 'ring'],
    },
    { label: 'Primary', keys: ['primary', 'primary-foreground'] },
    { label: 'Secondary', keys: ['secondary', 'secondary-foreground'] },
    { label: 'Accent', keys: ['accent', 'accent-foreground'] },
    { label: 'Card', keys: ['card', 'card-foreground'] },
    { label: 'Popover', keys: ['popover', 'popover-foreground'] },
    { label: 'Muted', keys: ['muted', 'muted-foreground'] },
    { label: 'Destructive', keys: ['destructive', 'destructive-foreground'] },
    {
        label: 'Charts',
        keys: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'],
    },
    {
        label: 'Sidebar',
        keys: [
            'sidebar',
            'sidebar-foreground',
            'sidebar-primary',
            'sidebar-primary-foreground',
            'sidebar-accent',
            'sidebar-accent-foreground',
            'sidebar-border',
            'sidebar-ring',
        ],
    },
];

export function varLabel(key: string): string {
    return key
        .replace(/-/g, ' ')
        .replace(/\bfg\b/, 'foreground')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

const FONT_FALLBACKS: Record<'sans' | 'serif' | 'mono', string> = {
    sans: "ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    serif: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
};

export const DEFAULT_FONT = 'Instrument Sans';

export function defaultWorkingTheme(): WorkingTheme {
    return {
        id: null,
        name: '',
        light: { ...DEFAULT_LIGHT },
        dark: { ...DEFAULT_DARK },
        radius: DEFAULT_RADIUS,
        button_size: DEFAULT_BUTTON_SIZE,
        fonts: { sans: null, serif: null, mono: null },
    };
}

/**
 * Build a `:root {…}\n.dark {…}` block for the live editor preview tag.
 * Mirrors app/Support/ThemeCss::compile().
 */
export function compilePreviewCss(theme: WorkingTheme): string {
    const rootLines = THEME_KEYS.map((k) => `  --${k}: ${theme.light[k]};`);
    rootLines.push(`  --radius: ${theme.radius};`);

    (['sans', 'serif', 'mono'] as const).forEach((cat) => {
        const family = theme.fonts[cat];

        if (family && family !== DEFAULT_FONT) {
            const varName = cat === 'sans' ? '--font-sans' : `--font-${cat}`;
            rootLines.push(
                `  ${varName}: '${family}', ${FONT_FALLBACKS[cat]};`,
            );
        }
    });

    const darkLines = THEME_KEYS.map((k) => `  --${k}: ${theme.dark[k]};`);

    let css = `:root {\n${rootLines.join('\n')}\n}\n.dark {\n${darkLines.join('\n')}\n}`;

    // `html` prefix so the font-size wins over the text-sm utility class.
    const button = BUTTON_SIZE_CSS[theme.button_size] ?? null;

    if (button) {
        css += `\nhtml [data-slot="button"] {\n  --spacing: ${button.spacing};\n  font-size: ${button.fontSize};\n}`;
    }

    return css;
}

/* ---- Color → hex (canvas; getComputedStyle does not resolve oklch) ---- */

const hexCache = new Map<string, string | null>();
let sharedCtx: CanvasRenderingContext2D | null | undefined;

function ctx(): CanvasRenderingContext2D | null {
    if (sharedCtx === undefined) {
        sharedCtx =
            typeof document === 'undefined'
                ? null
                : document.createElement('canvas').getContext('2d', {
                      willReadFrequently: true,
                  });
    }

    return sharedCtx ?? null;
}

export function colorToHex(value: string): string | null {
    if (hexCache.has(value)) {
        return hexCache.get(value) ?? null;
    }

    const c = ctx();

    if (!c) {
        return null;
    }

    // Validity check: an unparseable value leaves fillStyle at the prior default.
    c.fillStyle = '#000';
    c.fillStyle = value;
    const first = c.fillStyle;
    c.fillStyle = '#fff';
    c.fillStyle = value;

    if (first !== c.fillStyle) {
        hexCache.set(value, null);

        return null;
    }

    // Paint and read the actual sRGB pixel (works for oklch/hsl/etc).
    c.clearRect(0, 0, 1, 1);
    c.fillStyle = value;
    c.fillRect(0, 0, 1, 1);
    const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
    const hex =
        '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');

    hexCache.set(value, hex);

    return hex;
}

/* ---- Import / export ---- */

const HSL_TRIPLET =
    /^\d+(\.\d+)?(deg)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%(\s*\/\s*[\d.]+%?)?$/;
const IGNORED_PREFIXES = [
    'shadow',
    'letter-spacing',
    'spacing',
    'tracking',
    'font-',
];

function coerceValue(raw: unknown): string | null {
    if (typeof raw !== 'string') {
        return null;
    }

    const value = raw.trim();

    // Legacy shadcn/tweakcn bare HSL triplets are meant for hsl(var(--x)); wrap them.
    return HSL_TRIPLET.test(value) ? `hsl(${value})` : value;
}

export type ImportResult = { theme: WorkingTheme; warnings: string[] };

export function normalizeThemeImport(
    raw: unknown,
    fontFamilies: string[],
): ImportResult {
    const warnings: string[] = [];
    const obj = (raw ?? {}) as Record<string, unknown>;
    const source = (obj.cssVars ?? obj.styles ?? obj) as Record<
        string,
        unknown
    >;

    const shared = stripPrefixes(
        (source.theme ?? {}) as Record<string, unknown>,
    );
    const theme = defaultWorkingTheme();

    if (typeof obj.name === 'string') {
        theme.name = obj.name.slice(0, 100);
    }

    if (
        typeof obj.button_size === 'string' &&
        obj.button_size in BUTTON_SIZE_CSS
    ) {
        theme.button_size = obj.button_size as ButtonSize;
    }

    (['light', 'dark'] as const).forEach((mode) => {
        const modeMap = source[mode];

        if (!modeMap || typeof modeMap !== 'object') {
            warnings.push(`No ${mode} values found; used defaults.`);

            return;
        }

        const merged = {
            ...shared,
            ...stripPrefixes(modeMap as Record<string, unknown>),
        };

        for (const [key, rawVal] of Object.entries(merged)) {
            if (key === 'radius') {
                const r = coerceValue(rawVal);

                if (r && mode === 'light') {
                    theme.radius = r;
                }

                continue;
            }

            if (key.startsWith('font-')) {
                if (mode === 'light') {
                    routeFont(key, rawVal, theme, fontFamilies, warnings);
                }

                continue;
            }

            if (IGNORED_PREFIXES.some((p) => key.startsWith(p))) {
                continue;
            }

            if (!THEME_KEYS.includes(key)) {
                warnings.push(`Ignored unsupported variable "${key}".`);
                continue;
            }

            const value = coerceValue(rawVal);

            if (value) {
                theme[mode][key] = value;
            }
        }
    });

    return { theme, warnings };
}

function stripPrefixes(map: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};

    for (const [k, v] of Object.entries(map)) {
        out[k.replace(/^--/, '')] = v;
    }

    return out;
}

function routeFont(
    key: string,
    rawVal: unknown,
    theme: WorkingTheme,
    fontFamilies: string[],
    warnings: string[],
): void {
    if (typeof rawVal !== 'string') {
        return;
    }

    const cat =
        key === 'font-sans'
            ? 'sans'
            : key === 'font-serif'
              ? 'serif'
              : key === 'font-mono'
                ? 'mono'
                : null;

    if (!cat) {
        return;
    }

    const family = rawVal.split(',')[0].replace(/['"]/g, '').trim();
    const match = fontFamilies.find(
        (f) => f.toLowerCase() === family.toLowerCase(),
    );

    if (match) {
        theme.fonts[cat] = match;
    } else if (family) {
        warnings.push(`Font "${family}" is not available; kept the default.`);
    }
}

export function exportTheme(theme: WorkingTheme): string {
    const fontVars: Record<string, string> = {};

    if (theme.fonts.sans) {
        fontVars['font-sans'] = theme.fonts.sans;
    }

    if (theme.fonts.serif) {
        fontVars['font-serif'] = theme.fonts.serif;
    }

    if (theme.fonts.mono) {
        fontVars['font-mono'] = theme.fonts.mono;
    }

    return JSON.stringify(
        {
            name: theme.name || 'Untitled theme',
            light: theme.light,
            dark: theme.dark,
            radius: theme.radius,
            button_size: theme.button_size,
            fonts: theme.fonts,
            // Also emit cssVars so exports round-trip into tweakcn / shadcn tooling.
            cssVars: {
                theme: { radius: theme.radius, ...fontVars },
                light: theme.light,
                dark: theme.dark,
            },
        },
        null,
        2,
    );
}

/* ---- Presets ---- */

function preset(
    name: string,
    light: Partial<VarMap>,
    dark: Partial<VarMap>,
): WorkingTheme {
    return {
        id: null,
        name,
        light: { ...DEFAULT_LIGHT, ...light } as VarMap,
        dark: { ...DEFAULT_DARK, ...dark } as VarMap,
        radius: DEFAULT_RADIUS,
        button_size: DEFAULT_BUTTON_SIZE,
        fonts: { sans: null, serif: null, mono: null },
    };
}

export const PRESETS: WorkingTheme[] = [
    defaultWorkingTheme(),
    preset(
        'Ocean',
        {
            primary: 'oklch(0.55 0.18 250)',
            'primary-foreground': 'oklch(0.985 0 0)',
            ring: 'oklch(0.55 0.18 250)',
            accent: 'oklch(0.95 0.03 240)',
            'accent-foreground': 'oklch(0.35 0.12 250)',
        },
        {
            primary: 'oklch(0.7 0.15 250)',
            'primary-foreground': 'oklch(0.16 0.03 250)',
            ring: 'oklch(0.7 0.15 250)',
        },
    ),
    preset(
        'Forest',
        {
            primary: 'oklch(0.55 0.14 155)',
            'primary-foreground': 'oklch(0.985 0 0)',
            ring: 'oklch(0.55 0.14 155)',
            accent: 'oklch(0.95 0.03 150)',
            'accent-foreground': 'oklch(0.35 0.1 155)',
        },
        {
            primary: 'oklch(0.72 0.14 155)',
            'primary-foreground': 'oklch(0.16 0.03 155)',
            ring: 'oklch(0.72 0.14 155)',
        },
    ),
    preset(
        'Rose',
        {
            primary: 'oklch(0.58 0.2 15)',
            'primary-foreground': 'oklch(0.985 0 0)',
            ring: 'oklch(0.58 0.2 15)',
            accent: 'oklch(0.95 0.03 15)',
            'accent-foreground': 'oklch(0.4 0.15 15)',
        },
        {
            primary: 'oklch(0.7 0.19 15)',
            'primary-foreground': 'oklch(0.16 0.03 15)',
            ring: 'oklch(0.7 0.19 15)',
        },
    ),
];
