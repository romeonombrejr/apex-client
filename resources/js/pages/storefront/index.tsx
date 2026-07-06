import { Head, router } from '@inertiajs/react';
import { ShoppingCart, Store } from 'lucide-react';
import { useState } from 'react';
import { appendAnswers } from '@/components/storefront/answers-form-data';
import { DynamicForm } from '@/components/storefront/dynamic-form';
import type { DynamicFormValues } from '@/components/storefront/dynamic-form';
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
import { store as cartStore } from '@/routes/storefront/cart';
import type { CatalogService } from '@/types';

function priceLabel(service: CatalogService): string {
    const base = `${service.price} credits`;

    return service.type === 'subscription'
        ? `${base} / ${service.billing_interval}`
        : base;
}

export default function StorefrontCatalog({
    services,
}: {
    services: CatalogService[];
}) {
    const [active, setActive] = useState<CatalogService | null>(null);
    const [answers, setAnswers] = useState<DynamicFormValues>({});
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    function open(service: CatalogService) {
        setActive(service);
        setAnswers({});
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

            {services.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-20 text-center">
                    <Store className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        No services are available yet.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((service) => (
                        <Card key={service.id} className="flex flex-col">
                            {service.image_url && (
                                <img
                                    src={service.image_url}
                                    alt={service.name}
                                    className="h-40 w-full rounded-t-xl object-cover"
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
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                    {active && (
                        <>
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
