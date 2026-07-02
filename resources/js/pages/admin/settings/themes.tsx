import { Head, router } from '@inertiajs/react';
import { Check, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import ThemeController from '@/actions/App/Http/Controllers/Admin/ThemeController';
import ColorRow from '@/components/theme-editor/color-row';
import ImportExportDialog from '@/components/theme-editor/import-export-dialog';
import PreviewPanel from '@/components/theme-editor/preview-panel';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAppearance } from '@/hooks/use-appearance';
import {
    compilePreviewCss,
    DEFAULT_FONT,
    DEFAULT_RADIUS,
    defaultWorkingTheme,
    PRESETS,
    THEME_GROUPS,
    type ThemeMode,
    type WorkingTheme,
} from '@/lib/theme';

type FontOption = { family: string; category: string; weights: number[] };
type SavedTheme = WorkingTheme & { is_active: boolean };

type PageProps = {
    themes: SavedTheme[];
    activeThemeId: number | null;
    fontOptions: FontOption[];
    defaultFont: string;
};

const RADIUS_OPTIONS = ['0rem', '0.25rem', '0.375rem', '0.5rem', '0.625rem', '0.75rem', '1rem'];

export default function ThemesEditor({
    themes,
    activeThemeId,
    fontOptions,
}: PageProps) {
    const { appearance, resolvedAppearance, updateAppearance } = useAppearance();

    const [working, setWorking] = useState<WorkingTheme>(defaultWorkingTheme);
    const [snapshot, setSnapshot] = useState(() => JSON.stringify(defaultWorkingTheme()));
    // Open on whichever mode the app is currently showing.
    const [mode, setMode] = useState<ThemeMode>(resolvedAppearance);
    const loadedFonts = useRef<Set<string>>(new Set());

    // Toggling light/dark switches the whole app live so the preview is immersive.
    // Restore the user's original preference when they leave the editor.
    const originalAppearance = useRef(appearance);
    useEffect(() => {
        return () => updateAppearance(originalAppearance.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function changeMode(next: ThemeMode) {
        setMode(next);
        updateAppearance(next);
    }

    const dirty = useMemo(() => JSON.stringify(working) !== snapshot, [working, snapshot]);

    // Live preview: a style tag re-appended on every change so it wins the cascade.
    useEffect(() => {
        let tag = document.getElementById('theme-editor-preview') as HTMLStyleElement | null;
        if (!tag) {
            tag = document.createElement('style');
            tag.id = 'theme-editor-preview';
        }
        tag.textContent = compilePreviewCss(working);
        document.head.appendChild(tag);
    }, [working]);

    useEffect(() => {
        return () => {
            document.getElementById('theme-editor-preview')?.remove();
            document
                .querySelectorAll('link[data-theme-editor-font]')
                .forEach((el) => el.remove());
        };
    }, []);

    // Lazily load selected fonts so the preview reflects them.
    useEffect(() => {
        (['sans', 'serif', 'mono'] as const).forEach((cat) => {
            const family = working.fonts[cat];
            if (!family || family === DEFAULT_FONT || loadedFonts.current.has(family)) {
                return;
            }
            const entry = fontOptions.find((f) => f.family === family);
            if (!entry) return;
            const slug = family.toLowerCase().replace(/ /g, '-');
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `https://fonts.bunny.net/css?family=${slug}:${entry.weights.join(',')}&display=swap`;
            link.dataset.themeEditorFont = '';
            document.head.appendChild(link);
            loadedFonts.current.add(family);
        });
    }, [working.fonts, fontOptions]);

    function load(theme: WorkingTheme) {
        if (dirty && !confirm('Discard unsaved changes?')) {
            return;
        }
        setWorking(theme);
        setSnapshot(JSON.stringify(theme));
    }

    function setVar(key: string, value: string) {
        setWorking((w) => ({ ...w, [mode]: { ...w[mode], [key]: value } }));
    }

    function setFont(cat: 'sans' | 'serif' | 'mono', family: string) {
        setWorking((w) => ({
            ...w,
            fonts: { ...w.fonts, [cat]: family === DEFAULT_FONT ? null : family },
        }));
    }

    function payload(name: string) {
        return {
            name,
            light: working.light,
            dark: working.dark,
            radius: working.radius,
            fonts: working.fonts,
        };
    }

    function showErrors(errors: Record<string, string>) {
        toast.error(Object.values(errors)[0] ?? 'Could not save the theme.');
    }

    function save() {
        if (!working.name.trim()) {
            toast.error('Give the theme a name first.');
            return;
        }
        if (working.id) {
            router.put(ThemeController.update.url(working.id), payload(working.name), {
                preserveScroll: true,
                onError: showErrors,
            });
        } else {
            router.post(ThemeController.store.url(), payload(working.name), {
                preserveScroll: true,
                onError: showErrors,
            });
        }
    }

    function activate() {
        if (!working.id) return;
        router.post(ThemeController.activate.url(working.id), {}, { preserveScroll: true });
    }

    function remove() {
        if (!working.id || !confirm(`Delete "${working.name}"?`)) return;
        router.delete(ThemeController.destroy.url(working.id), { preserveScroll: true });
    }

    function resetToDefault() {
        if (!confirm('Reset to the default theme? Any active theme will be deactivated.')) return;
        router.post(ThemeController.reset.url(), {}, { preserveScroll: true });
        load(defaultWorkingTheme());
    }

    const fontsByCategory = (category: string) =>
        fontOptions.filter((f) => f.category === category);

    return (
        <>
            <Head title="Themes" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Theme editor</h2>
                    <p className="text-sm text-muted-foreground">
                        Customize colors, radius, and fonts. Changes preview live; save and
                        activate to apply across the app.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <ImportExportDialog
                        working={working}
                        fontFamilies={fontOptions.map((f) => f.family)}
                        onImport={(t) => {
                            setWorking(t);
                            setSnapshot('');
                        }}
                    />
                    <Button variant="outline" size="sm" onClick={resetToDefault}>
                        <RotateCcw className="mr-1 h-4 w-4" />
                        Reset to default
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
                {/* ---- Editor panel ---- */}
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="theme-name">Theme name</Label>
                        <Input
                            id="theme-name"
                            value={working.name}
                            onChange={(e) => setWorking((w) => ({ ...w, name: e.target.value }))}
                            placeholder="e.g. Brand 2025"
                        />
                    </div>

                    <ToggleGroup
                        type="single"
                        value={mode}
                        onValueChange={(v) => v && changeMode(v as ThemeMode)}
                        className="w-full"
                    >
                        <ToggleGroupItem value="light" className="flex-1">
                            Light
                        </ToggleGroupItem>
                        <ToggleGroupItem value="dark" className="flex-1">
                            Dark
                        </ToggleGroupItem>
                    </ToggleGroup>

                    <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                        {THEME_GROUPS.map((group) => (
                            <Collapsible key={group.label} defaultOpen={group.label === 'Primary'}>
                                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-medium">
                                    {group.label}
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-2 py-2">
                                    {group.keys.map((key) => (
                                        <ColorRow
                                            key={key}
                                            name={key}
                                            value={working[mode][key]}
                                            onChange={(v) => setVar(key, v)}
                                        />
                                    ))}
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </div>

                    <div className="grid gap-2">
                        <Label>Radius</Label>
                        <Select
                            value={working.radius}
                            onValueChange={(v) => setWorking((w) => ({ ...w, radius: v }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {RADIUS_OPTIONS.map((r) => (
                                    <SelectItem key={r} value={r}>
                                        {r === DEFAULT_RADIUS ? `${r} (default)` : r}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {(['sans', 'serif', 'mono'] as const).map((cat) => (
                        <div key={cat} className="grid gap-2">
                            <Label className="capitalize">{cat} font</Label>
                            <Select
                                value={working.fonts[cat] ?? DEFAULT_FONT}
                                onValueChange={(v) => setFont(cat, v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={DEFAULT_FONT}>Default</SelectItem>
                                    {fontsByCategory(cat).map((f) => (
                                        <SelectItem key={f.family} value={f.family}>
                                            {f.family}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}

                    <div className="flex flex-wrap gap-2 border-t pt-4">
                        <Button onClick={save} disabled={!dirty && working.id !== null}>
                            {working.id ? 'Save' : 'Save theme'}
                        </Button>
                        {working.id && (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={activate}
                                    disabled={activeThemeId === working.id}
                                >
                                    <Check className="mr-1 h-4 w-4" />
                                    {activeThemeId === working.id ? 'Active' : 'Activate'}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={remove}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* ---- Preview + library ---- */}
                <div className="space-y-6">
                    {/* The whole app already reflects `mode` (see changeMode), so the
                        preview needs no separate .dark wrapper. */}
                    <PreviewPanel />

                    <div>
                        <h3 className="mb-2 text-sm font-medium">Presets</h3>
                        <div className="flex flex-wrap gap-2">
                            {PRESETS.map((preset) => (
                                <Button
                                    key={preset.name}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => load({ ...preset, name: preset.name })}
                                >
                                    {preset.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {themes.length > 0 && (
                        <div>
                            <h3 className="mb-2 text-sm font-medium">Saved themes</h3>
                            <div className="flex flex-wrap gap-2">
                                {themes.map((theme) => (
                                    <Button
                                        key={theme.id}
                                        variant={working.id === theme.id ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() =>
                                            load({
                                                id: theme.id,
                                                name: theme.name,
                                                light: theme.light,
                                                dark: theme.dark,
                                                radius: theme.radius || DEFAULT_RADIUS,
                                                fonts: theme.fonts ?? {
                                                    sans: null,
                                                    serif: null,
                                                    mono: null,
                                                },
                                            })
                                        }
                                    >
                                        {theme.name}
                                        {theme.is_active && (
                                            <Check className="ml-1 h-3 w-3" />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
