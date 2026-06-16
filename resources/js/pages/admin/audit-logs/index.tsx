import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { AuditLogRow, PaginatedData } from '@/types';

type PageProps = {
    activities: PaginatedData<AuditLogRow>;
};

export default function AuditLogsIndex({ activities }: PageProps) {
    return (
        <>
            <Head title="Audit log" />

            <div>
                <h2 className="text-lg font-semibold">Audit log</h2>
                <p className="text-sm text-muted-foreground">
                    A history of admin actions across the app.
                </p>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>By</TableHead>
                        <TableHead>When</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {activities.data.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="text-center text-muted-foreground"
                            >
                                No activity recorded yet.
                            </TableCell>
                        </TableRow>
                    )}
                    {activities.data.map((activity) => (
                        <TableRow key={activity.id}>
                            <TableCell className="font-medium">
                                {activity.description}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {activity.subject_type ?? '—'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {activity.causer ?? 'System'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {new Date(activity.created_at).toLocaleString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {activities.links.length > 3 && (
                <div className="flex flex-wrap gap-2">
                    {activities.links.map((link, i) =>
                        link.url ? (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get(link.url as string)}
                            >
                                {link.label
                                    .replace('&laquo;', '«')
                                    .replace('&raquo;', '»')}
                            </Button>
                        ) : (
                            <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                disabled
                            >
                                {link.label
                                    .replace('&laquo;', '«')
                                    .replace('&raquo;', '»')}
                            </Button>
                        ),
                    )}
                </div>
            )}
        </>
    );
}
