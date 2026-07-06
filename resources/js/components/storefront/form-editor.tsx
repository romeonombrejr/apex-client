import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import FormController from '@/actions/App/Http/Controllers/Admin/Storefront/FormController';
import InputError from '@/components/input-error';
import { FormBuilder } from '@/components/storefront/form-builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { index as formsIndex } from '@/routes/admin/storefront/forms';
import type { FieldInput, FieldType } from '@/types';

type EditableForm = {
    id: number;
    name: string;
    description: string | null;
    fields: FieldInput[];
};

type Props = {
    form?: EditableForm;
    fieldTypes: FieldType[];
};

export default function FormEditor({ form, fieldTypes }: Props) {
    const [name, setName] = useState(form?.name ?? '');
    const [description, setDescription] = useState(form?.description ?? '');
    const [fields, setFields] = useState<FieldInput[]>(form?.fields ?? []);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    function submit() {
        const payload = { name, description, fields };
        const options = {
            onError: setErrors,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        };

        if (form?.id) {
            router.put(FormController.update.url(form.id), payload, options);
        } else {
            router.post(FormController.store.url(), payload, options);
        }
    }

    return (
        <>
            <Head title={form ? `Edit ${form.name}` : 'New form'} />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">
                    {form ? 'Edit form' : 'New form'}
                </h1>
                <p className="text-sm text-muted-foreground">
                    Build a reusable intake form to attach to services.
                </p>
            </div>

            <div className="max-w-3xl space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Form name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <InputError message={errors.description} />
                </div>

                <div>
                    <h2 className="mb-3 font-semibold">Fields</h2>
                    <FormBuilder
                        fields={fields}
                        onChange={setFields}
                        fieldTypes={fieldTypes}
                        errors={errors}
                    />
                </div>

                <div className="flex gap-3">
                    <Button onClick={submit} disabled={processing}>
                        {processing && <Spinner />}
                        {form ? 'Save changes' : 'Create form'}
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={formsIndex().url}>Cancel</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
