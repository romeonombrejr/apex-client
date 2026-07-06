<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Seed the default admin permissions and grant them all to the admin role.
     */
    public function run(): void
    {
        $permissions = [
            'users.manage' => 'users',
            'roles.manage' => 'roles',
            'permissions.manage' => 'permissions',
            'settings.manage' => 'settings',
            'backup.manage' => 'backup',
            'files.manage' => 'files',
            'audit-logs.view' => 'audit-logs',
            'storefront.view' => 'storefront',
        ];

        foreach ($permissions as $name => $group) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web'], ['group' => $group]);
        }

        // Be explicit about the guard: tenant provisioning may run inside a request
        // authenticated on a different guard (e.g. the super admin), which would
        // otherwise make spatie resolve the wrong default guard here.
        Role::findByName('admin', 'web')->givePermissionTo(array_keys($permissions));
    }
}
