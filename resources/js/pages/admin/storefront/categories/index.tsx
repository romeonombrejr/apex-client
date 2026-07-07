import { Head, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import {
    destroy,
    reorder,
    store,
    update,
} from '@/routes/admin/storefront/categories';
import type { ServiceCategoryRow } from '@/types';

export default function CategoriesIndex({
    categories,
}: {
    categories: ServiceCategoryRow[];
}) {
    const [ordered, setOrdered] = useState<ServiceCategoryRow[]>(categories);
    const [editing, setEditing] = useState<number | null>(null);
    const [name, setName] = useState('');

    function submit() {
        if (name.trim() === '') {
            return;
        }

        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                setName('');
                setEditing(null);
            },
        };

        if (editing) {
            router.put(update({ category: editing }).url, { name }, opts);
        } else {
            router.post(store().url, { name }, opts);
        }
    }

    function remove(category: ServiceCategoryRow) {
        if (!confirm(`Delete "${category.name}"?`)) {
            return;
        }

        router.delete(destroy({ category: category.id }).url, {
            preserveScroll: true,
        });
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
            { ids: next.map((c) => c.id) },
            { preserveScroll: true, preserveState: true },
        );
    }

    return (
        <>
            <Head title="Service categories" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Service categories</h1>
                <p className="text-sm text-muted-foreground">
                    Group your services. Clients can filter the shop by
                    category.
                </p>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
                {ordered.length === 0 ? (
                    <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
                        No categories yet.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16" />
                                <TableHead>Name</TableHead>
                                <TableHead>Services</TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ordered.map((category, index) => (
                                <TableRow key={category.id}>
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
                                    <TableCell
                                        className="cursor-pointer font-medium"
                                        onClick={() => {
                                            setEditing(category.id);
                                            setName(category.name);
                                        }}
                                    >
                                        {category.name}
                                    </TableCell>
                                    <TableCell>
                                        {category.services_count}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(category)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                <div className="h-fit space-y-4 rounded-lg border p-5">
                    <h2 className="font-semibold">
                        {editing ? 'Edit category' : 'New category'}
                    </h2>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={submit}>
                            {editing ? 'Save' : 'Create'}
                        </Button>
                        {editing && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEditing(null);
                                    setName('');
                                }}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
