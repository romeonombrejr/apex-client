<?php

namespace Database\Seeders;

use App\Models\OrderStatus;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

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

        $this->seedOrderStatuses();
    }

    /**
     * Seed the default storefront order statuses. Guarded so it is a no-op on
     * tenants that pre-date the storefront tables; idempotent on re-seed.
     */
    protected function seedOrderStatuses(): void
    {
        if (! Schema::hasTable('order_statuses')) {
            return;
        }

        $statuses = [
            ['name' => 'Pending', 'color' => '#f59e0b', 'is_default' => true, 'is_completed' => false],
            ['name' => 'In Progress', 'color' => '#3b82f6', 'is_default' => false, 'is_completed' => false],
            ['name' => 'In Review', 'color' => '#8b5cf6', 'is_default' => false, 'is_completed' => false],
            ['name' => 'Completed', 'color' => '#22c55e', 'is_default' => false, 'is_completed' => true],
            ['name' => 'Cancelled', 'color' => '#ef4444', 'is_default' => false, 'is_completed' => true],
        ];

        foreach ($statuses as $position => $status) {
            OrderStatus::firstOrCreate(
                ['name' => $status['name']],
                [...$status, 'position' => $position, 'is_protected' => true],
            );
        }
    }
}
