import { Head, Link } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index as creditsIndex } from '@/routes/admin/storefront/credits';
import type { ClientBalanceRow, CreditTransactionRow } from '@/types';

type PageProps = {
    client: ClientBalanceRow;
    transactions: CreditTransactionRow[];
};

export default function CreditsShow({ client, transactions }: PageProps) {
    return (
        <>
            <Head title={`Credits — ${client.name}`} />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">{client.name}</h1>
                <p className="text-sm text-muted-foreground">{client.email}</p>
            </div>

            <div className="mb-6 w-fit rounded-lg border p-5">
                <p className="text-xs text-muted-foreground">Current balance</p>
                <p className="text-3xl font-semibold">
                    {client.balance.toFixed(2)}
                    <span className="ml-1 text-base font-normal text-muted-foreground">
                        credits
                    </span>
                </p>
            </div>

            {transactions.length === 0 ? (
                <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
                    No transactions yet.
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Note</TableHead>
                            <TableHead>By</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((t) => (
                            <TableRow key={t.id}>
                                <TableCell>{t.created_at}</TableCell>
                                <TableCell className="capitalize">
                                    {t.type}
                                </TableCell>
                                <TableCell>{t.note ?? '—'}</TableCell>
                                <TableCell>{t.by ?? 'System'}</TableCell>
                                <TableCell
                                    className={`text-right font-medium ${
                                        t.amount < 0
                                            ? 'text-destructive'
                                            : 'text-green-600'
                                    }`}
                                >
                                    {t.amount > 0 ? '+' : ''}
                                    {t.amount.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Link
                href={creditsIndex().url}
                className="mt-6 inline-block text-sm text-muted-foreground hover:underline"
            >
                ← Back to credits
            </Link>
        </>
    );
}
