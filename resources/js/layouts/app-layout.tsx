import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { applyTheme } from '@/lib/apply-theme';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { theme, branding } = usePage().props;

    // Re-apply on Inertia navigation so activating a theme takes effect live.
    useEffect(() => {
        applyTheme(theme, branding?.primary_color);
    }, [theme, branding?.primary_color]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}
