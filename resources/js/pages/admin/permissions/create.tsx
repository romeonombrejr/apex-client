import { Form, Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import PermissionController from '@/actions/App/Http/Controllers/Admin/PermissionController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/admin/permissions';

export default function CreatePermission() {
    return (
        <>
            <Head title="New permission" />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">New permission</h2>
                    <p className="text-sm text-muted-foreground">
                        Create a new permission that roles can be granted.
                    </p>
                </div>

                <Button variant="ghost" size="sm" asChild>
                    <Link href={index().url}>Cancel</Link>
                </Button>
            </div>

            <Form
                action={PermissionController.store.url()}
                method="post"
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
                                placeholder="e.g., reports.manage"
                            />
                            <p className="text-xs text-muted-foreground">
                                Use lowercase letters, numbers, dots,
                                underscores, and hyphens only.
                            </p>
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="group">Group</Label>
                            <Input
                                id="group"
                                name="group"
                                autoComplete="off"
                                placeholder="e.g., reports"
                            />
                            <p className="text-xs text-muted-foreground">
                                Used to organize permissions on the Roles form.
                                Optional.
                            </p>
                            <InputError message={errors.group} />
                        </div>

                        <Button type="submit" disabled={processing}>
                            Create permission
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}
