import { Input } from '@/components/ui/input';
import { colorToHex, varLabel } from '@/lib/theme';

type Props = {
    name: string;
    value: string;
    onChange: (value: string) => void;
};

export default function ColorRow({ name, value, onChange }: Props) {
    const hex = colorToHex(value) ?? '#000000';

    return (
        <div className="flex items-center gap-2">
            <label className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border">
                {/* Swatch shows the true value (oklch renders fine inline) */}
                <span
                    className="block h-full w-full"
                    style={{ backgroundColor: value }}
                />
                <input
                    type="color"
                    value={hex}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label={`${varLabel(name)} color`}
                />
            </label>
            <div className="min-w-0 flex-1">
                <div className="truncate text-xs text-muted-foreground">
                    {varLabel(name)}
                </div>
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    spellCheck={false}
                    className="h-7 font-mono text-xs"
                />
            </div>
        </div>
    );
}
