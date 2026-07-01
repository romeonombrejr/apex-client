<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TenantDatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed a freshly provisioned tenant database.
     *
     * Runs inside the tenant context (the connection is already the tenant DB),
     * so this creates the tenant's own roles, permissions, admin user and settings.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);
        $this->call(PermissionSeeder::class);

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('admin1234'),
            ]
        );

        $admin->assignRole('admin');

        // Ensure the singleton settings row exists for this tenant.
        Setting::current();
    }
}
