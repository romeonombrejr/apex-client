import type { Auth } from '@/types/auth';
import type { SettingFormData } from '@/types';
import type { ThemePayload } from '@/lib/apply-theme';

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
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
