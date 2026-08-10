import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { exportTheme, normalizeThemeImport } from '@/lib/theme';
import type { WorkingTheme } from '@/lib/theme';

type Props = {
    working: WorkingTheme;
    fontFamilies: string[];
    onImport: (theme: WorkingTheme) => void;
};

export default function ImportExportDialog({
    working,
    fontFamilies,
    onImport,
}: Props) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');

    /**
     * The textarea is seeded with the current theme the moment the dialog
     * opens. Doing it here rather than in an effect on `working` means a
     * re-render upstream can't wipe JSON the user has typed in to import.
     */
    function handleOpenChange(next: boolean) {
        if (next) {
            setText(exportTheme(working));
        }

        setOpen(next);
    }

    function handleImport() {
        let parsed: unknown;

        try {
            parsed = JSON.parse(text);
        } catch {
            toast.error('That is not valid JSON.');

            return;
        }

        const { theme, warnings } = normalizeThemeImport(parsed, fontFamilies);
        onImport(theme);
        setOpen(false);

        if (warnings.length > 0) {
            toast.warning(`Imported with ${warnings.length} note(s).`, {
                description: warnings.slice(0, 3).join(' '),
            });
        } else {
            toast.success('Theme imported.');
        }
    }

    function handleCopy() {
        navigator.clipboard?.writeText(text);
        toast.success('Copied to clipboard.');
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Import / Export
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Import / Export theme</DialogTitle>
                    <DialogDescription>
                        Copy this JSON to share the theme, or paste one in
                        (including themes exported from tweakcn) and import.
                    </DialogDescription>
                </DialogHeader>

                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    spellCheck={false}
                    className="h-72 font-mono text-xs"
                />

                <DialogFooter>
                    <Button variant="outline" onClick={handleCopy}>
                        Copy
                    </Button>
                    <Button onClick={handleImport}>Import</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
