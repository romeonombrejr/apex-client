import { Form, Head } from '@inertiajs/react';
import InvitationController from '@/actions/App/Http/Controllers/InvitationController';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    token: string;
    name: string;
};

/**
 * Confirmation step for magic links. Signing in only happens on the POST
 * behind the button, so prefetchers and link scanners that GET the URL have
 * no effect. Links are reusable until they expire or are revoked; each use
 * replaces the previous session the link created.
 */
export default function InvitationAccept({ token, name }: Props) {
    return (
        <>
            <Head title="Sign in" />

            <Form
                action={InvitationController.store.url({ token })}
                method="post"
            >
                {({ processing }) => (
                    <div className="grid gap-6">
                        <p className="text-sm text-muted-foreground">
                            Hi {name} — this secure link signs you straight into
                            your account.
                        </p>

                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            Continue to sign in
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

InvitationAccept.layout = {
    title: 'Welcome',
    description: "You've been given a secure sign-in link",
};
