<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * The granular replacements for the old all-or-nothing users.manage.
     *
     * @var array<int, string>
     */
    protected array $granular = [
        'users.view',
        'users.create',
        'users.edit',
        'users.delete',
        'users.links',
        'users.reset',
        'users.impersonate',
    ];

    /**
     * Split users.manage into per-action permissions. Every role that held
     * users.manage receives all of them, so behavior is unchanged until an
     * admin unchecks boxes in the Roles editor.
     */
    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach ($this->granular as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web'], ['group' => 'users']);
        }

        $legacy = Permission::where('name', 'users.manage')->where('guard_name', 'web')->first();

        if ($legacy) {
            Role::whereHas('permissions', fn ($q) => $q->where('id', $legacy->id))
                ->get()
                ->each(fn (Role $role) => $role->givePermissionTo($this->granular));

            $legacy->delete();
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $legacy = Permission::firstOrCreate(['name' => 'users.manage', 'guard_name' => 'web'], ['group' => 'users']);

        Role::whereHas('permissions', fn ($q) => $q->whereIn('name', $this->granular))
            ->get()
            ->each(fn (Role $role) => $role->givePermissionTo($legacy));

        Permission::whereIn('name', $this->granular)->where('guard_name', 'web')->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
