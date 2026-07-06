import FormEditor from '@/components/storefront/form-editor';
import type { FieldType } from '@/types';

export default function FormsCreate({
    fieldTypes,
}: {
    fieldTypes: FieldType[];
}) {
    return <FormEditor fieldTypes={fieldTypes} />;
}
