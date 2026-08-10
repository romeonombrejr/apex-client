import { Form, Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index } from '@/routes/admin/users';
import type { Role, UserFormData } from '@/types';

type PageProps = {
    user: UserFormData;
    roles: Role[];
};

export default function EditUser({ user, roles }: PageProps) {
    return (
        <>
            <Head title={`Edit ${user.name}`} />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Edit user</h2>
                    <p className="text-sm text-muted-foreground">
                        Update account details and role for {user.name}.
                    </p>
                </div>

                <Button variant="ghost" size="sm" asChild>
                    <Link href={index().url}>Cancel</Link>
                </Button>
            </div>

            <Form
                action={UserController.update.url(user.id)}
                method="put"
                options={{ preserveScroll: true }}
                className="max-w-md space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                autoComplete="name"
                                defaultValue={user.name}
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                defaultValue={user.email}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="company">
                                Company{' '}
                                <span className="font-normal text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                id="company"
                                name="company"
                                autoComplete="organization"
                                defaultValue={user.company ?? ''}
                            />
                            <InputError message={errors.company} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                New password{' '}
                                <span className="font-normal text-muted-foreground">
                                    (leave blank to keep current)
                                </span>
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                placeholder="New password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                Confirm new password
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                placeholder="Confirm new password"
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                name="role"
                                defaultValue={user.role ?? undefined}
                                required
                            >
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role.charAt(0).toUpperCase() +
                                                role.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.role} />
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
