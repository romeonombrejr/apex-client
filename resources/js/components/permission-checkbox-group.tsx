import { useState } from 'react';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { GroupedPermissions } from '@/types';

type Props = {
    groupedPermissions: GroupedPermissions;
    defaultSelected?: string[];
    error?: string;
};

export default function PermissionCheckboxGroup({
    groupedPermissions,
    defaultSelected = [],
    error,
}: Props) {
    const [selected, setSelected] = useState<string[]>(defaultSelected);

    function toggle(name: string) {
        setSelected((prev) =>
            prev.includes(name)
                ? prev.filter((p) => p !== name)
                : [...prev, name],
        );
    }

    function toggleGroup(names: string[]) {
        const allSelected = names.every((name) => selected.includes(name));
        setSelected((prev) =>
            allSelected
                ? prev.filter((p) => !names.includes(p))
                : [...new Set([...prev, ...names])],
        );
    }

    return (
        <div className="grid gap-3">
            <Label>Permissions</Label>

            {Object.entries(groupedPermissions).map(([group, permissions]) => {
                const names = permissions.map((permission) => permission.name);
                const allSelected =
                    names.length > 0 &&
                    names.every((name) => selected.includes(name));

                return (
                    <div key={group} className="rounded-md border p-3">
                        <div className="mb-2 flex items-center gap-2">
                            <Checkbox
                                id={`group-${group}`}
                                checked={allSelected}
                                onCheckedChange={() => toggleGroup(names)}
                            />
                            <Label
                                htmlFor={`group-${group}`}
                                className="text-sm font-medium capitalize"
                            >
                                {group}
                            </Label>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {permissions.map((permission) => (
                                <div
                                    key={permission.id}
                                    className="flex items-center gap-2"
                                >
                                    <Checkbox
                                        id={`permission-${permission.id}`}
                                        name="permissions[]"
                                        value={permission.name}
                                        checked={selected.includes(
                                            permission.name,
                                        )}
                                        onCheckedChange={() =>
                                            toggle(permission.name)
                                        }
                                    />
                                    <Label
                                        htmlFor={`permission-${permission.id}`}
                                        className="text-sm font-normal"
                                    >
                                        {permission.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            <InputError message={error} />
        </div>
    );
}
