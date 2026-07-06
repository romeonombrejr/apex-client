import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { show, store } from '@/routes/admin/storefront/credits';
import type { ClientBalanceRow } from '@/types';

export default function CreditsIndex({
    clients,
}: {
    clients: ClientBalanceRow[];
}) {
    const [adjusting, setAdjusting] = useState<ClientBalanceRow | null>(null);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');

    function open(client: ClientBalanceRow) {
        setAdjusting(client);
        setAmount('');
        setNote('');
    }

    function submit() {
        if (!adjusting) {
            return;
        }

        router.post(
            store().url,
            { user_id: adjusting.id, amount, note },
            { onSuccess: () => setAdjusting(null) },
        );
    }

    return (
        <>
            <Head title="Credits" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Credits</h1>
                <p className="text-sm text-muted-foreground">
                    Manage client credit balances.
                </p>
            </div>

            {clients.length === 0 ? (
                <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
                    No client accounts yet.
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead className="w-40" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.map((client) => (
                            <TableRow key={client.id}>
                                <TableCell>
                                    <Link
                                        href={show({ user: client.id }).url}
                                        className="font-medium hover:underline"
                                    >
                                        {client.name}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">
                                        {client.email}
                                    </p>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {client.balance.toFixed(2)} credits
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => open(client)}
                                    >
                                        Adjust
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Dialog
                open={adjusting !== null}
                onOpenChange={(o) => !o && setAdjusting(null)}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            Adjust credits — {adjusting?.name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="amount">
                            Amount (negative to deduct)
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="note">Note (optional)</Label>
                        <Input
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button onClick={submit}>Apply</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
