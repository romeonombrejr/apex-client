import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatFileSize } from '@/lib/format-file-size';

type BackupRow = {
    name: string;
    path: string;
    size: number;
    date: string;
};

type Section = {
    scope: string;
    label: string;
    central: boolean;
    backups: BackupRow[];
    newest_at: string | null;
    healthy: boolean;
};

export default function SuperadminBackups({
    sections,
}: {
    sections: Section[];
}) {
    const [running, setRunning] = useState<string | null>(null);

    function run(scope: string) {
        router.post(
            '/superadmin/backups/run',
            { scope },
            {
                preserveScroll: true,
                onStart: () => setRunning(scope),
                onFinish: () => setRunning(null),
            },
        );
    }

    function remove(section: Section, backup: BackupRow) {
        if (!confirm(`Delete backup "${backup.name}" of ${section.label}?`)) {
            return;
        }

        router.delete(`/superadmin/backups/${section.scope}/${backup.path}`, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Backups" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Backups</h1>
                    <p className="text-sm text-muted-foreground">
                        Nightly database dumps per tenant (01:30), kept 7 days
                        daily / 4 weeks weekly / 3 months monthly.
                    </p>
                </div>
                <Button onClick={() => run('all')} disabled={running !== null}>
                    {running === 'all' ? 'Backing up…' : 'Back up everything'}
                </Button>
            </div>

            <div className="space-y-8">
                {sections.map((section) => (
                    <section key={section.scope}>
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="font-semibold">
                                    {section.label}
                                </h2>
                                {section.central && (
                                    <span className="text-xs text-muted-foreground">
                                        config &amp; accounts · download-only
                                    </span>
                                )}
                                <Badge
                                    variant={
                                        section.healthy
                                            ? 'default'
                                            : 'destructive'
                                    }
                                >
                                    {section.healthy
                                        ? `Healthy · ${section.newest_at}`
                                        : section.newest_at
                                          ? `Stale · ${section.newest_at}`
                                          : 'No backups yet'}
                                </Badge>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => run(section.scope)}
                                disabled={running !== null}
                            >
                                {running === section.scope
                                    ? 'Backing up…'
                                    : 'Back up now'}
                            </Button>
                        </div>

                        {section.backups.length === 0 ? (
                            <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                                No backups yet — the nightly run or "Back up
                                now" will create the first one.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Archive</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="w-40" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {section.backups.map((backup) => (
                                        <TableRow key={backup.path}>
                                            <TableCell className="font-medium">
                                                {backup.name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatFileSize(backup.size)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {backup.date}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <a
                                                        href={`/superadmin/backups/${section.scope}/${backup.path}/download`}
                                                    >
                                                        Download
                                                    </a>
                                                </Button>
                                                {!section.central && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive"
                                                        onClick={() =>
                                                            remove(
                                                                section,
                                                                backup,
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </section>
                ))}
            </div>
        </>
    );
}
