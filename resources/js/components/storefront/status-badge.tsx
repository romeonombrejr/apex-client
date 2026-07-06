import type { StatusBadge as StatusBadgeType } from '@/types';

export function StatusBadge({ status }: { status: StatusBadgeType }) {
    if (!status) {
        return <span className="text-sm text-muted-foreground">—</span>;
    }

    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium"
            style={{ borderColor: status.color, color: status.color }}
        >
            <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: status.color }}
            />
            {status.name}
        </span>
    );
}
