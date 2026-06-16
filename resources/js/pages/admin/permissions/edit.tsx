import { Form, Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import PermissionController from '@/actions/App/Http/Controllers/Admin/PermissionController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/admin/permissions';
import type { PermissionFormData } from '@/types';

type PageProps = {
    permission: PermissionFormData;
};

export default function EditPermission({ permission }: PageProps) {
    return (
        <>
            <Head title={`Edit ${permission.name}`} />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Edit permission</h2>
                    <p className="text-sm text-muted-foreground">
                        Update the name and group for {permission.name}.
                    </p>
                </div>

                <Button variant="ghost" size="sm" asChild>
                    <Link href={index().url}>Cancel</Link>
                </Button>
            </div>

            <Form
                {...PermissionController.update.form(permission.id)}
                options={{ preserveScroll: true }}
                className="max-w-md space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Permission name</Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                autoComplete="off"
                                defaultValue={permission.name}
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="group">Group</Label>
                            <Input
                                id="group"
                                name="group"
                                autoComplete="off"
                                defaultValue={permission.group ?? ''}
                            />
                            <InputError message={errors.group} />
                        </div>

                        <Button type="submit" disabled={processing}>
                            Save changes
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}
