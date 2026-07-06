import type { FormAnswers, FormDefinition } from '@/types';

type Props = {
    form: FormDefinition | null;
    answers: FormAnswers;
};

function displayValue(value: FormAnswers[string], isFile: boolean): string {
    if (Array.isArray(value)) {
        return value.join(', ');
    }

    if (typeof value === 'string' && isFile) {
        return value.split('/').pop() ?? value;
    }

    return typeof value === 'string' ? value : '';
}

export function AnswersDisplay({ form, answers }: Props) {
    const fields = form?.fields ?? [];

    if (fields.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No form is attached to this order.
            </p>
        );
    }

    return (
        <dl className="grid gap-3 sm:grid-cols-2">
            {fields.map((field) => {
                const value = answers[field.key];
                const shown = displayValue(value, field.type === 'file');

                return (
                    <div key={field.key}>
                        <dt className="text-xs text-muted-foreground">
                            {field.label}
                        </dt>
                        <dd className="text-sm">
                            {shown === '' ? (
                                <span className="text-muted-foreground">—</span>
                            ) : (
                                shown
                            )}
                        </dd>
                    </div>
                );
            })}
        </dl>
    );
}
