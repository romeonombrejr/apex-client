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
import { create, destroy, edit } from '@/routes/admin/users';
import type { UserRow } from '@/types';

type PageProps = {
    users: UserRow[];
};

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
    admin: 'default',
    staff: 'secondary',
    client: 'outline',
};

export default function UsersIndex({ users }: PageProps) {
    function handleDelete(id: number) {
        if (!confirm('Delete this user? This cannot be undone.')) {
            return;
        }

        router.delete(destroy({ user: id }).url);
    }

    return (
        <>
            <Head title="Users" />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Users</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage all registered accounts.
                    </p>
                </div>

                <Button asChild size="sm">
                    <Link href={create().url}>
                        <Plus className="mr-2 h-4 w-4" />
                        New user
                    </Link>
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-24" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="text-center text-muted-foreground"
                            >
                                No users found.
                            </TableCell>
                        </TableRow>
                    )}
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">
                                {user.name}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                {user.role && (
                                    <Badge
                                        variant={
                                            roleBadgeVariant[user.role] ??
                                            'outline'
                                        }
                                    >
                                        {user.role}
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="flex gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={edit({ user: user.id }).url}>
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">
                                            Edit {user.name}
                                        </span>
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(user.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">
                                        Delete {user.name}
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
