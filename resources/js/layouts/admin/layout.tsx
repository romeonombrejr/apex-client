import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';

export default function AdminLayout({ children }: PropsWithChildren) {
    return (
        <div className="px-4 py-6">
            <div className="flex-1">
                <section className="space-y-6">{children}</section>
            </div>
        </div>
    );
}
