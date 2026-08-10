import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

/**
 * A representative slice of the UI, rendered inside the current theme so edits
 * preview live. Wrapped by the editor in `.dark` when previewing dark mode.
 */
export default function PreviewPanel() {
    return (
        <div className="space-y-6 rounded-lg border bg-background p-6 text-foreground">
            <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
            </div>

            <div className="rounded-lg border bg-card p-4 text-card-foreground">
                <h3 className="font-semibold">Card title</h3>
                <p className="text-sm text-muted-foreground">
                    Muted supporting copy inside a card surface.
                </p>
                <div className="mt-3 grid gap-2">
                    <Label htmlFor="preview-input">Email</Label>
                    <Input id="preview-input" placeholder="you@example.com" />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Acme Inc.</TableCell>
                        <TableCell>
                            <Badge variant="secondary">Active</Badge>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Globex</TableCell>
                        <TableCell>
                            <Badge variant="outline">Pending</Badge>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <div>
                <div className="mb-2 text-xs text-muted-foreground">
                    Chart colors
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <div
                            key={n}
                            className="h-8 flex-1 rounded-md"
                            style={{ backgroundColor: `var(--chart-${n})` }}
                        />
                    ))}
                </div>
            </div>

            <div className="rounded-lg border bg-sidebar p-3 text-sidebar-foreground">
                <div className="text-xs text-sidebar-foreground/70">
                    Sidebar
                </div>
                <div className="mt-1 rounded-md bg-sidebar-primary px-3 py-1.5 text-sm text-sidebar-primary-foreground">
                    Active item
                </div>
                <div className="mt-1 rounded-md px-3 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    Inactive item
                </div>
            </div>

            {/* Type samples — also force Tailwind to emit font-serif / font-mono utilities */}
            <div className="space-y-1">
                <p className="font-sans text-sm">Sans — The quick brown fox.</p>
                <p className="font-serif text-sm">
                    Serif — The quick brown fox.
                </p>
                <p className="font-mono text-sm">Mono — The quick brown fox.</p>
            </div>
        </div>
    );
}
