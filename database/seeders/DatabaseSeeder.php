<?php

namespace Database\Seeders;

use App\Models\SuperAdmin;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the central database (super admins + plans).
     *
     * Tenant databases are seeded separately by TenantDatabaseSeeder when a
     * tenant is provisioned (or via `php artisan tenants:seed`).
     */
    public function run(): void
    {
        $this->call(PlanSeeder::class);

        SuperAdmin::firstOrCreate(
            ['email' => 'super@example.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('super1234'),
            ]
        );
    }
}
