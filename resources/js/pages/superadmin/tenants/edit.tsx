import { Form, Head, Link, router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
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

type TenantDomain = {
    id: number;
    domain: string;
};

type PageProps = {
    tenant: {
        id: string;
        name: string | null;
        status: string;
        plan_id: number | null;
        domains: TenantDomain[];
    };
    plans: PlanOption[];
};

export default function TenantEdit({ tenant, plans }: PageProps) {
    function removeDomain(domainId: number) {
        router.delete(`/superadmin/tenants/${tenant.id}/domains/${domainId}`);
    }

    return (
        <>
            <Head title={`Edit ${tenant.name ?? 'tenant'}`} />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">
                    {tenant.name ?? tenant.id}
                </h1>
                <p className="text-sm text-muted-foreground">
                    Tenant ID: {tenant.id}
                </p>
            </div>

            <div className="grid max-w-3xl gap-10 lg:grid-cols-2">
                <Form
                    action={`/superadmin/tenants/${tenant.id}`}
                    method="put"
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Tenant name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    defaultValue={tenant.name ?? ''}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="plan_id">Plan</Label>
                                <select
                                    id="plan_id"
                                    name="plan_id"
                                    required
                                    defaultValue={tenant.plan_id ?? ''}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                                >
                                    {plans.map((plan) => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.plan_id} />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Save
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/superadmin/tenants">
                                        Back
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-y-4">
                    <h2 className="text-sm font-semibold">Domains</h2>

                    <ul className="space-y-2">
                        {tenant.domains.map((domain) => (
                            <li
                                key={domain.id}
                                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                            >
                                <span>{domain.domain}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeDomain(domain.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </li>
                        ))}
                    </ul>

                    <Form
                        action={`/superadmin/tenants/${tenant.id}/domains`}
                        method="post"
                        resetOnSuccess
                        className="flex items-start gap-2"
                    >
                        {({ processing, errors }) => (
                            <div className="flex-1 space-y-1">
                                <div className="flex gap-2">
                                    <Input
                                        name="domain"
                                        placeholder="another.example.com"
                                    />
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        disabled={processing}
                                    >
                                        Add
                                    </Button>
                                </div>
                                <InputError message={errors.domain} />
                            </div>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}
