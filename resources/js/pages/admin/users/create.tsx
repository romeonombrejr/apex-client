import { Form, Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Dices } from 'lucide-react';
import { useState } from 'react';
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
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');

    // The initial password is a placeholder credential — the admin can hand
    // out a password-reset link any time — so a strong random one is the
    // sensible default.
    function generatePassword() {
        const charset =
            'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
        const bytes = new Uint32Array(20);
        crypto.getRandomValues(bytes);
        const generated = Array.from(
            bytes,
            (b) => charset[b % charset.length],
        ).join('');

        setPassword(generated);
        setConfirmation(generated);
    }

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
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                name="company"
                                required
                                autoComplete="organization"
                                placeholder="Their company"
                            />
                            <InputError message={errors.company} />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
                                    onClick={generatePassword}
                                >
                                    <Dices className="h-3.5 w-3.5" />
                                    Generate
                                </Button>
                            </div>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                autoComplete="new-password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                The exact value doesn't matter much — you can
                                always send them a password reset link later.
                            </p>
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
                                value={confirmation}
                                onChange={(e) =>
                                    setConfirmation(e.target.value)
                                }
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
