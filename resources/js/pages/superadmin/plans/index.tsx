import { Head, router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type SuiteOption = {
    slug: string;
    name: string;
    description: string | null;
};

type PlanRow = {
    id: number;
    name: string;
    slug: string;
    price: number;
    max_users: number | null;
    max_storage_mb: number | null;
    is_active: boolean;
    suites: string[];
    tenants_count: number;
};

type PageProps = {
    plans: PlanRow[];
    availableSuites: SuiteOption[];
};

type PlanForm = {
    id: number | null;
    name: string;
    slug: string;
    price: number;
    max_users: string;
    max_storage_mb: string;
    is_active: boolean;
    suites: string[];
};

const blank: PlanForm = {
    id: null,
    name: '',
    slug: '',
    price: 0,
    max_users: '',
    max_storage_mb: '',
    is_active: true,
    suites: [],
};

export default function PlansIndex({ plans, availableSuites }: PageProps) {
    const form = useForm<PlanForm>({ ...blank });

    function toggleSuite(slug: string, checked: boolean) {
        form.setData(
            'suites',
            checked
                ? [...form.data.suites, slug]
                : form.data.suites.filter((s) => s !== slug),
        );
    }

    function submit(e: FormEvent) {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        };

        if (form.data.id) {
            form.put(`/superadmin/plans/${form.data.id}`, options);
        } else {
            form.post('/superadmin/plans', options);
        }
    }

    function editPlan(plan: PlanRow) {
        form.setData({
            id: plan.id,
            name: plan.name,
            slug: plan.slug,
            price: plan.price,
            max_users: plan.max_users?.toString() ?? '',
            max_storage_mb: plan.max_storage_mb?.toString() ?? '',
            is_active: plan.is_active,
            suites: plan.suites,
        });
    }

    function destroy(plan: PlanRow) {
        if (plan.tenants_count > 0) {
            alert('Cannot delete a plan that still has tenants.');

            return;
        }

        if (!confirm(`Delete the "${plan.name}" plan?`)) {
            return;
        }

        router.delete(`/superadmin/plans/${plan.id}`, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Plans" />

            <h1 className="mb-6 text-2xl font-semibold">Plans</h1>

            <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Max users</TableHead>
                            <TableHead>Storage</TableHead>
                            <TableHead>Tenants</TableHead>
                            <TableHead />
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plans.map((plan) => (
                            <TableRow
                                key={plan.id}
                                className="cursor-pointer"
                                onClick={() => editPlan(plan)}
                            >
                                <TableCell className="font-medium">
                                    {plan.name}
                                    {!plan.is_active && (
                                        <Badge
                                            variant="outline"
                                            className="ml-2"
                                        >
                                            inactive
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>${plan.price}</TableCell>
                                <TableCell>{plan.max_users ?? '∞'}</TableCell>
                                <TableCell>
                                    {plan.max_storage_mb
                                        ? `${plan.max_storage_mb} MB`
                                        : '∞'}
                                </TableCell>
                                <TableCell>{plan.tenants_count}</TableCell>
                                <TableCell />
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            destroy(plan);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <form
                    onSubmit={submit}
                    className="h-fit space-y-4 rounded-lg border p-5"
                >
                    <h2 className="font-semibold">
                        {form.data.id ? 'Edit plan' : 'New plan'}
                    </h2>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            value={form.data.slug}
                            onChange={(e) =>
                                form.setData('slug', e.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.slug} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="price">Price (USD/mo)</Label>
                        <Input
                            id="price"
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.data.price}
                            onChange={(e) =>
                                form.setData('price', Number(e.target.value))
                            }
                        />
                        <InputError message={form.errors.price} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="max_users">
                            Max users (blank = unlimited)
                        </Label>
                        <Input
                            id="max_users"
                            type="number"
                            min={1}
                            value={form.data.max_users}
                            onChange={(e) =>
                                form.setData('max_users', e.target.value)
                            }
                        />
                        <InputError message={form.errors.max_users} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="max_storage_mb">
                            Max storage MB (blank = unlimited)
                        </Label>
                        <Input
                            id="max_storage_mb"
                            type="number"
                            min={1}
                            value={form.data.max_storage_mb}
                            onChange={(e) =>
                                form.setData('max_storage_mb', e.target.value)
                            }
                        />
                        <InputError message={form.errors.max_storage_mb} />
                    </div>

                    {availableSuites.length > 0 && (
                        <div className="grid gap-2">
                            <Label>Suites</Label>
                            <div className="space-y-2">
                                {availableSuites.map((suite) => (
                                    <div
                                        key={suite.slug}
                                        className="flex items-center space-x-3"
                                    >
                                        <Checkbox
                                            id={`suite-${suite.slug}`}
                                            checked={form.data.suites.includes(
                                                suite.slug,
                                            )}
                                            onCheckedChange={(checked) =>
                                                toggleSuite(
                                                    suite.slug,
                                                    checked === true,
                                                )
                                            }
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
                            <InputError message={form.errors.suites} />
                        </div>
                    )}

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="is_active"
                            checked={form.data.is_active}
                            onCheckedChange={(checked) =>
                                form.setData('is_active', checked === true)
                            }
                        />
                        <Label htmlFor="is_active">Active</Label>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={form.processing}>
                            {form.data.id ? 'Save' : 'Create'}
                        </Button>
                        {form.data.id && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => form.reset()}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
}
