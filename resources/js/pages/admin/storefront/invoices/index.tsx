import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { show } from '@/routes/admin/storefront/invoices';
import type { InvoiceRow } from '@/types';

export default function AdminInvoices({
    invoices,
}: {
    invoices: InvoiceRow[];
}) {
    return (
        <>
            <Head title="Invoices" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Invoices</h1>
                <p className="text-sm text-muted-foreground">
                    All storefront transactions.
                </p>
            </div>

            {invoices.length === 0 ? (
                <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
                    No invoices yet.
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell>
                                    <Link
                                        href={show({ invoice: invoice.id }).url}
                                        className="font-medium hover:underline"
                                    >
                                        {invoice.number}
                                    </Link>
                                </TableCell>
                                <TableCell>{invoice.client}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            invoice.status === 'paid'
                                                ? 'default'
                                                : 'outline'
                                        }
                                    >
                                        {invoice.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {invoice.total.toFixed(2)} credits
                                </TableCell>
                                <TableCell>{invoice.created_at}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    );
}
