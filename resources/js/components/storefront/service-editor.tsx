import { Head, Link, useForm } from '@inertiajs/react';
import ServiceController from '@/actions/App/Http/Controllers/Admin/Storefront/ServiceController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { index as servicesIndex } from '@/routes/admin/storefront/services';
import type { BillingInterval, ServiceType } from '@/types';

type EditableService = {
    id: number;
    name: string;
    description: string | null;
    type: ServiceType;
    billing_interval: BillingInterval | null;
    price: number;
    form_id: number | null;
    service_category_id: number | null;
    is_active: boolean;
    position: number;
    image_url: string | null;
};

type Option = { id: number; name: string };

type Props = {
    service?: EditableService;
    forms: Option[];
    categories: Option[];
    types: ServiceType[];
    intervals: BillingInterval[];
};

const TYPE_LABELS: Record<ServiceType, string> = {
    one_time: 'One-time',
    subscription: 'Subscription',
};

export default function ServiceEditor({
    service,
    forms,
    categories,
    types,
    intervals,
}: Props) {
    const form = useForm({
        name: service?.name ?? '',
        description: service?.description ?? '',
        type: service?.type ?? ('one_time' as ServiceType),
        billing_interval:
            service?.billing_interval ?? ('monthly' as BillingInterval),
        price: service?.price?.toString() ?? '0',
        form_id: service?.form_id ? String(service.form_id) : 'none',
        service_category_id: service?.service_category_id
            ? String(service.service_category_id)
            : 'none',
        image: null as File | null,
        is_active: service?.is_active ?? true,
        position: service?.position?.toString() ?? '0',
    });

    function submit() {
        form.transform((data) => ({
            ...data,
            form_id: data.form_id === 'none' ? '' : data.form_id,
            service_category_id:
                data.service_category_id === 'none'
                    ? ''
                    : data.service_category_id,
            billing_interval:
                data.type === 'subscription' ? data.billing_interval : '',
            is_active: data.is_active ? '1' : '0',
            ...(service ? { _method: 'put' } : {}),
        }));

        const url = service
            ? ServiceController.update.url(service.id)
            : ServiceController.store.url();

        form.post(url, { forceFormData: true });
    }

    return (
        <>
            <Head title={service ? `Edit ${service.name}` : 'New service'} />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">
                    {service ? 'Edit service' : 'New service'}
                </h1>
                <p className="text-sm text-muted-foreground">
                    A catalog offering clients can order.
                </p>
            </div>

            <div className="max-w-2xl space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        required
                    />
                    <InputError message={form.errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={form.data.description}
                        onChange={(e) =>
                            form.setData('description', e.target.value)
                        }
                    />
                    <InputError message={form.errors.description} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label>Type</Label>
                        <Select
                            value={form.data.type}
                            onValueChange={(v) =>
                                form.setData('type', v as ServiceType)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {types.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {TYPE_LABELS[type]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {form.data.type === 'subscription' && (
                        <div className="grid gap-2">
                            <Label>Billing interval</Label>
                            <Select
                                value={form.data.billing_interval}
                                onValueChange={(v) =>
                                    form.setData(
                                        'billing_interval',
                                        v as BillingInterval,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {intervals.map((interval) => (
                                        <SelectItem
                                            key={interval}
                                            value={interval}
                                        >
                                            {interval}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError
                                message={form.errors.billing_interval}
                            />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="price">Price (credits)</Label>
                        <Input
                            id="price"
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.data.price}
                            onChange={(e) =>
                                form.setData('price', e.target.value)
                            }
                        />
                        <InputError message={form.errors.price} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Intake form</Label>
                        <Select
                            value={form.data.form_id}
                            onValueChange={(v) => form.setData('form_id', v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No form</SelectItem>
                                {forms.map((f) => (
                                    <SelectItem key={f.id} value={String(f.id)}>
                                        {f.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.form_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Category</Label>
                        <Select
                            value={form.data.service_category_id}
                            onValueChange={(v) =>
                                form.setData('service_category_id', v)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    No category
                                </SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.service_category_id} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="image">Image</Label>
                    {service?.image_url && (
                        <img
                            src={service.image_url}
                            alt={service.name}
                            className="h-24 w-24 rounded-md object-cover"
                        />
                    )}
                    <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            form.setData('image', e.target.files?.[0] ?? null)
                        }
                    />
                    <InputError message={form.errors.image} />
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="is_active"
                        checked={form.data.is_active}
                        onCheckedChange={(checked) =>
                            form.setData('is_active', checked === true)
                        }
                    />
                    <Label htmlFor="is_active" className="font-normal">
                        Active (visible in the catalog)
                    </Label>
                </div>

                <div className="flex gap-3">
                    <Button onClick={submit} disabled={form.processing}>
                        {form.processing && <Spinner />}
                        {service ? 'Save changes' : 'Create service'}
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={servicesIndex().url}>Cancel</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
