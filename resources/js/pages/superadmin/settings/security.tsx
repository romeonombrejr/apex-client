import { Form, Head, router } from '@inertiajs/react';
import { KeyRound, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import PasskeyRegistration from '@/components/passkey-register';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import SettingsNav from './settings-nav';

type Passkey = {
    id: number;
    name: string;
    created_at_diff: string;
    last_used_at_diff: string | null;
};

type PageProps = {
    twoFactorEnabled: boolean;
    twoFactorPending: boolean;
    passkeys: Passkey[];
};

const passkeyRoutes = {
    options: '/superadmin/passkeys/register/options',
    submit: '/superadmin/passkeys',
};

export default function SuperAdminSecurity({
    twoFactorEnabled,
    twoFactorPending,
    passkeys,
}: PageProps) {
    return (
        <>
            <Head title="Security" />

            <h1 className="mb-6 text-2xl font-semibold">Account settings</h1>

            <SettingsNav />

            <div className="max-w-xl space-y-12">
                <PasswordSection />
                <TwoFactorSection
                    enabled={twoFactorEnabled}
                    pending={twoFactorPending}
                />
                <PasskeysSection passkeys={passkeys} />
            </div>
        </>
    );
}

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
        </section>
    );
}

function PasswordSection() {
    return (
        <Section
            title="Password"
            description="Use a long, unique password to keep your account secure."
        >
            <Form
                action="/superadmin/settings/password"
                method="put"
                resetOnSuccess={[
                    'current_password',
                    'password',
                    'password_confirmation',
                ]}
                className="space-y-4"
            >
                {({ processing, errors, recentlySuccessful }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="current_password">
                                Current password
                            </Label>
                            <PasswordInput
                                id="current_password"
                                name="current_password"
                                autoComplete="current-password"
                            />
                            <InputError message={errors.current_password} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">New password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
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
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Update password
                            </Button>
                            {recentlySuccessful && (
                                <span className="text-sm text-muted-foreground">
                                    Saved.
                                </span>
                            )}
                        </div>
                    </>
                )}
            </Form>
        </Section>
    );
}

function TwoFactorSection({
    enabled,
    pending,
}: {
    enabled: boolean;
    pending: boolean;
}) {
    const [qrSvg, setQrSvg] = useState<string | null>(null);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

    useEffect(() => {
        if (!pending) {
            return;
        }

        fetch('/superadmin/two-factor/qr-code', {
            headers: { Accept: 'application/json' },
        })
            .then((r) => r.json())
            .then((d) => setQrSvg(d.svg));

        fetch('/superadmin/two-factor/recovery-codes', {
            headers: { Accept: 'application/json' },
        })
            .then((r) => r.json())
            .then((d) => setRecoveryCodes(d));
    }, [pending]);

    if (enabled) {
        return (
            <Section
                title="Two-factor authentication"
                description="Two-factor authentication is enabled on your account."
            >
                <Button
                    variant="destructive"
                    onClick={() => router.delete('/superadmin/two-factor')}
                >
                    Disable two-factor
                </Button>
            </Section>
        );
    }

    if (pending) {
        return (
            <Section
                title="Finish setting up two-factor"
                description="Scan the QR code with your authenticator app, then enter a code to confirm. Save your recovery codes somewhere safe."
            >
                {qrSvg && (
                    <div
                        className="inline-block rounded-lg border bg-white p-3"
                        dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                )}

                {recoveryCodes.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-3 font-mono text-xs">
                        {recoveryCodes.map((code) => (
                            <span key={code}>{code}</span>
                        ))}
                    </div>
                )}

                <Form
                    action="/superadmin/two-factor/confirm"
                    method="post"
                    className="flex items-end gap-2"
                >
                    {({ processing, errors }) => (
                        <div className="space-y-1">
                            <Label htmlFor="code">Code</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="code"
                                    name="code"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    placeholder="123456"
                                    className="w-40"
                                />
                                <Button type="submit" disabled={processing}>
                                    Confirm
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                        router.delete('/superadmin/two-factor')
                                    }
                                >
                                    Cancel
                                </Button>
                            </div>
                            <InputError message={errors.code} />
                        </div>
                    )}
                </Form>
            </Section>
        );
    }

    return (
        <Section
            title="Two-factor authentication"
            description="Add an extra layer of security using an authenticator app."
        >
            <Button onClick={() => router.post('/superadmin/two-factor')}>
                Enable two-factor
            </Button>
        </Section>
    );
}

function PasskeysSection({ passkeys }: { passkeys: Passkey[] }) {
    return (
        <Section
            title="Passkeys"
            description="Sign in with your fingerprint, face, or a security key instead of a password."
        >
            <div className="space-y-2">
                {passkeys.map((passkey) => (
                    <div
                        key={passkey.id}
                        className="flex items-center justify-between rounded-lg border px-4 py-3"
                    >
                        <div className="flex items-center gap-3">
                            <KeyRound className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div className="text-sm font-medium">
                                    {passkey.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Added {passkey.created_at_diff}
                                    {passkey.last_used_at_diff
                                        ? ` · last used ${passkey.last_used_at_diff}`
                                        : ' · never used'}
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                router.delete(
                                    `/superadmin/passkeys/${passkey.id}`,
                                )
                            }
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
            </div>

            <PasskeyRegistration
                routes={passkeyRoutes}
                onSuccess={() => router.reload()}
            />
        </Section>
    );
}
