import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { AnswersDisplay } from '@/components/storefront/answers-display';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { show as invoiceShow } from '@/routes/admin/storefront/invoices';
import { index as ordersIndex, update } from '@/routes/admin/storefront/orders';
import type { OrderDetail, OrderStatusLite } from '@/types';

type Assignee = { id: number; name: string };

type PageProps = {
    order: OrderDetail;
    statuses: OrderStatusLite[];
    assignees: Assignee[];
};

export default function AdminOrderShow({
    order,
    statuses,
    assignees,
}: PageProps) {
    const [statusId, setStatusId] = useState(String(order.status_id ?? ''));
    const [assignedTo, setAssignedTo] = useState(
        order.assigned_to ? String(order.assigned_to) : 'none',
    );
    const [saving, setSaving] = useState(false);

    function save() {
        router.put(
            update({ order: order.id }).url,
            {
                order_status_id: Number(statusId),
                assigned_to: assignedTo === 'none' ? null : Number(assignedTo),
            },
            {
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
            },
        );
    }

    return (
        <>
            <Head title={order.number} />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">{order.name}</h1>
                <p className="text-sm text-muted-foreground">
                    Order {order.number} · {order.client} · placed{' '}
                    {order.created_at}
                </p>
            </div>

            <div className="grid max-w-4xl gap-6 lg:grid-cols-[1fr_280px]">
                <div className="space-y-6">
                    <div className="rounded-lg border p-4">
                        <h2 className="mb-3 font-semibold">
                            Submitted details
                        </h2>
                        <AnswersDisplay
                            form={order.form}
                            answers={order.answers}
                        />
                    </div>

                    {order.invoice && (
                        <Link
                            href={
                                invoiceShow({ invoice: order.invoice.id }).url
                            }
                            className="text-sm text-muted-foreground hover:underline"
                        >
                            Invoice {order.invoice.number}
                        </Link>
                    )}
                </div>

                <div className="h-fit space-y-4 rounded-lg border p-5">
                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select value={statusId} onValueChange={setStatusId}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Assignee</Label>
                        <Select
                            value={assignedTo}
                            onValueChange={setAssignedTo}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Unassigned</SelectItem>
                                {assignees.map((a) => (
                                    <SelectItem key={a.id} value={String(a.id)}>
                                        {a.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={save} disabled={saving} className="w-full">
                        Save
                    </Button>

                    <Link
                        href={ordersIndex().url}
                        className="block text-center text-sm text-muted-foreground hover:underline"
                    >
                        Back to orders
                    </Link>
                </div>
            </div>
        </>
    );
}
