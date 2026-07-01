import { Link, usePage } from '@inertiajs/react';

const tabs = [
    { label: 'Profile', href: '/superadmin/settings/profile' },
    { label: 'Security', href: '/superadmin/settings/security' },
];

export default function SettingsNav() {
    const { url } = usePage();

    return (
        <nav className="mb-6 flex gap-1 border-b">
            {tabs.map((tab) => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className={
                        url.startsWith(tab.href)
                            ? 'border-b-2 border-primary px-4 py-2 text-sm font-medium'
                            : 'px-4 py-2 text-sm text-muted-foreground hover:text-foreground'
                    }
                >
                    {tab.label}
                </Link>
            ))}
        </nav>
    );
}
