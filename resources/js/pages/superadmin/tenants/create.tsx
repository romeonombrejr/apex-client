import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type PlanOption = {
    id: number;
    name: string;
    max_users: number | null;
};

type PageProps = {
    plans: PlanOption[];
};

export default function TenantCreate({ plans }: PageProps) {
    return (
        <>
            <Head title="New tenant" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">New tenant</h1>
                <p className="text-sm text-muted-foreground">
                    Provisions a dedicated database, migrates and seeds it.
                </p>
            </div>

            <Form
                action="/superadmin/tenants"
                method="post"
                className="max-w-md space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Tenant name</Label>
                            <Input id="name" name="name" required autoFocus />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="domain">Domain</Label>
                            <Input
                                id="domain"
                                name="domain"
                                required
                                placeholder="acme.example.com"
                            />
                            <p className="text-xs text-muted-foreground">
                                The custom domain this tenant will be reached
                                on.
                            </p>
                            <InputError message={errors.domain} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="plan_id">Plan</Label>
                            <select
                                id="plan_id"
                                name="plan_id"
                                required
                                defaultValue=""
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                            >
                                <option value="" disabled>
                                    Select a plan…
                                </option>
                                {plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name}
                                        {plan.max_users
                                            ? ` (up to ${plan.max_users} users)`
                                            : ' (unlimited users)'}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.plan_id} />
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Create tenant
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/superadmin/tenants">Cancel</Link>
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
