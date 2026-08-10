import { Form, Head } from '@inertiajs/react';
import OnboardingController from '@/actions/App/Http/Controllers/OnboardingController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { suggestCompanyFromEmail } from '@/lib/company';

type Props = {
    name: string;
    email: string;
    company: string | null;
};

export default function OnboardingPassword({ name, email, company }: Props) {
    return (
        <>
            <Head title="Set your password" />

            <Form
                action={OnboardingController.update.url()}
                method="post"
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <p className="text-sm text-muted-foreground">
                            Welcome, {name}. Choose a password to finish setting
                            up your account.
                        </p>

                        <div className="grid gap-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                name="company"
                                defaultValue={
                                    company ??
                                    suggestCompanyFromEmail(email) ??
                                    ''
                                }
                                required
                                autoComplete="organization"
                                placeholder="Your company"
                            />
                            <InputError message={errors.company} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                className="mt-1 block w-full"
                                autoFocus
                                required
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
                                autoComplete="new-password"
                                className="mt-1 block w-full"
                                required
                                placeholder="Confirm password"
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            Save password
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

OnboardingPassword.layout = {
    title: 'Set your password',
    description: 'Create a password to access your account',
};
