import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { FieldInput, FieldType } from '@/types';

const CHOICE_TYPES: FieldType[] = ['select', 'radio', 'checkbox'];

const TYPE_LABELS: Record<FieldType, string> = {
    text: 'Short text',
    textarea: 'Paragraph',
    number: 'Number',
    date: 'Date',
    select: 'Dropdown',
    radio: 'Single choice',
    checkbox: 'Multiple choice',
    file: 'File upload',
};

export function slugifyKey(label: string): string {
    return label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

type Props = {
    fields: FieldInput[];
    onChange: (fields: FieldInput[]) => void;
    fieldTypes: FieldType[];
    errors?: Record<string, string>;
};

export function FormBuilder({
    fields,
    onChange,
    fieldTypes,
    errors = {},
}: Props) {
    function update(index: number, patch: Partial<FieldInput>) {
        onChange(fields.map((f, i) => (i === index ? { ...f, ...patch } : f)));
    }

    function updateLabel(index: number, label: string) {
        const field = fields[index];
        // Auto-fill the key from the label until the user edits the key directly.
        const keyFollowsLabel =
            field.key === '' || field.key === slugifyKey(field.label);
        update(index, {
            label,
            key: keyFollowsLabel ? slugifyKey(label) : field.key,
        });
    }

    function addField() {
        onChange([
            ...fields,
            {
                label: '',
                key: '',
                type: 'text',
                help: '',
                required: false,
                options: [],
            },
        ]);
    }

    function removeField(index: number) {
        onChange(fields.filter((_, i) => i !== index));
    }

    function move(index: number, direction: -1 | 1) {
        const target = index + direction;

        if (target < 0 || target >= fields.length) {
            return;
        }

        const next = [...fields];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    }

    return (
        <div className="space-y-4">
            {fields.map((field, index) => (
                <div key={index} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <GripVertical className="h-4 w-4" />
                            Field {index + 1}
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => move(index, -1)}
                                disabled={index === 0}
                            >
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => move(index, 1)}
                                disabled={index === fields.length - 1}
                            >
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeField(index)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label>Label</Label>
                            <Input
                                value={field.label}
                                onChange={(e) =>
                                    updateLabel(index, e.target.value)
                                }
                            />
                            <InputError
                                message={errors[`fields.${index}.label`]}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Key</Label>
                            <Input
                                value={field.key}
                                onChange={(e) =>
                                    update(index, {
                                        key: slugifyKey(e.target.value),
                                    })
                                }
                            />
                            <InputError
                                message={errors[`fields.${index}.key`]}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Type</Label>
                            <Select
                                value={field.type}
                                onValueChange={(v) =>
                                    update(index, { type: v as FieldType })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {fieldTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {TYPE_LABELS[type]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Help text (optional)</Label>
                            <Input
                                value={field.help}
                                onChange={(e) =>
                                    update(index, { help: e.target.value })
                                }
                            />
                        </div>

                        {CHOICE_TYPES.includes(field.type) && (
                            <div className="grid gap-2 sm:col-span-2">
                                <Label>Options (one per line)</Label>
                                <Textarea
                                    value={field.options.join('\n')}
                                    onChange={(e) =>
                                        update(index, {
                                            options: e.target.value
                                                .split('\n')
                                                .map((o) => o.trim())
                                                .filter(Boolean),
                                        })
                                    }
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-2 sm:col-span-2">
                            <Checkbox
                                id={`required-${index}`}
                                checked={field.required}
                                onCheckedChange={(checked) =>
                                    update(index, {
                                        required: checked === true,
                                    })
                                }
                            />
                            <Label
                                htmlFor={`required-${index}`}
                                className="font-normal"
                            >
                                Required
                            </Label>
                        </div>
                    </div>
                </div>
            ))}

            <Button type="button" variant="outline" onClick={addField}>
                <Plus className="mr-1 h-4 w-4" /> Add field
            </Button>
        </div>
    );
}
