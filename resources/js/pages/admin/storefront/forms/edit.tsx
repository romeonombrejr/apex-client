import FormEditor from '@/components/storefront/form-editor';
import type { FieldInput, FieldType } from '@/types';

type PageProps = {
    form: {
        id: number;
        name: string;
        description: string | null;
        fields: FieldInput[];
    };
    fieldTypes: FieldType[];
};

export default function FormsEdit({ form, fieldTypes }: PageProps) {
    return <FormEditor form={form} fieldTypes={fieldTypes} />;
}
