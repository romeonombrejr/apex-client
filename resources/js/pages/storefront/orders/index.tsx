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
import { show } from '@/routes/storefront/orders';
import type { OrderRow } from '@/types';

export default function ClientOrders({ orders }: { orders: OrderRow[] }) {
    return (
        <>
            <Head title="My Orders" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">My Orders</h1>
                <p className="text-sm text-muted-foreground">
                    Track the status of your orders.
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
                    You have no orders yet.
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Status</TableHead>
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
                                <TableCell>{order.name}</TableCell>
                                <TableCell>{order.quantity}</TableCell>
                                <TableCell>
                                    <StatusBadge status={order.status} />
                                </TableCell>
                                <TableCell>{order.created_at}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    );
}
