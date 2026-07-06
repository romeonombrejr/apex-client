import { Head } from '@inertiajs/react';
import { Store } from 'lucide-react';

type PageProps = {
    suite: {
        name: string;
        description: string;
        icon: string;
        permission: string;
    };
};

export default function StorefrontIndex({ suite }: PageProps) {
    return (
        <>
            <Head title={suite.name} />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">{suite.name}</h1>
                <p className="text-sm text-muted-foreground">
                    {suite.description}
                </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-20 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Store className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <p className="font-medium">Storefront is enabled</p>
                    <p className="max-w-md text-sm text-muted-foreground">
                        This suite is active for your workspace. Products,
                        ordering, and the client portal are coming soon.
                    </p>
                </div>
            </div>
        </>
    );
}
