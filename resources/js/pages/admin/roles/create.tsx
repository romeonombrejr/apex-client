import { Form, Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/admin/roles';

export default function CreateRole() {
    return (
        <>
            <Head title="New role" />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">New role</h2>
                    <p className="text-muted-foreground text-sm">
                        Create a new user role.
                    </p>
                </div>

                <Button variant="ghost" size="sm" asChild>
                    <Link href={index().url}>Cancel</Link>
                </Button>
            </div>

            <Form {...RoleController.store.form()} className="max-w-md space-y-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Role name</Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                autoComplete="off"
                                placeholder="e.g., moderator"
                            />
                            <p className="text-muted-foreground text-xs">
                                Use lowercase letters, numbers, and underscores only.
                            </p>
                            <InputError message={errors.name} />
                        </div>

                        <Button type="submit" disabled={processing}>
                            Create role
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}
