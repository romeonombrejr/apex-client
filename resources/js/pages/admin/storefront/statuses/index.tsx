import { Head, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/storefront/status-badge';
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
import {
    destroy,
    reorder,
    store,
    update,
} from '@/routes/admin/storefront/statuses';
import type { OrderStatusRow } from '@/types';

type StatusForm = {
    id: number | null;
    name: string;
    color: string;
    is_default: boolean;
    is_completed: boolean;
};

const blank: StatusForm = {
    id: null,
    name: '',
    color: '#64748b',
    is_default: false,
    is_completed: false,
};

export default function StatusesIndex({
    statuses,
}: {
    statuses: OrderStatusRow[];
}) {
    const [form, setForm] = useState<StatusForm>({ ...blank });
    const [ordered, setOrdered] = useState<OrderStatusRow[]>(statuses);

    function move(index: number, direction: -1 | 1) {
        const target = index + direction;

        if (target < 0 || target >= ordered.length) {
            return;
        }

        const next = [...ordered];
        [next[index], next[target]] = [next[target], next[index]];
        setOrdered(next);
        router.post(
            reorder().url,
            { ids: next.map((s) => s.id) },
            { preserveScroll: true, preserveState: true },
        );
    }

    function submit() {
        const opts = {
            preserveScroll: true,
            onSuccess: () => setForm({ ...blank }),
        };

        if (form.id) {
            router.put(update({ status: form.id }).url, form, opts);
        } else {
            router.post(store().url, form, opts);
        }
    }

    function remove(status: OrderStatusRow) {
        if (status.orders_count > 0) {
            alert('Cannot delete a status that is in use.');

            return;
        }

        if (!confirm(`Delete "${status.name}"?`)) {
            return;
        }

        router.delete(destroy({ status: status.id }).url, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Order statuses" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Order statuses</h1>
                <p className="text-sm text-muted-foreground">
                    The stages an order moves through.
                </p>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16" />
                            <TableHead>Status</TableHead>
                            <TableHead>Flags</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ordered.map((status, index) => (
                            <TableRow
                                key={status.id}
                                className="cursor-pointer"
                                onClick={() =>
                                    setForm({
                                        id: status.id,
                                        name: status.name,
                                        color: status.color,
                                        is_default: status.is_default,
                                        is_completed: status.is_completed,
                                    })
                                }
                            >
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <div className="flex flex-col">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-6"
                                            disabled={index === 0}
                                            onClick={() => move(index, -1)}
                                        >
                                            <ArrowUp className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-6"
                                            disabled={
                                                index === ordered.length - 1
                                            }
                                            onClick={() => move(index, 1)}
                                        >
                                            <ArrowDown className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge
                                        status={{
                                            name: status.name,
                                            color: status.color,
                                            is_completed: status.is_completed,
                                        }}
                                    />
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {status.is_default && 'Default '}
                                    {status.is_completed && 'Completed'}
                                </TableCell>
                                <TableCell>{status.orders_count}</TableCell>
                                <TableCell>
                                    {!status.is_protected && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                remove(status);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="h-fit space-y-4 rounded-lg border p-5">
                    <h2 className="font-semibold">
                        {form.id ? 'Edit status' : 'New status'}
                    </h2>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={form.name}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, name: e.target.value }))
                            }
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="color">Color</Label>
                        <input
                            id="color"
                            type="color"
                            className="h-9 w-16 rounded border"
                            value={form.color}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    color: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_default"
                            checked={form.is_default}
                            onCheckedChange={(c) =>
                                setForm((f) => ({
                                    ...f,
                                    is_default: c === true,
                                }))
                            }
                        />
                        <Label htmlFor="is_default" className="font-normal">
                            Default for new orders
                        </Label>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_completed"
                            checked={form.is_completed}
                            onCheckedChange={(c) =>
                                setForm((f) => ({
                                    ...f,
                                    is_completed: c === true,
                                }))
                            }
                        />
                        <Label htmlFor="is_completed" className="font-normal">
                            Marks the order complete
                        </Label>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={submit}>
                            {form.id ? 'Save' : 'Create'}
                        </Button>
                        {form.id && (
                            <Button
                                variant="outline"
                                onClick={() => setForm({ ...blank })}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
