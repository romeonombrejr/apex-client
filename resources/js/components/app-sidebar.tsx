import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Crown,
    FolderGit2,
    FolderOpen,
    HardDrive,
    LayoutGrid,
    Palette,
    ScrollText,
    Settings,
    Settings2,
    ShieldCheck,
    Store,
    User,
    Users,
    Wrench,
} from 'lucide-react';
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
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as auditLogsIndex } from '@/routes/admin/audit-logs';
import { index as backupIndex } from '@/routes/admin/backup';
import { index as filesIndex } from '@/routes/admin/files';
import { index as permissionsIndex } from '@/routes/admin/permissions';
import { index as rolesIndex } from '@/routes/admin/roles';
import { edit as settingsEdit } from '@/routes/admin/settings';
import { index as themesIndex } from '@/routes/admin/themes';
import { index as usersIndex } from '@/routes/admin/users';
import { index as storefrontIndex } from '@/routes/storefront';
import type { NavGroupItem, NavItem } from '@/types';

type ChildDef = NavItem & { permission: string };
type GroupDef = Omit<NavGroupItem, 'children'> & { children: ChildDef[] };

// Optional feature suites. Surfaced only when the tenant has the suite active
// (shared `suites` prop) AND the user holds its permission — mirroring the
// permission filter used for the admin groups below.
type SuiteDef = NavItem & { suite: string; permission: string };

const suiteItems: SuiteDef[] = [
    {
        title: 'Storefront',
        href: storefrontIndex(),
        icon: Store,
        suite: 'storefront',
        permission: 'storefront.view',
    },
];

const adminGroups: GroupDef[] = [
    {
        title: 'Access',
        icon: Users,
        children: [
            {
                title: 'Permissions',
                href: permissionsIndex(),
                icon: ShieldCheck,
                permission: 'permissions.manage',
            },
            {
                title: 'Users',
                href: usersIndex(),
                icon: User,
                permission: 'users.manage',
            },
            {
                title: 'Roles',
                href: rolesIndex(),
                icon: Crown,
                permission: 'roles.manage',
            },
        ],
    },
    {
        title: 'Settings',
        icon: Settings,
        children: [
            {
                title: 'App Settings',
                href: settingsEdit(),
                icon: Settings2,
                permission: 'settings.manage',
            },
            {
                title: 'Themes',
                href: themesIndex(),
                icon: Palette,
                permission: 'settings.manage',
            },
            {
                title: 'Backup',
                href: backupIndex(),
                icon: HardDrive,
                permission: 'backup.manage',
            },
        ],
    },
    {
        title: 'Utilities',
        icon: Wrench,
        children: [
            {
                title: 'Audit Logs',
                href: auditLogsIndex(),
                icon: ScrollText,
                permission: 'audit-logs.view',
            },
            {
                title: 'File Manager',
                href: filesIndex(),
                icon: FolderOpen,
                permission: 'files.manage',
            },
        ],
    },
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
    const { auth, suites } = usePage().props;
    const permissions = (auth as { permissions?: string[] }).permissions ?? [];
    const activeSuites = suites ?? [];

    const visibleGroups: NavGroupItem[] = adminGroups
        .map((group) => ({
            ...group,
            children: group.children.filter((child) =>
                permissions.includes(child.permission),
            ),
        }))
        .filter((group) => group.children.length > 0);

    const visibleSuites: NavItem[] = suiteItems
        .filter(
            (item) =>
                activeSuites.includes(item.suite) &&
                permissions.includes(item.permission),
        )
        .map((item) => ({
            title: item.title,
            href: item.href,
            icon: item.icon,
        }));

    const dashboardHref =
        visibleGroups.length > 0 ? adminDashboard() : dashboard();

    const navItems: (NavItem | NavGroupItem)[] = [
        { title: 'Dashboard', href: dashboardHref, icon: LayoutGrid },
        ...visibleSuites,
        ...visibleGroups,
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
