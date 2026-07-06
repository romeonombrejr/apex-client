import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
import { create, destroy, edit } from '@/routes/admin/storefront/services';
import type { ServiceRow } from '@/types';

export default function ServicesIndex({
    services,
}: {
    services: ServiceRow[];
}) {
    function remove(service: ServiceRow) {
        if (!confirm(`Delete the "${service.name}" service?`)) {
            return;
        }

        router.delete(destroy({ service: service.id }).url, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Services" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Services</h1>
                    <p className="text-sm text-muted-foreground">
                        Offerings clients can browse and order.
                    </p>
                </div>
                <Button asChild>
                    <Link href={create().url}>
                        <Plus className="mr-1 h-4 w-4" /> New service
                    </Link>
                </Button>
            </div>

            {services.length === 0 ? (
                <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
                    No services yet. Create your first offering.
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Form</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-24" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services.map((service) => (
                            <TableRow key={service.id}>
                                <TableCell className="flex items-center gap-3 font-medium">
                                    {service.image_url && (
                                        <img
                                            src={service.image_url}
                                            alt={service.name}
                                            className="h-9 w-9 rounded object-cover"
                                        />
                                    )}
                                    {service.name}
                                </TableCell>
                                <TableCell>
                                    {service.type === 'subscription'
                                        ? `Subscription / ${service.billing_interval}`
                                        : 'One-time'}
                                </TableCell>
                                <TableCell>{service.price}</TableCell>
                                <TableCell>{service.form ?? '—'}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            service.is_active
                                                ? 'default'
                                                : 'outline'
                                        }
                                    >
                                        {service.is_active
                                            ? 'Active'
                                            : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                        >
                                            <Link
                                                href={
                                                    edit({
                                                        service: service.id,
                                                    }).url
                                                }
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(service)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    );
}
