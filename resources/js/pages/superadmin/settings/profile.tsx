import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import SettingsNav from './settings-nav';

type PageProps = {
    superAdminProfile: {
        name: string;
        email: string;
    };
};

export default function SuperAdminProfile({ superAdminProfile }: PageProps) {
    return (
        <>
            <Head title="Profile" />

            <h1 className="mb-6 text-2xl font-semibold">Account settings</h1>

            <SettingsNav />

            <Form
                action="/superadmin/settings/profile"
                method="patch"
                className="max-w-md space-y-6"
            >
                {({ processing, errors, recentlySuccessful }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                defaultValue={superAdminProfile.name}
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
                                defaultValue={superAdminProfile.email}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Save
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
        </>
    );
}
