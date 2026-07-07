import type { ThemePayload } from '@/lib/apply-theme';
import type { NotificationItem, SettingFormData } from '@/types';
import type { Auth } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

export type SuperAdmin = {
    id: number;
    name: string;
    email: string;
};

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            branding: SettingFormData;
            theme: ThemePayload | null;
            auth: Auth;
            roles: string[];
            superAdmin: SuperAdmin | null;
            suites: string[];
            notifications: { unread: number; items: NotificationItem[] };
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
