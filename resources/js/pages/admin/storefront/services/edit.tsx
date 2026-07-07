import ServiceEditor from '@/components/storefront/service-editor';
import type { BillingInterval, ServiceType } from '@/types';

type PageProps = {
    service: {
        id: number;
        name: string;
        description: string | null;
        type: ServiceType;
        billing_interval: BillingInterval | null;
        price: number;
        form_id: number | null;
        service_category_id: number | null;
        is_active: boolean;
        position: number;
        image_url: string | null;
    };
    forms: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    types: ServiceType[];
    intervals: BillingInterval[];
};

export default function ServicesEdit({
    service,
    forms,
    categories,
    types,
    intervals,
}: PageProps) {
    return (
        <ServiceEditor
            service={service}
            forms={forms}
            categories={categories}
            types={types}
            intervals={intervals}
        />
    );
}
