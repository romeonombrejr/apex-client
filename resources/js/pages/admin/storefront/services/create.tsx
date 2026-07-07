import ServiceEditor from '@/components/storefront/service-editor';
import type { BillingInterval, ServiceType } from '@/types';

type PageProps = {
    forms: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    types: ServiceType[];
    intervals: BillingInterval[];
};

export default function ServicesCreate({
    forms,
    categories,
    types,
    intervals,
}: PageProps) {
    return (
        <ServiceEditor
            forms={forms}
            categories={categories}
            types={types}
            intervals={intervals}
        />
    );
}
