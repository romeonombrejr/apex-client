import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function SuperAdminTwoFactorChallenge() {
    const [useRecovery, setUseRecovery] = useState(false);

    return (
        <>
            <Head title="Two-factor challenge" />

            <Form
                action="/superadmin/two-factor-challenge"
                method="post"
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        {useRecovery ? (
                            <div className="grid gap-2">
                                <Label htmlFor="recovery_code">
                                    Recovery code
                                </Label>
                                <Input
                                    id="recovery_code"
                                    name="recovery_code"
                                    autoComplete="one-time-code"
                                    autoFocus
                                />
                                <InputError message={errors.recovery_code} />
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <Label htmlFor="code">Authentication code</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    placeholder="123456"
                                    autoFocus
                                />
                                <InputError message={errors.code} />
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            Continue
                        </Button>

                        <button
                            type="button"
                            className="text-center text-sm text-muted-foreground underline"
                            onClick={() => setUseRecovery((v) => !v)}
                        >
                            {useRecovery
                                ? 'Use an authentication code'
                                : 'Use a recovery code'}
                        </button>
                    </>
                )}
            </Form>
        </>
    );
}

SuperAdminTwoFactorChallenge.layout = {
    title: 'Two-factor authentication',
    description: 'Confirm access to your account by entering the code from your authenticator app',
};
