import { Form, Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import InputError from '@/components/input-error';
import PermissionCheckboxGroup from '@/components/permission-checkbox-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/admin/roles';
import type { GroupedPermissions, RoleFormData } from '@/types';

type PageProps = {
    role: RoleFormData;
    groupedPermissions: GroupedPermissions;
};

export default function EditRole({ role, groupedPermissions }: PageProps) {
    return (
        <>
            <Head title={`Edit ${role.name}`} />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Edit role</h2>
                    <p className="text-sm text-muted-foreground">
                        Update the name and permissions for {role.name}.
                    </p>
                </div>

                <Button variant="ghost" size="sm" asChild>
                    <Link href={index().url}>Cancel</Link>
                </Button>
            </div>

            <Form
                action={RoleController.update.url(role.id)}
                method="put"
                options={{ preserveScroll: true }}
                className="max-w-2xl space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Role name</Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                autoComplete="off"
                                defaultValue={role.name}
                            />
                            <p className="text-xs text-muted-foreground">
                                Use lowercase letters, numbers, and underscores
                                only.
                            </p>
                            <InputError message={errors.name} />
                        </div>

                        <PermissionCheckboxGroup
                            groupedPermissions={groupedPermissions}
                            defaultSelected={role.permissions}
                            error={errors.permissions}
                        />

                        <Button type="submit" disabled={processing}>
                            Save changes
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}
