import { Head, Link } from '@inertiajs/react';
import { StatusBadge } from '@/components/storefront/status-badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { show } from '@/routes/admin/storefront/orders';
import type { OrderRow } from '@/types';

export default function AdminOrders({ orders }: { orders: OrderRow[] }) {
    return (
        <>
            <Head title="Orders" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Orders</h1>
                <p className="text-sm text-muted-foreground">
                    All client orders and their status.
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
                    No orders yet.
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead>Placed</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>
                                    <Link
                                        href={show({ order: order.id }).url}
                                        className="font-medium hover:underline"
                                    >
                                        {order.number}
                                    </Link>
                                </TableCell>
                                <TableCell>{order.client}</TableCell>
                                <TableCell>{order.name}</TableCell>
                                <TableCell>
                                    <StatusBadge status={order.status} />
                                </TableCell>
                                <TableCell>{order.assignee ?? '—'}</TableCell>
                                <TableCell>{order.created_at}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    );
}
