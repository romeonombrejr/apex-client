import InputError from '@/components/input-error';
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
import type { FormFieldDef } from '@/types';

export type FieldValue = string | string[] | File | null;
export type DynamicFormValues = Record<string, FieldValue>;

type Props = {
    fields: FormFieldDef[];
    values: DynamicFormValues;
    onChange: (key: string, value: FieldValue) => void;
    errors?: Record<string, string>;
    idPrefix?: string;
};

function asString(value: FieldValue): string {
    return typeof value === 'string' ? value : '';
}

function asArray(value: FieldValue): string[] {
    return Array.isArray(value) ? value : [];
}

export function DynamicForm({
    fields,
    values,
    onChange,
    errors = {},
    idPrefix = 'field',
}: Props) {
    if (fields.length === 0) {
        return null;
    }

    return (
        <div className="space-y-5">
            {fields.map((field) => {
                const id = `${idPrefix}-${field.key}`;
                const value = values[field.key] ?? null;

                return (
                    <div key={field.key} className="grid gap-2">
                        <Label htmlFor={id}>
                            {field.label}
                            {field.required && (
                                <span className="ml-0.5 text-destructive">
                                    *
                                </span>
                            )}
                        </Label>

                        {field.type === 'textarea' && (
                            <Textarea
                                id={id}
                                value={asString(value)}
                                onChange={(e) =>
                                    onChange(field.key, e.target.value)
                                }
                            />
                        )}

                        {(field.type === 'text' ||
                            field.type === 'number' ||
                            field.type === 'date') && (
                            <Input
                                id={id}
                                type={
                                    field.type === 'text' ? 'text' : field.type
                                }
                                value={asString(value)}
                                onChange={(e) =>
                                    onChange(field.key, e.target.value)
                                }
                            />
                        )}

                        {field.type === 'select' && (
                            <Select
                                value={asString(value)}
                                onValueChange={(v) => onChange(field.key, v)}
                            >
                                <SelectTrigger id={id}>
                                    <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                                <SelectContent>
                                    {field.options.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {field.type === 'radio' && (
                            <div className="space-y-2">
                                {field.options.map((option) => (
                                    <label
                                        key={option}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <input
                                            type="radio"
                                            name={id}
                                            className="size-4 accent-primary"
                                            checked={asString(value) === option}
                                            onChange={() =>
                                                onChange(field.key, option)
                                            }
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        )}

                        {field.type === 'checkbox' && (
                            <div className="space-y-2">
                                {field.options.map((option) => {
                                    const selected = asArray(value);

                                    return (
                                        <div
                                            key={option}
                                            className="flex items-center gap-2"
                                        >
                                            <Checkbox
                                                id={`${id}-${option}`}
                                                checked={selected.includes(
                                                    option,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    onChange(
                                                        field.key,
                                                        checked === true
                                                            ? [
                                                                  ...selected,
                                                                  option,
                                                              ]
                                                            : selected.filter(
                                                                  (o) =>
                                                                      o !==
                                                                      option,
                                                              ),
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={`${id}-${option}`}
                                                className="font-normal"
                                            >
                                                {option}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {field.type === 'file' && (
                            <div className="space-y-1">
                                <Input
                                    id={id}
                                    type="file"
                                    onChange={(e) =>
                                        onChange(
                                            field.key,
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                {typeof value === 'string' && value !== '' && (
                                    <p className="truncate text-xs text-muted-foreground">
                                        Current: {value.split('/').pop()}
                                    </p>
                                )}
                            </div>
                        )}

                        {field.help && (
                            <p className="text-xs text-muted-foreground">
                                {field.help}
                            </p>
                        )}

                        <InputError message={errors[field.key]} />
                    </div>
                );
            })}
        </div>
    );
}
