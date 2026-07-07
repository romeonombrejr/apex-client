import { Head, Link, router } from '@inertiajs/react';
import { Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    create,
    destroy,
    duplicate,
    edit,
} from '@/routes/admin/storefront/forms';
import type { FormRow } from '@/types';

export default function FormsIndex({ forms }: { forms: FormRow[] }) {
    function remove(form: FormRow) {
        if (!confirm(`Delete the "${form.name}" form?`)) {
            return;
        }

        router.delete(destroy({ form: form.id }).url, { preserveScroll: true });
    }

    function copy(form: FormRow) {
        router.post(duplicate({ form: form.id }).url);
    }

    return (
        <>
            <Head title="Forms" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Forms</h1>
                    <p className="text-sm text-muted-foreground">
                        Reusable intake forms for your services.
                    </p>
                </div>
                <Button asChild>
                    <Link href={create().url}>
                        <Plus className="mr-1 h-4 w-4" /> New form
                    </Link>
                </Button>
            </div>

            {forms.length === 0 ? (
                <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
                    No forms yet. Create one to attach to a service.
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Fields</TableHead>
                            <TableHead>Used by</TableHead>
                            <TableHead className="w-24" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {forms.map((form) => (
                            <TableRow key={form.id}>
                                <TableCell className="font-medium">
                                    {form.name}
                                    {form.description && (
                                        <p className="text-xs font-normal text-muted-foreground">
                                            {form.description}
                                        </p>
                                    )}
                                </TableCell>
                                <TableCell>{form.fields_count}</TableCell>
                                <TableCell>
                                    {form.services_count} service
                                    {form.services_count === 1 ? '' : 's'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Duplicate"
                                            onClick={() => copy(form)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                        >
                                            <Link
                                                href={
                                                    edit({ form: form.id }).url
                                                }
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(form)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    );
}
