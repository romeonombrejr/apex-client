import { Head, router } from '@inertiajs/react';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { appendAnswers } from '@/components/storefront/answers-form-data';
import { DynamicForm } from '@/components/storefront/dynamic-form';
import type { DynamicFormValues } from '@/components/storefront/dynamic-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { destroy, update } from '@/routes/storefront/cart';
import { store as checkoutStore } from '@/routes/storefront/checkout';
import type { CartItemRow } from '@/types';

type PageProps = {
    items: CartItemRow[];
    creditBalance: number;
    selectedTotal: number;
};

export default function Cart({
    items,
    creditBalance,
    selectedTotal,
}: PageProps) {
    const [editing, setEditing] = useState<CartItemRow | null>(null);
    const [answers, setAnswers] = useState<DynamicFormValues>({});

    const selectedCount = items.filter((i) => i.selected).length;
    const hasIncompleteSelected = items.some((i) => i.selected && !i.complete);
    const affordable = creditBalance >= selectedTotal;
    const canCheckout =
        selectedCount > 0 && !hasIncompleteSelected && affordable;

    function checkout() {
        router.post(checkoutStore().url, {});
    }

    function patch(
        item: CartItemRow,
        data: Record<string, string | number | boolean>,
    ) {
        router.patch(update({ cartItem: item.id }).url, data, {
            preserveScroll: true,
        });
    }

    function setQuantity(item: CartItemRow, quantity: number) {
        if (quantity < 1 || quantity > 99) {
            return;
        }

        patch(item, { quantity });
    }

    function remove(item: CartItemRow) {
        router.delete(destroy({ cartItem: item.id }).url, {
            preserveScroll: true,
        });
    }

    function openEditor(item: CartItemRow) {
        setEditing(item);
        setAnswers({ ...item.answers });
    }

    function saveAnswers() {
        if (!editing) {
            return;
        }

        const fd = new FormData();
        fd.append('_method', 'patch');
        appendAnswers(fd, answers);

        router.post(update({ cartItem: editing.id }).url, fd, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    }

    return (
        <>
            <Head title="Cart" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Cart</h1>
                <p className="text-sm text-muted-foreground">
                    Review your items before checkout.
                </p>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-20 text-center">
                    <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        Your cart is empty.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-start gap-4 rounded-lg border p-4"
                            >
                                <Checkbox
                                    checked={item.selected}
                                    onCheckedChange={(checked) =>
                                        patch(item, {
                                            selected: checked === true,
                                        })
                                    }
                                    className="mt-1"
                                />

                                {item.service.image_url && (
                                    <img
                                        src={item.service.image_url}
                                        alt={item.service.name}
                                        className="h-14 w-14 rounded object-cover"
                                    />
                                )}

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                            {item.service.name}
                                        </span>
                                        {!item.complete && (
                                            <Badge variant="destructive">
                                                Incomplete
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {item.line_total} credits
                                    </p>

                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() =>
                                                    setQuantity(
                                                        item,
                                                        item.quantity - 1,
                                                    )
                                                }
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center text-sm">
                                                {item.quantity}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() =>
                                                    setQuantity(
                                                        item,
                                                        item.quantity + 1,
                                                    )
                                                }
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        {item.service.form && (
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="h-auto p-0"
                                                onClick={() => openEditor(item)}
                                            >
                                                {item.complete
                                                    ? 'Edit details'
                                                    : 'Complete details'}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(item)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="h-fit space-y-4 rounded-lg border p-5">
                        <h2 className="font-semibold">Summary</h2>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Your balance
                            </span>
                            <span className="font-medium">
                                {creditBalance.toFixed(2)} credits
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Selected total
                            </span>
                            <span className="font-medium">
                                {selectedTotal.toFixed(2)} credits
                            </span>
                        </div>
                        {hasIncompleteSelected && (
                            <p className="text-xs text-destructive">
                                Finish the required fields on incomplete items
                                before checkout.
                            </p>
                        )}
                        {!affordable && selectedCount > 0 && (
                            <p className="text-xs text-destructive">
                                Not enough credits — ask an admin to top up your
                                balance.
                            </p>
                        )}
                        <Button
                            className="w-full"
                            disabled={!canCheckout}
                            onClick={checkout}
                        >
                            Check out
                        </Button>
                    </div>
                </div>
            )}

            <Dialog
                open={editing !== null}
                onOpenChange={(o) => !o && setEditing(null)}
            >
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                    {editing?.service.form && (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {editing.service.name}
                                </DialogTitle>
                            </DialogHeader>

                            <DynamicForm
                                fields={editing.service.form.fields}
                                values={answers}
                                onChange={(key, value) =>
                                    setAnswers((a) => ({ ...a, [key]: value }))
                                }
                                idPrefix={`cart-${editing.id}`}
                            />

                            <DialogFooter>
                                <Button onClick={saveAnswers}>
                                    Save details
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
