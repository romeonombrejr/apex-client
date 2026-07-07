import { router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { read, readAll } from '@/routes/notifications';
import type { NotificationItem } from '@/types';

export function NotificationBell() {
    const { notifications } = usePage().props;
    const { unread, items } = notifications;

    function openItem(item: NotificationItem) {
        const go = () => item.url && router.visit(item.url);

        if (item.read) {
            go();

            return;
        }

        router.post(
            read({ id: item.id }).url,
            {},
            { preserveScroll: true, onFinish: go },
        );
    }

    function markAll() {
        router.post(
            readAll().url,
            {},
            { preserveScroll: true, preserveState: true },
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                    <DropdownMenuLabel className="p-0">
                        Notifications
                    </DropdownMenuLabel>
                    {unread > 0 && (
                        <button
                            type="button"
                            onClick={markAll}
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
                <DropdownMenuSeparator />

                {items.length === 0 ? (
                    <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                        No notifications yet.
                    </p>
                ) : (
                    items.map((item) => (
                        <DropdownMenuItem
                            key={item.id}
                            onClick={() => openItem(item)}
                            className="flex-col items-start gap-0.5"
                        >
                            <span className="flex w-full items-center gap-2 font-medium">
                                {!item.read && (
                                    <span className="size-1.5 rounded-full bg-primary" />
                                )}
                                {item.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {item.message}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                                {item.created_at}
                            </span>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
