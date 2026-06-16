import { Head, router } from '@inertiajs/react';
import { Download, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { destroy, download, store } from '@/routes/admin/backup';
import type { BackupRow } from '@/types';

type PageProps = {
    backups: BackupRow[];
};

export default function BackupIndex({ backups }: PageProps) {
    const [creating, setCreating] = useState(false);

    function handleCreate() {
        setCreating(true);
        router.post(store().url, {}, { onFinish: () => setCreating(false) });
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
                        <TableHead className="w-24" />
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
                            <TableCell className="flex gap-2">
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
        </>
    );
}
