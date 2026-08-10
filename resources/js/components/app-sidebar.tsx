import { Link, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    Crown,
    FileText,
    FolderOpen,
    HardDrive,
    Layers,
    LayoutGrid,
    Package,
    Palette,
    Receipt,
    ScrollText,
    Settings,
    Settings2,
    ShieldCheck,
    ShoppingCart,
    Store,
    Tags,
    User,
    Users,
    Wallet,
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
import { index as categoriesIndex } from '@/routes/admin/storefront/categories';
import { index as adminCreditsIndex } from '@/routes/admin/storefront/credits';
import { index as formsIndex } from '@/routes/admin/storefront/forms';
import { index as adminInvoicesIndex } from '@/routes/admin/storefront/invoices';
import { index as adminOrdersIndex } from '@/routes/admin/storefront/orders';
import { index as servicesIndex } from '@/routes/admin/storefront/services';
import { index as statusesIndex } from '@/routes/admin/storefront/statuses';
import { index as themesIndex } from '@/routes/admin/themes';
import { index as usersIndex } from '@/routes/admin/users';
import { index as storefrontIndex } from '@/routes/storefront';
import { index as cartIndex } from '@/routes/storefront/cart';
import { index as clientCreditsIndex } from '@/routes/storefront/credits';
import { index as clientInvoicesIndex } from '@/routes/storefront/invoices';
import { index as clientOrdersIndex } from '@/routes/storefront/orders';
import type { NavGroupItem, NavItem } from '@/types';

type ChildDef = NavItem & { permission: string };
type GroupDef = Omit<NavGroupItem, 'children'> & { children: ChildDef[] };

// Optional feature suites. A suite group is surfaced only when the tenant has
// the suite active (shared `suites` prop); its children are then filtered by
// permission — mirroring the admin-group permission filter below. So clients
// see the shop, and admins additionally see the management items.
type SuiteGroupDef = { suite: string } & GroupDef;

const suiteGroups: SuiteGroupDef[] = [
    {
        suite: 'storefront',
        title: 'Storefront',
        icon: Store,
        children: [
            {
                title: 'Shop',
                href: storefrontIndex(),
                icon: Store,
                permission: 'storefront.view',
            },
            {
                title: 'Cart',
                href: cartIndex(),
                icon: ShoppingCart,
                permission: 'storefront.view',
            },
            {
                title: 'My Orders',
                href: clientOrdersIndex(),
                icon: ClipboardList,
                permission: 'storefront.view',
            },
            {
                title: 'My Invoices',
                href: clientInvoicesIndex(),
                icon: Receipt,
                permission: 'storefront.view',
            },
            {
                title: 'My Credits',
                href: clientCreditsIndex(),
                icon: Wallet,
                permission: 'storefront.view',
            },
        ],
    },
    {
        suite: 'storefront',
        title: 'Storefront Admin',
        icon: Package,
        children: [
            {
                title: 'Services',
                href: servicesIndex(),
                icon: Package,
                permission: 'storefront.manage',
            },
            {
                title: 'Categories',
                href: categoriesIndex(),
                icon: Layers,
                permission: 'storefront.manage',
            },
            {
                title: 'Forms',
                href: formsIndex(),
                icon: FileText,
                permission: 'storefront.manage',
            },
            {
                title: 'Orders',
                href: adminOrdersIndex(),
                icon: ClipboardList,
                permission: 'storefront.manage',
            },
            {
                title: 'Statuses',
                href: statusesIndex(),
                icon: Tags,
                permission: 'storefront.manage',
            },
            {
                title: 'Credits',
                href: adminCreditsIndex(),
                icon: Wallet,
                permission: 'storefront.manage',
            },
            {
                title: 'Invoices',
                href: adminInvoicesIndex(),
                icon: Receipt,
                permission: 'storefront.manage',
            },
        ],
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
                permission: 'users.view',
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
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: FolderGit2,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
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

    const visibleSuiteGroups: NavGroupItem[] = suiteGroups
        .filter((group) => activeSuites.includes(group.suite))
        .map((group) => ({
            title: group.title,
            icon: group.icon,
            children: group.children.filter((child) =>
                permissions.includes(child.permission),
            ),
        }))
        .filter((group) => group.children.length > 0);

    const dashboardHref =
        visibleGroups.length > 0 ? adminDashboard() : dashboard();

    const navItems: (NavItem | NavGroupItem)[] = [
        { title: 'Dashboard', href: dashboardHref, icon: LayoutGrid },
        ...visibleSuiteGroups,
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
                {visibleGroups.length > 0 && (
                    <NavMain
                        items={visibleGroups}
                        label={null}
                        className="mt-auto"
                    />
                )}
                <NavFooter items={footerNavItems} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
