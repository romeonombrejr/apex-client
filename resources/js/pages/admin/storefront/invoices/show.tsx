import { Head, Link, router } from '@inertiajs/react';
import { InvoiceDetail } from '@/components/storefront/invoice-detail';
import { Button } from '@/components/ui/button';
import {
    index as invoicesIndex,
    refund,
} from '@/routes/admin/storefront/invoices';
import type { InvoiceDetail as InvoiceDetailType } from '@/types';

export default function AdminInvoiceShow({
    invoice,
}: {
    invoice: InvoiceDetailType;
}) {
    function doRefund() {
        if (!confirm('Refund this invoice back to the client as credits?')) {
            return;
        }

        router.post(refund({ invoice: invoice.id }).url);
    }

    return (
        <>
            <Head title={invoice.number} />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    Invoice {invoice.number}
                </h1>
                {invoice.status === 'paid' && (
                    <Button variant="outline" onClick={doRefund}>
                        Refund
                    </Button>
                )}
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
