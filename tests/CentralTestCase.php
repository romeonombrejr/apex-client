<?php

namespace Tests;

use App\Models\SuperAdmin;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Base class for central / super-admin feature tests.
 *
 * Runs on the central domain (no tenant context). Uses the same unified test
 * schema so central tables (tenants, plans, super_admins, …) are available.
 */
abstract class CentralTestCase extends TestCase
{
    use RefreshDatabase;

    /**
     * Defined here (on the class that uses RefreshDatabase) so it overrides the
     * trait's version; delegates to the shared unified schema.
     *
     * @return array<string, mixed>
     */
    protected function migrateFreshUsing()
    {
        return ['--path' => $this->unifiedMigrationPaths()];
    }

    protected function superAdmin(): SuperAdmin
    {
        return SuperAdmin::create([
            'name' => 'Super Admin',
            'email' => 'super@test.com',
            'password' => bcrypt('password'),
        ]);
    }
}
