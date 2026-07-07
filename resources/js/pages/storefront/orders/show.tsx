import { Head, Link } from '@inertiajs/react';
import { AnswersDisplay } from '@/components/storefront/answers-display';
import { OrderThread } from '@/components/storefront/order-thread';
import { StatusBadge } from '@/components/storefront/status-badge';
import { show as invoiceShow } from '@/routes/storefront/invoices';
import {
    index as ordersIndex,
    show as orderShow,
} from '@/routes/storefront/orders';
import { store as postMessage } from '@/routes/storefront/orders/messages';
import type { OrderDetail } from '@/types';

export default function ClientOrderShow({ order }: { order: OrderDetail }) {
    return (
        <>
            <Head title={order.number} />

            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{order.name}</h1>
                    <p className="text-sm text-muted-foreground">
                        Order {order.number} · placed {order.created_at}
                    </p>
                </div>
                <StatusBadge status={order.status} />
            </div>

            <div className="max-w-2xl space-y-6">
                <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 text-sm">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Quantity
                        </p>
                        <p>{order.quantity}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Invoice</p>
                        {order.invoice ? (
                            <Link
                                href={
                                    invoiceShow({ invoice: order.invoice.id })
                                        .url
                                }
                                className="hover:underline"
                            >
                                {order.invoice.number}
                            </Link>
                        ) : (
                            <span className="text-muted-foreground">—</span>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border p-4">
                    <h2 className="mb-3 font-semibold">Submitted details</h2>
                    <AnswersDisplay form={order.form} answers={order.answers} />
                </div>

                {order.references.length > 0 && (
                    <div className="rounded-lg border p-4">
                        <h2 className="mb-3 font-semibold">
                            Referenced orders
                        </h2>
                        <ul className="space-y-1 text-sm">
                            {order.references.map((ref) => (
                                <li key={ref.id}>
                                    <Link
                                        href={orderShow({ order: ref.id }).url}
                                        className="hover:underline"
                                    >
                                        {ref.number} — {ref.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="rounded-lg border p-4">
                    <h2 className="mb-3 font-semibold">Messages</h2>
                    <OrderThread
                        messages={order.messages}
                        postUrl={postMessage({ order: order.id }).url}
                    />
                </div>

                <Link
                    href={ordersIndex().url}
                    className="text-sm text-muted-foreground hover:underline"
                >
                    ← Back to orders
                </Link>
            </div>
        </>
    );
}
