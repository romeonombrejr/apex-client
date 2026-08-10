import { useForm } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import UserInvitationController from '@/actions/App/Http/Controllers/Admin/UserInvitationController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { suggestCompanyFromEmail } from '@/lib/company';
import type { Role } from '@/types';

export function InviteUserDialog({ roles }: { roles: Role[] }) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        name: '',
        email: '',
        company: '',
        role: 'client' as Role,
        expires: '7d',
    });

    // Suggest the company from the email domain until the admin edits it.
    function updateEmail(value: string) {
        const followsSuggestion =
            form.data.company === '' ||
            form.data.company ===
                (suggestCompanyFromEmail(form.data.email) ?? '');

        form.setData({
            ...form.data,
            email: value,
            company: followsSuggestion
                ? (suggestCompanyFromEmail(value) ?? '')
                : form.data.company,
        });
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post(UserInvitationController.store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Invite user
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Invite a user</DialogTitle>
                        <DialogDescription>
                            Creates the account and gives you an invite link the
                            person can use to sign in and set their own password
                            — no self-registration needed.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="invite-name">Name</Label>
                            <Input
                                id="invite-name"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                required
                                placeholder="Full name"
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="invite-email">Email address</Label>
                            <Input
                                id="invite-email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) => updateEmail(e.target.value)}
                                required
                                placeholder="email@example.com"
                            />
                            <InputError message={form.errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="invite-company">
                                Company (optional)
                            </Label>
                            <Input
                                id="invite-company"
                                value={form.data.company}
                                onChange={(e) =>
                                    form.setData('company', e.target.value)
                                }
                                placeholder="Their company"
                            />
                            <InputError message={form.errors.company} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="invite-role">Role</Label>
                            <Select
                                value={form.data.role ?? 'client'}
                                onValueChange={(v) =>
                                    form.setData('role', v as Role)
                                }
                            >
                                <SelectTrigger id="invite-role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role.charAt(0).toUpperCase() +
                                                role.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.role} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="invite-expires">Link expires</Label>
                            <Select
                                value={form.data.expires}
                                onValueChange={(v) =>
                                    form.setData('expires', v)
                                }
                            >
                                <SelectTrigger id="invite-expires">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="24h">
                                        In 24 hours
                                    </SelectItem>
                                    <SelectItem value="7d">
                                        In 7 days
                                    </SelectItem>
                                    <SelectItem value="30d">
                                        In 30 days
                                    </SelectItem>
                                    <SelectItem value="never">Never</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.expires} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Create invite
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
