<?php

namespace App\Support;

use App\Models\Theme;
use Illuminate\Support\Str;

/**
 * Compiles a saved Theme into a CSS variable block and its font <link> URLs.
 *
 * Single source of truth for the variable whitelist and value sanitization.
 * Because the output is echoed into a <style> tag, every value is validated
 * here at compile time too (not just in the FormRequest) — the database is not
 * a trust boundary.
 */
class ThemeCss
{
    /**
     * The complete shadcn variable set (mirrors resources/css/app.css :root/.dark).
     * Keep in sync with resources/js/lib/theme.ts DEFAULT_LIGHT/DEFAULT_DARK.
     */
    public const KEYS = [
        'background', 'foreground',
        'card', 'card-foreground',
        'popover', 'popover-foreground',
        'primary', 'primary-foreground',
        'secondary', 'secondary-foreground',
        'muted', 'muted-foreground',
        'accent', 'accent-foreground',
        'destructive', 'destructive-foreground',
        'border', 'input', 'ring',
        'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
        'sidebar', 'sidebar-foreground',
        'sidebar-primary', 'sidebar-primary-foreground',
        'sidebar-accent', 'sidebar-accent-foreground',
        'sidebar-border', 'sidebar-ring',
    ];

    /**
     * Allowlist for CSS color values. Permits hex, oklch/hsl/rgb/lab/color(),
     * named colors, calc() and var() — but excludes quotes, colons, braces,
     * semicolons and newlines, so a value can never break out of a declaration.
     */
    public const VALUE_PATTERN = '/^[A-Za-z0-9#%.,()\/*+\- ]+$/';

    public const RADIUS_PATTERN = '/^\d*\.?\d+(rem|px|em)$/';

    /**
     * Button size presets. Scoping Tailwind's --spacing to buttons scales
     * every spacing-derived utility on them (h-*, px-*, gap-*, size-*), so
     * all button size variants shrink/grow proportionally. `default` emits
     * no CSS. Keep in sync with resources/js/lib/theme.ts BUTTON_SIZE_CSS.
     */
    public const BUTTON_SIZES = [
        'sm' => ['spacing' => '0.225rem', 'font-size' => '0.8125rem'],
        'default' => null,
        'lg' => ['spacing' => '0.275rem', 'font-size' => '0.9375rem'],
        'xl' => ['spacing' => '0.3rem', 'font-size' => '1rem'],
    ];

    /**
     * Font fallback stacks appended after a chosen family, by category.
     */
    protected const FONT_FALLBACKS = [
        'sans' => "ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
        'serif' => "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
        'mono' => "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    ];

    /**
     * Build the `:root {…}\n.dark {…}` block for the theme.
     */
    public static function compile(Theme $theme): string
    {
        $rootLines = self::variableLines((array) $theme->light);

        if (is_string($theme->radius) && preg_match(self::RADIUS_PATTERN, $theme->radius)) {
            $rootLines[] = "    --radius: {$theme->radius};";
        }

        foreach (self::fontDeclarations((array) $theme->fonts) as $declaration) {
            $rootLines[] = $declaration;
        }

        $darkLines = self::variableLines((array) $theme->dark);

        $css = ":root {\n".implode("\n", $rootLines)."\n}\n"
            .".dark {\n".implode("\n", $darkLines)."\n}";

        // `html` prefix so the font-size wins over the text-sm utility class.
        $button = is_string($theme->button_size)
            ? (self::BUTTON_SIZES[$theme->button_size] ?? null)
            : null;

        if ($button) {
            $css .= "\nhtml [data-slot=\"button\"] {\n"
                ."    --spacing: {$button['spacing']};\n"
                ."    font-size: {$button['font-size']};\n"
                .'}';
        }

        return $css;
    }

    /**
     * Bunny stylesheet URLs for the theme's non-default font families.
     *
     * @return array<int, string>
     */
    public static function fontLinks(Theme $theme): array
    {
        $default = config('theme-fonts.default');
        $families = collect((array) $theme->fonts)
            ->filter(fn ($family) => filled($family) && $family !== $default)
            ->unique()
            ->map(fn ($family) => self::bunnySegment($family))
            ->filter()
            ->values();

        if ($families->isEmpty()) {
            return [];
        }

        return [
            config('theme-fonts.bunny_url').'?family='.$families->implode('|').'&display=swap',
        ];
    }

    /**
     * @param  array<string, mixed>  $map
     * @return array<int, string>
     */
    protected static function variableLines(array $map): array
    {
        $lines = [];

        foreach (self::KEYS as $key) {
            $value = $map[$key] ?? null;

            if (is_string($value) && strlen($value) <= 120 && preg_match(self::VALUE_PATTERN, $value)) {
                $lines[] = "    --{$key}: {$value};";
            }
        }

        return $lines;
    }

    /**
     * @param  array<string, mixed>  $fonts
     * @return array<int, string>
     */
    protected static function fontDeclarations(array $fonts): array
    {
        $default = config('theme-fonts.default');
        $lines = [];

        $map = ['sans' => '--font-sans', 'serif' => '--font-serif', 'mono' => '--font-mono'];

        foreach ($map as $category => $var) {
            $family = $fonts[$category] ?? null;

            if (blank($family) || $family === $default || ! self::isKnownFamily($family)) {
                continue;
            }

            $fallback = self::FONT_FALLBACKS[$category];
            $lines[] = "    {$var}: '{$family}', {$fallback};";
        }

        return $lines;
    }

    protected static function isKnownFamily(string $family): bool
    {
        return collect(config('theme-fonts.families'))->contains('family', $family);
    }

    protected static function bunnySegment(string $family): ?string
    {
        $entry = collect(config('theme-fonts.families'))->firstWhere('family', $family);

        if (! $entry) {
            return null;
        }

        $slug = Str::of($family)->lower()->replace(' ', '-')->value();
        $weights = implode(',', $entry['weights'] ?? [400]);

        return "{$slug}:{$weights}";
    }
}
