import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { InvoiceDetail as InvoiceDetailType } from '@/types';

type Props = {
    invoice: InvoiceDetailType;
    children?: ReactNode;
};

export function InvoiceDetail({ invoice, children }: Props) {
    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-start justify-between rounded-lg border p-4">
                <div className="text-sm">
                    <p className="text-lg font-semibold">{invoice.number}</p>
                    {invoice.client && (
                        <p className="text-muted-foreground">
                            {invoice.client}
                        </p>
                    )}
                    <p className="text-muted-foreground">
                        {invoice.paid_at ?? invoice.created_at}
                    </p>
                </div>
                <Badge
                    variant={invoice.status === 'paid' ? 'default' : 'outline'}
                >
                    {invoice.status}
                </Badge>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoice.items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                {item.name}
                                {item.order && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        {item.order.number}
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>{item.unit_price.toFixed(2)}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell className="text-right">
                                {item.total.toFixed(2)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex justify-end">
                <div className="w-48 space-y-1 text-sm">
                    <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total</span>
                        <span>{invoice.total.toFixed(2)} credits</span>
                    </div>
                </div>
            </div>

            {children}
        </div>
    );
}
