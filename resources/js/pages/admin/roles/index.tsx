import { Head, Link, router } from '@inertiajs/react';
import { Plus, Trash2, Pencil } from 'lucide-react';
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
import { create, destroy, edit } from '@/routes/admin/roles';
import type { RoleRow } from '@/types';

type PageProps = {
    roles: RoleRow[];
};

export default function RolesIndex({ roles }: PageProps) {
    function handleDelete(id: number, name: string, usersCount: number) {
        if (usersCount > 0) {
            alert(
                `Cannot delete role "${name}" because it has ${usersCount} user(s) assigned to it.`,
            );

            return;
        }

        if (!confirm(`Delete role "${name}"? This cannot be undone.`)) {
            return;
        }

        router.delete(destroy({ role: id }).url);
    }

    return (
        <>
            <Head title="Roles" />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Roles</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage user roles and permissions.
                    </p>
                </div>

                <Button asChild size="sm">
                    <Link href={create().url}>
                        <Plus className="mr-2 h-4 w-4" />
                        New role
                    </Link>
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-24" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {roles.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="text-center text-muted-foreground"
                            >
                                No roles found.
                            </TableCell>
                        </TableRow>
                    )}
                    {roles.map((role) => (
                        <TableRow key={role.id}>
                            <TableCell className="font-medium">
                                {role.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {role.users_count}{' '}
                                {role.users_count === 1 ? 'user' : 'users'}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary">
                                    {role.permissions_count}{' '}
                                    {role.permissions_count === 1
                                        ? 'permission'
                                        : 'permissions'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {new Date(role.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="flex gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={edit({ role: role.id }).url}>
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">
                                            Edit {role.name}
                                        </span>
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        handleDelete(
                                            role.id,
                                            role.name,
                                            role.users_count,
                                        )
                                    }
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">
                                        Delete {role.name}
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
