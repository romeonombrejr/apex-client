import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Copy,
    KeyRound,
    LockKeyhole,
    Pencil,
    Plus,
    Send,
    Trash2,
    UserRoundCog,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import UserInvitationController from '@/actions/App/Http/Controllers/Admin/UserInvitationController';
import TenantImpersonationController from '@/actions/App/Http/Controllers/TenantImpersonationController';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useInitials } from '@/hooks/use-initials';
import { formatDate, formatDateTime } from '@/lib/format-date';
import { create, destroy, edit } from '@/routes/admin/users';
import type { Role, UserRow } from '@/types';

type PageProps = {
    users: UserRow[];
    /** Still sent by the controller; only the hidden invite dialog consumed it. */
    roles: Role[];
};

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
    admin: 'default',
    staff: 'secondary',
    client: 'outline',
};

type InviteFlash = {
    url: string;
    email: string;
    mode: 'invite' | 'login' | 'reset';
    /** Human validity label ("24 hours"); null = never expires. */
    expires?: string | null;
};

type ExpiryPreset = '24h' | '7d' | '30d' | 'never';

const expiryOptions: { value: ExpiryPreset; label: string }[] = [
    { value: '24h', label: '24 hours' },
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: 'never', label: 'No expiration' },
];

export default function UsersIndex({ users }: PageProps) {
    const [invite, setInvite] = useState<InviteFlash | null>(null);

    // Actions are permission-gated per users.* ability (the server enforces
    // the same gates on every route — this only hides what would 403).
    const { auth } = usePage().props;
    const can = (permission: string) => auth.permissions.includes(permission);
    const getInitials = useInitials();

    // A freshly-issued access link is flashed by the server after create or
    // link; surface it in a dialog so the admin can copy and hand it over.
    useEffect(() => {
        return router.on('flash', (event) => {
            const data = (event as CustomEvent).detail?.flash?.invite as
                | InviteFlash
                | undefined;

            if (data?.url) {
                setInvite(data);
            }
        });
    }, []);

    function handleDelete(id: number) {
        if (!confirm('Delete this user? This cannot be undone.')) {
            return;
        }

        router.delete(destroy({ user: id }).url);
    }

    function impersonate(user: UserRow) {
        router.post(TenantImpersonationController.store.url({ user: user.id }));
    }

    function sendLink(user: UserRow, expires: ExpiryPreset) {
        router.post(
            UserInvitationController.link.url({ user: user.id }),
            { expires },
            { preserveScroll: true },
        );
    }

    function revokeLink(user: UserRow) {
        const message = user.link_session
            ? `Revoke ${user.name}'s link and sign them out?`
            : `Revoke the outstanding link for ${user.name}?`;

        if (!confirm(message)) {
            return;
        }

        router.delete(UserInvitationController.revoke.url({ user: user.id }), {
            preserveScroll: true,
        });
    }

    function sendResetLink(user: UserRow) {
        router.post(
            UserInvitationController.resetLink.url({ user: user.id }),
            {},
            { preserveScroll: true },
        );
    }

    function copyLink() {
        if (!invite) {
            return;
        }

        navigator.clipboard
            .writeText(invite.url)
            .then(() => toast.success('Link copied'))
            .catch(() =>
                toast.error('Could not copy — select and copy manually'),
            );
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

                {can('users.create') && (
                    <div className="flex gap-2">
                        {/*
                         * "Invite user" is hidden for now: two ways to create
                         * an account side by side confused admins. Accounts go
                         * through New user. Nothing else was removed — the
                         * InviteUserDialog component, its route/controller,
                         * the `roles` prop and the pending-invite badges below
                         * all still work; restore by re-adding
                         * <InviteUserDialog roles={roles} /> here.
                         */}
                        <Button asChild size="sm">
                            <Link href={create().url}>
                                <Plus className="mr-2 h-4 w-4" />
                                New user
                            </Link>
                        </Button>
                    </div>
                )}
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-36" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="text-center text-muted-foreground"
                            >
                                No users found.
                            </TableCell>
                        </TableRow>
                    )}
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">
                                <span className="flex items-center gap-2.5">
                                    <Avatar className="h-7 w-7 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={user.avatar ?? undefined}
                                            alt={user.name}
                                        />
                                        <AvatarFallback className="rounded-full bg-neutral-200 text-xs text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {user.name}
                                </span>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {user.company ?? '—'}
                            </TableCell>
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
                            <TableCell>
                                {user.pending_invite || user.link_session ? (
                                    <span className="inline-flex items-center gap-1">
                                        <Badge
                                            variant="outline"
                                            title={
                                                user.link_expires_at
                                                    ? `${user.link_session ? 'Session ends' : 'Expires'} ${formatDateTime(user.link_expires_at)}`
                                                    : 'Never expires'
                                            }
                                        >
                                            {user.link_session
                                                ? 'Signed in via link'
                                                : user.activated
                                                  ? 'Link active'
                                                  : 'Invite pending'}
                                            <span className="ml-1 font-normal text-muted-foreground">
                                                ·{' '}
                                                {user.link_expires_at
                                                    ? formatDate(
                                                          user.link_expires_at,
                                                      )
                                                    : 'no expiry'}
                                            </span>
                                        </Badge>
                                        {user.link_url && (
                                            <button
                                                type="button"
                                                className="rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                                                title="Copy link"
                                                onClick={() =>
                                                    navigator.clipboard
                                                        .writeText(
                                                            user.link_url ?? '',
                                                        )
                                                        .then(() =>
                                                            toast.success(
                                                                'Link copied',
                                                            ),
                                                        )
                                                        .catch(() =>
                                                            toast.error(
                                                                'Could not copy the link',
                                                            ),
                                                        )
                                                }
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                                <span className="sr-only">
                                                    Copy link for {user.name}
                                                </span>
                                            </button>
                                        )}
                                        {can('users.links') && (
                                            <button
                                                type="button"
                                                className="rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                                                title="Revoke link"
                                                onClick={() => revokeLink(user)}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                                <span className="sr-only">
                                                    Revoke link for {user.name}
                                                </span>
                                            </button>
                                        )}
                                    </span>
                                ) : user.activated ? (
                                    <span className="text-sm text-muted-foreground">
                                        Active
                                    </span>
                                ) : (
                                    <span className="text-sm text-muted-foreground">
                                        —
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="flex justify-end gap-1">
                                {!user.is_self && can('users.links') && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title={
                                                    user.activated
                                                        ? 'Get a sign-in link'
                                                        : 'Get an invite link'
                                                }
                                            >
                                                {user.activated ? (
                                                    <KeyRound className="h-4 w-4" />
                                                ) : (
                                                    <Send className="h-4 w-4" />
                                                )}
                                                <span className="sr-only">
                                                    {user.activated
                                                        ? `Get sign-in link for ${user.name}`
                                                        : `Get invite link for ${user.name}`}
                                                </span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>
                                                {user.activated
                                                    ? 'Sign-in link — expires in'
                                                    : 'Invite link — expires in'}
                                            </DropdownMenuLabel>
                                            {expiryOptions.map((option) => (
                                                <DropdownMenuItem
                                                    key={option.value}
                                                    onSelect={() =>
                                                        sendLink(
                                                            user,
                                                            option.value,
                                                        )
                                                    }
                                                >
                                                    {option.label}
                                                    {option.value ===
                                                        (user.activated
                                                            ? '24h'
                                                            : '7d') && (
                                                        <span className="ml-auto pl-3 text-xs text-muted-foreground">
                                                            default
                                                        </span>
                                                    )}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                                {!user.is_self &&
                                    user.activated &&
                                    can('users.reset') && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => sendResetLink(user)}
                                            title="Get a password reset link"
                                        >
                                            <LockKeyhole className="h-4 w-4" />
                                            <span className="sr-only">
                                                Get password reset link for{' '}
                                                {user.name}
                                            </span>
                                        </Button>
                                    )}
                                {user.impersonatable &&
                                    can('users.impersonate') && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => impersonate(user)}
                                            title="View app as this user"
                                        >
                                            <UserRoundCog className="h-4 w-4" />
                                            <span className="sr-only">
                                                Impersonate {user.name}
                                            </span>
                                        </Button>
                                    )}
                                {can('users.edit') && (
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link
                                            href={edit({ user: user.id }).url}
                                        >
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">
                                                Edit {user.name}
                                            </span>
                                        </Link>
                                    </Button>
                                )}
                                {can('users.delete') && (
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
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog
                open={invite !== null}
                onOpenChange={(o) => !o && setInvite(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {invite?.mode === 'login'
                                ? 'Sign-in link ready'
                                : invite?.mode === 'reset'
                                  ? 'Password reset link ready'
                                  : 'Invitation link ready'}
                        </DialogTitle>
                        <DialogDescription>
                            {invite?.mode === 'login'
                                ? `Send this link to ${invite?.email}. It signs them straight into the app — no password needed. `
                                : invite?.mode === 'reset'
                                  ? `Send this link to ${invite?.email}. It lets them choose a new password — no sign-in needed. It expires in 48 hours, and can be used once.`
                                  : `Send this link to ${invite?.email}. It signs them in and prompts them to set a password. `}
                            {invite?.mode !== 'reset' &&
                                (invite?.expires
                                    ? `It works until it expires in ${invite.expires} or you revoke it; each use signs in one device at a time.`
                                    : `It works until you revoke or replace it; each use signs in one device at a time.`)}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-2">
                        <Input
                            readOnly
                            value={invite?.url ?? ''}
                            onFocus={(e) => e.currentTarget.select()}
                            className="font-mono text-xs"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={copyLink}
                            title="Copy link"
                        >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy invite link</span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
