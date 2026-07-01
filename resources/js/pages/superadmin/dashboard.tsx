import { Head } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type ReportRow = {
    id: string;
    name: string | null;
    plan: string | null;
    users: number | null;
    max_users: number | null;
};

type Props = {
    stats: {
        tenants: number;
        active: number;
        suspended: number;
        plans: number;
    };
    report: {
        total_users: number;
        tenants: ReportRow[];
    };
};

const cards: { key: keyof Props['stats']; label: string }[] = [
    { key: 'tenants', label: 'Tenants' },
    { key: 'active', label: 'Active' },
    { key: 'suspended', label: 'Suspended' },
    { key: 'plans', label: 'Plans' },
];

export default function SuperAdminDashboard({ stats, report }: Props) {
    return (
        <>
            <Head title="Super Admin dashboard" />

            <h1 className="mb-6 text-2xl font-semibold">Overview</h1>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <div key={card.key} className="rounded-lg border p-5">
                        <div className="text-sm text-muted-foreground">
                            {card.label}
                        </div>
                        <div className="mt-2 text-3xl font-semibold">
                            {stats[card.key]}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10">
                <div className="mb-3 flex items-baseline justify-between">
                    <h2 className="text-lg font-semibold">Usage by tenant</h2>
                    <span className="text-sm text-muted-foreground">
                        {report.total_users} users across all tenants
                    </span>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tenant</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Users</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {report.tenants.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="text-center text-muted-foreground"
                                >
                                    No tenants yet.
                                </TableCell>
                            </TableRow>
                        )}
                        {report.tenants.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell className="font-medium">
                                    {row.name ?? row.id}
                                </TableCell>
                                <TableCell>{row.plan ?? '—'}</TableCell>
                                <TableCell>
                                    {row.users === null
                                        ? 'unavailable'
                                        : `${row.users}${row.max_users ? ` / ${row.max_users}` : ''}`}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
