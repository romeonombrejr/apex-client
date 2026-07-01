import { Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

const navItems = [
    { label: 'Dashboard', href: '/superadmin/dashboard' },
    { label: 'Tenants', href: '/superadmin/tenants' },
    { label: 'Plans', href: '/superadmin/plans' },
];

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { props, url } = usePage();
    const superAdminUser = props.superAdmin;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/superadmin/dashboard"
                            className="font-semibold"
                        >
                            Super Admin
                        </Link>
                        <nav className="flex items-center gap-4 text-sm">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={
                                        url.startsWith(item.href)
                                            ? 'font-medium text-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        {superAdminUser && (
                            <span className="text-muted-foreground">
                                {superAdminUser.name}
                            </span>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.post('/superadmin/logout')}
                        >
                            Log out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
    );
}
