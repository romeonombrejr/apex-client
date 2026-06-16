import { usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { index as auditLogsIndex } from '@/routes/admin/audit-logs';
import { index as backupIndex } from '@/routes/admin/backup';
import { index as filesIndex } from '@/routes/admin/files';
import { index as permissionsIndex } from '@/routes/admin/permissions';
import { index as rolesIndex } from '@/routes/admin/roles';
import { edit as settingsEdit } from '@/routes/admin/settings';
import { index as usersIndex } from '@/routes/admin/users';
import type { Auth, NavItem } from '@/types';

type SidebarGroup = {
    title: string;
    items: (NavItem & { permission: string })[];
};

const sidebarGroups: SidebarGroup[] = [
    {
        title: 'User Management',
        items: [
            {
                title: 'Users',
                href: usersIndex(),
                icon: null,
                permission: 'users.manage',
            },
            {
                title: 'Roles',
                href: rolesIndex(),
                icon: null,
                permission: 'roles.manage',
            },
            {
                title: 'Permissions',
                href: permissionsIndex(),
                icon: null,
                permission: 'permissions.manage',
            },
        ],
    },
    {
        title: 'Configuration',
        items: [
            {
                title: 'Settings',
                href: settingsEdit(),
                icon: null,
                permission: 'settings.manage',
            },
            {
                title: 'Backup',
                href: backupIndex(),
                icon: null,
                permission: 'backup.manage',
            },
            {
                title: 'Files',
                href: filesIndex(),
                icon: null,
                permission: 'files.manage',
            },
        ],
    },
    {
        title: 'Monitoring',
        items: [
            {
                title: 'Audit Log',
                href: auditLogsIndex(),
                icon: null,
                permission: 'audit-logs.view',
            },
        ],
    },
];

export default function AdminLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { auth } = usePage<{ auth: Auth }>().props;
    const permissions = auth.permissions ?? [];

    const visibleGroups = sidebarGroups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) =>
                permissions.includes(item.permission),
            ),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <div className="px-4 py-6">
            <Heading
                title="Admin"
                description="Manage users and platform settings"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-4" aria-label="Admin">
                        {visibleGroups.map((group) => (
                            <div key={group.title} className="space-y-1">
                                <p className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    {group.title}
                                </p>
                                {group.items.map((item, index) => (
                                    <Button
                                        key={`${toUrl(item.href)}-${index}`}
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className={cn('w-full justify-start', {
                                            'bg-muted': isCurrentOrParentUrl(
                                                item.href,
                                            ),
                                        })}
                                    >
                                        <Link href={toUrl(item.href)}>
                                            {item.icon && (
                                                <item.icon className="h-4 w-4" />
                                            )}
                                            {item.title}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-4xl">
                    <section className="space-y-6">{children}</section>
                </div>
            </div>
        </div>
    );
}
