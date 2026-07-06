import type { DynamicFormValues } from '@/components/storefront/dynamic-form';

/**
 * Append dynamic-form answers onto a FormData payload for cart requests.
 * Files go under `files[key]`; multi-choice answers under `answers[key][]`;
 * scalars under `answers[key]`. Empty values are skipped.
 */
export function appendAnswers(fd: FormData, values: DynamicFormValues): void {
    Object.entries(values).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return;
        }

        if (value instanceof File) {
            fd.append(`files[${key}]`, value);
        } else if (Array.isArray(value)) {
            value.forEach((v) => fd.append(`answers[${key}][]`, v));
        } else if (value !== '') {
            fd.append(`answers[${key}]`, value);
        }
    });
}
