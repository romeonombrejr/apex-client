import { Head, Link } from '@inertiajs/react';
import { InvoiceDetail } from '@/components/storefront/invoice-detail';
import { index as invoicesIndex } from '@/routes/storefront/invoices';
import type { InvoiceDetail as InvoiceDetailType } from '@/types';

export default function ClientInvoiceShow({
    invoice,
}: {
    invoice: InvoiceDetailType;
}) {
    return (
        <>
            <Head title={invoice.number} />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">
                    Invoice {invoice.number}
                </h1>
            </div>

            <InvoiceDetail invoice={invoice}>
                <Link
                    href={invoicesIndex().url}
                    className="text-sm text-muted-foreground hover:underline"
                >
                    ← Back to invoices
                </Link>
            </InvoiceDetail>
        </>
    );
}
