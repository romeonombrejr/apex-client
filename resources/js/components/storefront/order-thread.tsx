import { router, usePage } from '@inertiajs/react';
import { Paperclip } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { OrderMessage } from '@/types';

type Props = {
    messages: OrderMessage[];
    postUrl: string;
};

export function OrderThread({ messages, postUrl }: Props) {
    const { auth } = usePage().props;
    const currentUserId = auth.user?.id;

    const [body, setBody] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [sending, setSending] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);

    function send() {
        if (body.trim() === '') {
            return;
        }

        const fd = new FormData();
        fd.append('body', body);

        if (file) {
            fd.append('attachment', file);
        }

        router.post(postUrl, fd, {
            forceFormData: true,
            preserveScroll: true,
            onStart: () => setSending(true),
            onFinish: () => setSending(false),
            onSuccess: () => {
                setBody('');
                setFile(null);

                if (fileInput.current) {
                    fileInput.current.value = '';
                }
            },
        });
    }

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No messages yet.
                    </p>
                ) : (
                    messages.map((message) => {
                        const mine = message.author_id === currentUserId;

                        return (
                            <div
                                key={message.id}
                                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                        mine
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                    }`}
                                >
                                    <div className="mb-0.5 flex items-center gap-2 text-xs opacity-80">
                                        <span className="font-medium">
                                            {message.author}
                                        </span>
                                        <span>{message.created_at}</span>
                                    </div>
                                    <p className="whitespace-pre-wrap">
                                        {message.body}
                                    </p>
                                    {message.attachment_url && (
                                        <a
                                            href={message.attachment_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 inline-flex items-center gap-1 text-xs underline"
                                        >
                                            <Paperclip className="h-3 w-3" />
                                            {message.attachment_name}
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="space-y-2 border-t pt-4">
                <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write a message…"
                    rows={3}
                />
                <div className="flex items-center justify-between">
                    <input
                        ref={fileInput}
                        type="file"
                        className="text-xs"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                    <Button
                        onClick={send}
                        disabled={sending || body.trim() === ''}
                    >
                        Send
                    </Button>
                </div>
            </div>
        </div>
    );
}
