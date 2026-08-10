import { Head, router } from '@inertiajs/react';
import { Download, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { destroy, download, restore, store } from '@/routes/admin/backup';
import type { BackupRow } from '@/types';

type PageProps = {
    backups: BackupRow[];
};

export default function BackupIndex({ backups }: PageProps) {
    const [creating, setCreating] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [confirmRestore, setConfirmRestore] = useState<BackupRow | null>(
        null,
    );

    function handleCreate() {
        setCreating(true);
        router.post(store().url, {}, { onFinish: () => setCreating(false) });
    }

    function handleRestoreConfirm() {
        if (!confirmRestore) {
            return;
        }

        setRestoring(true);
        router.post(
            restore({ path: confirmRestore.path }).url,
            {},
            {
                onFinish: () => {
                    setRestoring(false);
                    setConfirmRestore(null);
                },
            },
        );
    }

    function handleDelete(path: string, name: string) {
        if (!confirm(`Delete backup "${name}"? This cannot be undone.`)) {
            return;
        }

        router.delete(destroy({ path }).url);
    }

    return (
        <>
            <Head title="Backup" />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Backup</h2>
                    <p className="text-sm text-muted-foreground">
                        Create and manage database backups.
                    </p>
                </div>

                <Button size="sm" onClick={handleCreate} disabled={creating}>
                    <Plus className="mr-2 h-4 w-4" />
                    {creating ? 'Running backup…' : 'New backup'}
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-32" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {backups.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="text-center text-muted-foreground"
                            >
                                No backups found.
                            </TableCell>
                        </TableRow>
                    )}
                    {backups.map((backup) => (
                        <TableRow key={backup.path}>
                            <TableCell className="font-medium">
                                {backup.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {backup.size}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {new Date(backup.date).toLocaleString()}
                            </TableCell>
                            <TableCell className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Restore this backup"
                                    onClick={() => setConfirmRestore(backup)}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    <span className="sr-only">
                                        Restore {backup.name}
                                    </span>
                                </Button>
                                <Button variant="ghost" size="icon" asChild>
                                    <a
                                        href={
                                            download({ path: backup.path }).url
                                        }
                                    >
                                        <Download className="h-4 w-4" />
                                        <span className="sr-only">
                                            Download {backup.name}
                                        </span>
                                    </a>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        handleDelete(backup.path, backup.name)
                                    }
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">
                                        Delete {backup.name}
                                    </span>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog
                open={!!confirmRestore}
                onOpenChange={(open) => !open && setConfirmRestore(null)}
            >
                <DialogContent>
                    <DialogTitle>Restore database?</DialogTitle>
                    <DialogDescription asChild>
                        <div className="space-y-3">
                            <p>You are about to restore the database from:</p>
                            <p className="rounded bg-muted px-3 py-2 font-mono text-sm">
                                {confirmRestore?.name}
                            </p>
                            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                                <strong>Warning:</strong> This will overwrite
                                your entire current database. All data created
                                after this backup was made will be permanently
                                lost. This cannot be undone.
                            </div>
                        </div>
                    </DialogDescription>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary" disabled={restoring}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            disabled={restoring}
                            onClick={handleRestoreConfirm}
                        >
                            {restoring ? 'Restoring…' : 'Yes, restore database'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
