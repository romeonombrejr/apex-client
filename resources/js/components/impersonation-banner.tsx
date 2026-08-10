import { router, usePage } from '@inertiajs/react';
import { UserRoundCog } from 'lucide-react';
import TenantImpersonationController from '@/actions/App/Http/Controllers/TenantImpersonationController';

export function ImpersonationBanner() {
    const { impersonating } = usePage().props;

    if (!impersonating) {
        return null;
    }

    return (
        <div className="flex items-center justify-center gap-3 border-b border-sky-300 bg-sky-200 px-4 py-2 text-center text-sm font-medium text-sky-950 dark:border-sky-800 dark:bg-sky-900 dark:text-sky-50">
            <UserRoundCog className="h-4 w-4 shrink-0" />
            <span>
                You are viewing the app as <strong>{impersonating.name}</strong>
                .
            </span>
            <button
                type="button"
                onClick={() =>
                    router.post(TenantImpersonationController.leave.url())
                }
                className="font-semibold underline underline-offset-2 hover:no-underline"
            >
                Exit impersonation
            </button>
        </div>
    );
}
