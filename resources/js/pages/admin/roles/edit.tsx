import { Form, Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/admin/roles';
import type { RoleFormData } from '@/types';

type PageProps = {
    role: RoleFormData;
};

export default function EditRole({ role }: PageProps) {
    return (
        <>
            <Head title={`Edit ${role.name}`} />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Edit role</h2>
                    <p className="text-muted-foreground text-sm">
                        Update the role name for {role.name}.
                    </p>
                </div>

                <Button variant="ghost" size="sm" asChild>
                    <Link href={index().url}>Cancel</Link>
                </Button>
            </div>

            <Form
                {...RoleController.update.form(role.id)}
                options={{ preserveScroll: true }}
                className="max-w-md space-y-6"
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
                            <p className="text-muted-foreground text-xs">
                                Use lowercase letters, numbers, and underscores only.
                            </p>
                            <InputError message={errors.name} />
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
