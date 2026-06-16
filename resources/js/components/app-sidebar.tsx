import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, ShieldCheck } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as auditLogsIndex } from '@/routes/admin/audit-logs';
import { index as backupIndex } from '@/routes/admin/backup';
import { index as filesIndex } from '@/routes/admin/files';
import { index as permissionsIndex } from '@/routes/admin/permissions';
import { index as rolesIndex } from '@/routes/admin/roles';
import { edit as settingsEdit } from '@/routes/admin/settings';
import { index as usersIndex } from '@/routes/admin/users';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const adminDestinations: { permission: string; href: NavItem['href'] }[] = [
    { permission: 'users.manage', href: usersIndex() },
    { permission: 'roles.manage', href: rolesIndex() },
    { permission: 'permissions.manage', href: permissionsIndex() },
    { permission: 'settings.manage', href: settingsEdit() },
    { permission: 'backup.manage', href: backupIndex() },
    { permission: 'files.manage', href: filesIndex() },
    { permission: 'audit-logs.view', href: auditLogsIndex() },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const permissions = (auth as { permissions?: string[] }).permissions ?? [];
    const adminHref = adminDestinations.find((destination) =>
        permissions.includes(destination.permission),
    )?.href;

    const navItems: NavItem[] = [
        ...mainNavItems,
        ...(adminHref
            ? [{ title: 'Admin', href: adminHref, icon: ShieldCheck }]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
