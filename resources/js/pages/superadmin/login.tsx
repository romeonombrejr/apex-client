import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

const passkeyRoutes = {
    options: {
        url: '/superadmin/passkeys/login/options',
        method: 'get' as const,
    },
    submit: { url: '/superadmin/passkeys/login', method: 'post' as const },
};

export default function SuperAdminLogin() {
    return (
        <>
            <Head title="Super Admin log in" />

            <PasskeyVerify
                routes={passkeyRoutes}
                separator="Or continue with email"
            />

            <Form
                action="/superadmin/login"
                method="post"
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                autoComplete="email"
                                placeholder="super@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                autoComplete="current-password"
                                placeholder="Password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center space-x-3">
                            <Checkbox id="remember" name="remember" />
                            <Label htmlFor="remember">Remember me</Label>
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            Log in
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

SuperAdminLogin.layout = {
    title: 'Super Admin',
    description: 'Sign in to manage tenants',
};
