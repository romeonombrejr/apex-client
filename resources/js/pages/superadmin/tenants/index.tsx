import { Head, Link, router } from '@inertiajs/react';
import { LogIn, Pause, Pencil, Play, Plus, Trash2 } from 'lucide-react';
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

type TenantRow = {
    id: string;
    name: string | null;
    status: string;
    plan: string | null;
    domains: string[];
    created_at: string | null;
};

type PageProps = {
    tenants: TenantRow[];
};

export default function TenantsIndex({ tenants }: PageProps) {
    function suspend(id: string) {
        router.post(`/superadmin/tenants/${id}/suspend`);
    }

    function resume(id: string) {
        router.post(`/superadmin/tenants/${id}/resume`);
    }

    function impersonate(id: string) {
        router.post(`/superadmin/tenants/${id}/impersonate`);
    }

    function destroy(id: string, name: string | null) {
        if (
            !confirm(
                `Delete tenant "${name ?? id}"? This permanently drops its database and cannot be undone.`,
            )
        ) {
            return;
        }

        router.delete(`/superadmin/tenants/${id}`);
    }

    return (
        <>
            <Head title="Tenants" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Tenants</h1>
                    <p className="text-sm text-muted-foreground">
                        Each tenant has its own database and admin.
                    </p>
                </div>

                <Button asChild size="sm">
                    <Link href="/superadmin/tenants/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New tenant
                    </Link>
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Domains</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-40" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tenants.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="text-center text-muted-foreground"
                            >
                                No tenants yet.
                            </TableCell>
                        </TableRow>
                    )}
                    {tenants.map((tenant) => (
                        <TableRow key={tenant.id}>
                            <TableCell className="font-medium">
                                {tenant.name ?? tenant.id}
                            </TableCell>
                            <TableCell className="text-sm">
                                {tenant.domains.map((domain) => (
                                    <div key={domain}>{domain}</div>
                                ))}
                            </TableCell>
                            <TableCell>{tenant.plan ?? '—'}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        tenant.status === 'active'
                                            ? 'default'
                                            : 'destructive'
                                    }
                                >
                                    {tenant.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {tenant.created_at ?? '—'}
                            </TableCell>
                            <TableCell className="flex gap-1">
                                {tenant.status === 'active' ? (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Suspend"
                                        onClick={() => suspend(tenant.id)}
                                    >
                                        <Pause className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Resume"
                                        onClick={() => resume(tenant.id)}
                                    >
                                        <Play className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Impersonate admin"
                                    disabled={
                                        tenant.status !== 'active' ||
                                        tenant.domains.length === 0
                                    }
                                    onClick={() => impersonate(tenant.id)}
                                >
                                    <LogIn className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Edit"
                                    asChild
                                >
                                    <Link
                                        href={`/superadmin/tenants/${tenant.id}/edit`}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Delete"
                                    onClick={() =>
                                        destroy(tenant.id, tenant.name)
                                    }
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
}
