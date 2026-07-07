import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { OrderRef } from '@/types';

type Props = {
    orders: OrderRef[];
    selected: number[];
    onChange: (ids: number[]) => void;
};

export function OrderReferencesPicker({ orders, selected, onChange }: Props) {
    if (orders.length === 0) {
        return null;
    }

    function toggle(id: number, checked: boolean) {
        onChange(
            checked ? [...selected, id] : selected.filter((x) => x !== id),
        );
    }

    return (
        <div className="grid gap-2">
            <Label>Reference previous orders (optional)</Label>
            <div className="max-h-32 space-y-2 overflow-y-auto rounded-md border p-2">
                {orders.map((order) => (
                    <div key={order.id} className="flex items-center gap-2">
                        <Checkbox
                            id={`ref-${order.id}`}
                            checked={selected.includes(order.id)}
                            onCheckedChange={(c) =>
                                toggle(order.id, c === true)
                            }
                        />
                        <Label
                            htmlFor={`ref-${order.id}`}
                            className="font-normal"
                        >
                            {order.number} — {order.name}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
}
