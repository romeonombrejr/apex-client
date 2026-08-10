import { Form, Head, router, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { useRef, useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
    canEditCompany = true,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    canEditCompany?: boolean;
}) {
    const { auth } = usePage<PageProps>().props;
    const getInitials = useInitials();
    const avatarInput = useRef<HTMLInputElement>(null);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [avatarBusy, setAvatarBusy] = useState(false);

    function uploadAvatar(file: File) {
        const fd = new FormData();
        fd.append('avatar', file);

        router.post(ProfileController.updateAvatar.url(), fd, {
            forceFormData: true,
            preserveScroll: true,
            onStart: () => {
                setAvatarError(null);
                setAvatarBusy(true);
            },
            onError: (errors) => setAvatarError(errors.avatar ?? null),
            onFinish: () => {
                setAvatarBusy(false);

                if (avatarInput.current) {
                    avatarInput.current.value = '';
                }
            },
        });
    }

    function removeAvatar() {
        router.delete(ProfileController.destroyAvatar.url(), {
            preserveScroll: true,
            onStart: () => setAvatarError(null),
        });
    }

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your photo, name and email address"
                />

                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 overflow-hidden rounded-full">
                        <AvatarImage
                            src={auth.user.avatar ?? undefined}
                            alt={auth.user.name}
                        />
                        <AvatarFallback className="rounded-full bg-neutral-200 text-lg text-black dark:bg-neutral-700 dark:text-white">
                            {getInitials(auth.user.name)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1.5">
                        <div className="flex gap-2">
                            <input
                                ref={avatarInput}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];

                                    if (file) {
                                        uploadAvatar(file);
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={avatarBusy}
                                onClick={() => avatarInput.current?.click()}
                            >
                                {avatarBusy
                                    ? 'Uploading…'
                                    : auth.user.avatar
                                      ? 'Change photo'
                                      : 'Upload photo'}
                            </Button>
                            {auth.user.avatar && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={removeAvatar}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            JPG, PNG, WebP or GIF — up to 2 MB.
                        </p>
                        <InputError message={avatarError ?? undefined} />
                    </div>
                </div>

                <Form
                    action={ProfileController.update.url()}
                    method="patch"
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="company">Company</Label>

                                <Input
                                    id="company"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.company ?? ''}
                                    name="company"
                                    autoComplete="organization"
                                    placeholder="Your company"
                                    disabled={!canEditCompany}
                                    readOnly={!canEditCompany}
                                />

                                {canEditCompany ? (
                                    <InputError
                                        className="mt-2"
                                        message={errors.company}
                                    />
                                ) : (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Your company is set when your account is
                                        created. Contact your team if it needs
                                        to change.
                                    </p>
                                )}
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to re-send the
                                                verification email.
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been
                                                sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    Save
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
