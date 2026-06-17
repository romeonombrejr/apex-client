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
import type { Role } from '@/types';

type PageProps = {
    roles: Role[];
};

export default function CreateUser({ roles }: PageProps) {
    return (
        <>
            <Head title="New user" />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">New user</h2>
                    <p className="text-sm text-muted-foreground">
                        Create a new account and assign a role.
                    </p>
                </div>

                <Button variant="ghost" size="sm" asChild>
                    <Link href={index().url}>Cancel</Link>
                </Button>
            </div>

            <Form
                action={UserController.store.url()}
                method="post"
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
                                placeholder="Full name"
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
                                placeholder="email@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                autoComplete="new-password"
                                placeholder="Password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                Confirm password
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                required
                                autoComplete="new-password"
                                placeholder="Confirm password"
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select name="role" required>
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
                            Create user
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}
