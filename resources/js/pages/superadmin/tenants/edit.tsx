import { Form, Head, Link, router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type PlanOption = {
    id: number;
    name: string;
    max_users: number | null;
    suites: string[];
};

type SuiteOption = {
    slug: string;
    name: string;
    description: string | null;
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
        enabled_suites: string[];
        domains: TenantDomain[];
    };
    plans: PlanOption[];
    availableSuites: SuiteOption[];
};

export default function TenantEdit({
    tenant,
    plans,
    availableSuites,
}: PageProps) {
    const [planId, setPlanId] = useState<number | null>(tenant.plan_id);

    // Only suites the selected plan unlocks can be enabled; suites the plan no
    // longer includes simply drop off (server validation enforces the same).
    const allowedSuites = plans.find((p) => p.id === planId)?.suites ?? [];
    const suiteChoices = availableSuites.filter((s) =>
        allowedSuites.includes(s.slug),
    );

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
                                    value={planId ?? ''}
                                    onChange={(e) =>
                                        setPlanId(Number(e.target.value))
                                    }
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

                            <div className="grid gap-2">
                                <Label>Enabled suites</Label>
                                {suiteChoices.length > 0 ? (
                                    <div className="space-y-2">
                                        {suiteChoices.map((suite) => (
                                            <div
                                                key={suite.slug}
                                                className="flex items-center space-x-3"
                                            >
                                                <Checkbox
                                                    id={`suite-${suite.slug}`}
                                                    name="enabled_suites[]"
                                                    value={suite.slug}
                                                    defaultChecked={tenant.enabled_suites.includes(
                                                        suite.slug,
                                                    )}
                                                />
                                                <Label
                                                    htmlFor={`suite-${suite.slug}`}
                                                    className="font-normal"
                                                >
                                                    {suite.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        This plan does not include any suites.
                                    </p>
                                )}
                                <InputError message={errors.enabled_suites} />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Save
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/superadmin/tenants">Back</Link>
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
