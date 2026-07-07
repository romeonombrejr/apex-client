import { Head, Link, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Copy, Pencil, Plus, Trash2 } from 'lucide-react';
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
import {
    create,
    destroy,
    duplicate,
    edit,
    reorder,
} from '@/routes/admin/storefront/services';
import type { ServiceRow } from '@/types';

export default function ServicesIndex({
    services,
}: {
    services: ServiceRow[];
}) {
    const [ordered, setOrdered] = useState<ServiceRow[]>(services);

    function remove(service: ServiceRow) {
        if (!confirm(`Delete the "${service.name}" service?`)) {
            return;
        }

        router.delete(destroy({ service: service.id }).url, {
            preserveScroll: true,
        });
    }

    function copy(service: ServiceRow) {
        router.post(duplicate({ service: service.id }).url);
    }

    function move(index: number, direction: -1 | 1) {
        const target = index + direction;

        if (target < 0 || target >= ordered.length) {
            return;
        }

        const next = [...ordered];
        [next[index], next[target]] = [next[target], next[index]];
        setOrdered(next);
        router.post(
            reorder().url,
            { ids: next.map((s) => s.id) },
            { preserveScroll: true, preserveState: true },
        );
    }

    return (
        <>
            <Head title="Services" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Services</h1>
                    <p className="text-sm text-muted-foreground">
                        Offerings clients can browse and order. Reorder with the
                        arrows.
                    </p>
                </div>
                <Button asChild>
                    <Link href={create().url}>
                        <Plus className="mr-1 h-4 w-4" /> New service
                    </Link>
                </Button>
            </div>

            {ordered.length === 0 ? (
                <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
                    No services yet. Create your first offering.
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16" />
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-28" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ordered.map((service, index) => (
                            <TableRow key={service.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-6"
                                            disabled={index === 0}
                                            onClick={() => move(index, -1)}
                                        >
                                            <ArrowUp className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-6"
                                            disabled={
                                                index === ordered.length - 1
                                            }
                                            onClick={() => move(index, 1)}
                                        >
                                            <ArrowDown className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </TableCell>
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
                                <TableCell>{service.category ?? '—'}</TableCell>
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
                                            title="Duplicate"
                                            onClick={() => copy(service)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
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
