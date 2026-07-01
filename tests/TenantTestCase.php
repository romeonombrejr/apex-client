<?php

namespace Tests;

use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Stancl\Tenancy\Database\Models\Domain;

/**
 * Base class for tenant-side feature tests.
 *
 * Runs each test inside an initialized tenant context on a tenant domain, so
 * routes registered in routes/tenant.php resolve and User/Setting/etc. are
 * available. The database-switching bootstrapper is disabled so the unified
 * test schema (see TestCase::migrateFreshUsing) is used as the tenant database —
 * this exercises routing, middleware, auth, permissions and plan limits without
 * the cost of provisioning a physical database per test.
 */
abstract class TenantTestCase extends TestCase
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

    protected string $tenantDomain = 'tenant.test';

    protected Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        // Keep a single connection: initialize tenancy for context/routing only.
        config(['tenancy.bootstrappers' => []]);

        $this->tenant = Tenant::withoutEvents(function () {
            $tenant = Tenant::create([
                'id' => 'test',
                'name' => 'Test Tenant',
                'status' => 'active',
            ]);

            Domain::create([
                'domain' => $this->tenantDomain,
                'tenant_id' => $tenant->id,
            ]);

            return $tenant;
        });

        tenancy()->initialize($this->tenant);

        // Make route() / redirects target the tenant domain.
        URL::forceRootUrl('http://'.$this->tenantDomain);
    }

    protected function tearDown(): void
    {
        if (tenancy()->initialized) {
            tenancy()->end();
        }

        parent::tearDown();
    }
}
