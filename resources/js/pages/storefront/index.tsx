import { Head, router } from '@inertiajs/react';
import { ShoppingCart, Store } from 'lucide-react';
import { useState } from 'react';
import { appendAnswers } from '@/components/storefront/answers-form-data';
import { DynamicForm } from '@/components/storefront/dynamic-form';
import type { DynamicFormValues } from '@/components/storefront/dynamic-form';
import { OrderReferencesPicker } from '@/components/storefront/order-references-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { store as cartStore } from '@/routes/storefront/cart';
import type { CatalogService, OrderRef } from '@/types';

function priceLabel(service: CatalogService): string {
    const base = `${service.price} credits`;

    return service.type === 'subscription'
        ? `${base} / ${service.billing_interval}`
        : base;
}

type PageProps = {
    services: CatalogService[];
    myOrders: OrderRef[];
};

export default function StorefrontCatalog({ services, myOrders }: PageProps) {
    const [active, setActive] = useState<CatalogService | null>(null);
    const [answers, setAnswers] = useState<DynamicFormValues>({});
    const [references, setReferences] = useState<number[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [category, setCategory] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    // Distinct categories present in the catalog, and whether both offering
    // types exist — the filter bar only appears when there's something to sort by.
    const categories = Array.from(
        new Map(
            services
                .filter((s) => s.category)
                .map((s) => [s.category!.id, s.category!]),
        ).values(),
    );
    const hasBothTypes =
        services.some((s) => s.type === 'one_time') &&
        services.some((s) => s.type === 'subscription');
    const showFilters = categories.length > 0 || hasBothTypes;

    const visibleServices = services.filter(
        (s) =>
            (category === 'all' || s.category?.id === Number(category)) &&
            (typeFilter === 'all' || s.type === typeFilter),
    );

    function open(service: CatalogService) {
        setActive(service);
        setAnswers({});
        setReferences([]);
        setQuantity(1);
    }

    function addToCart() {
        if (!active) {
            return;
        }

        const fd = new FormData();
        fd.append('service_id', String(active.id));
        fd.append('quantity', String(quantity));
        appendAnswers(fd, answers);
        references.forEach((id) =>
            fd.append('referenced_order_ids[]', String(id)),
        );

        router.post(cartStore().url, fd, {
            forceFormData: true,
            onStart: () => setAdding(true),
            onFinish: () => setAdding(false),
            onSuccess: () => setActive(null),
        });
    }

    return (
        <>
            <Head title="Storefront" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Storefront</h1>
                <p className="text-sm text-muted-foreground">
                    Browse services and add them to your cart.
                </p>
            </div>

            {showFilters && (
                <div className="mb-4 flex flex-wrap gap-3">
                    {categories.length > 0 && (
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All categories
                                </SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    {hasBothTypes && (
                        <Select
                            value={typeFilter}
                            onValueChange={setTypeFilter}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="one_time">
                                    Services
                                </SelectItem>
                                <SelectItem value="subscription">
                                    Subscriptions
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
            )}

            {services.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-20 text-center">
                    <Store className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        No services are available yet.
                    </p>
                </div>
            ) : visibleServices.length === 0 ? (
                <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
                    No services match your filters.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleServices.map((service) => (
                        <Card
                            key={service.id}
                            className={`flex flex-col overflow-hidden ${
                                service.image_url ? 'pt-0' : ''
                            }`}
                        >
                            {service.image_url && (
                                <img
                                    src={service.image_url}
                                    alt={service.name}
                                    className="h-40 w-full object-cover"
                                />
                            )}
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between gap-2">
                                    {service.name}
                                    {service.type === 'subscription' && (
                                        <Badge variant="secondary">
                                            Subscription
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="line-clamp-3 text-sm text-muted-foreground">
                                    {service.description}
                                </p>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    {priceLabel(service)}
                                </span>
                                <Button size="sm" onClick={() => open(service)}>
                                    View
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog
                open={active !== null}
                onOpenChange={(o) => !o && setActive(null)}
            >
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                    {active && (
                        <>
                            {active.image_url && (
                                <img
                                    src={active.image_url}
                                    alt={active.name}
                                    className="-mx-6 -mt-6 mb-2 max-h-96 w-[calc(100%+3rem)] max-w-none rounded-t-lg object-cover"
                                />
                            )}

                            <DialogHeader>
                                <DialogTitle>{active.name}</DialogTitle>
                                <DialogDescription>
                                    {priceLabel(active)}
                                </DialogDescription>
                            </DialogHeader>

                            {active.description && (
                                <p className="text-sm text-muted-foreground">
                                    {active.description}
                                </p>
                            )}

                            {active.form && (
                                <DynamicForm
                                    fields={active.form.fields}
                                    values={answers}
                                    onChange={(key, value) =>
                                        setAnswers((a) => ({
                                            ...a,
                                            [key]: value,
                                        }))
                                    }
                                    idPrefix={`svc-${active.id}`}
                                />
                            )}

                            <OrderReferencesPicker
                                orders={myOrders}
                                selected={references}
                                onChange={setReferences}
                            />

                            <div className="grid w-32 gap-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min={1}
                                    max={99}
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(
                                            Math.max(
                                                1,
                                                Number(e.target.value) || 1,
                                            ),
                                        )
                                    }
                                />
                            </div>

                            <DialogFooter>
                                <Button onClick={addToCart} disabled={adding}>
                                    <ShoppingCart className="mr-1 h-4 w-4" />
                                    Add to cart
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
