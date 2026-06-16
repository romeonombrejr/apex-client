import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { create, destroy, edit, index } from '@/routes/admin/permissions';
import type { PermissionRow } from '@/types';

type PageProps = {
    permissions: PermissionRow[];
    groups: string[];
    filters: { group?: string; search?: string };
};

const ALL_GROUPS = '__all__';

export default function PermissionsIndex({
    permissions,
    groups,
    filters,
}: PageProps) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilters(next: { group?: string; search?: string }) {
        router.get(index().url, {
            group: next.group ?? filters.group ?? '',
            search: next.search ?? filters.search ?? '',
        });
    }

    function handleGroupChange(value: string) {
        applyFilters({ group: value === ALL_GROUPS ? '' : value });
    }

    function handleSearchSubmit(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            applyFilters({ search });
        }
    }

    function handleDelete(id: number, name: string, rolesCount: number) {
        if (rolesCount > 0) {
            alert(
                `Cannot delete permission "${name}" because it is assigned to ${rolesCount} role(s).`,
            );

            return;
        }

        if (!confirm(`Delete permission "${name}"? This cannot be undone.`)) {
            return;
        }

        router.delete(destroy({ permission: id }).url);
    }

    return (
        <>
            <Head title="Permissions" />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Permissions</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage the permissions roles can be granted.
                    </p>
                </div>

                <Button asChild size="sm">
                    <Link href={create().url}>
                        <Plus className="mr-2 h-4 w-4" />
                        New permission
                    </Link>
                </Button>
            </div>

            <div className="flex flex-wrap gap-2">
                <Input
                    placeholder="Search permissions…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearchSubmit}
                    className="max-w-xs"
                />
                <Select
                    value={filters.group || ALL_GROUPS}
                    onValueChange={handleGroupChange}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="All groups" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_GROUPS}>All groups</SelectItem>
                        {groups.map((group) => (
                            <SelectItem key={group} value={group}>
                                {group}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Group</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-24" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {permissions.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="text-center text-muted-foreground"
                            >
                                No permissions found.
                            </TableCell>
                        </TableRow>
                    )}
                    {permissions.map((permission) => (
                        <TableRow key={permission.id}>
                            <TableCell className="font-medium">
                                {permission.name}
                            </TableCell>
                            <TableCell>
                                {permission.group && (
                                    <Badge variant="outline">
                                        {permission.group}
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {permission.roles_count}{' '}
                                {permission.roles_count === 1
                                    ? 'role'
                                    : 'roles'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {new Date(
                                    permission.created_at,
                                ).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="flex gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link
                                        href={
                                            edit({ permission: permission.id })
                                                .url
                                        }
                                    >
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">
                                            Edit {permission.name}
                                        </span>
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        handleDelete(
                                            permission.id,
                                            permission.name,
                                            permission.roles_count,
                                        )
                                    }
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">
                                        Delete {permission.name}
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
