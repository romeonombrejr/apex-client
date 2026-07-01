<?php

namespace Tests\Feature\Superadmin;

use App\Models\Plan;
use App\Models\Tenant;
use Stancl\Tenancy\Database\Models\Domain;
use Tests\CentralTestCase;

class TenantManagementTest extends CentralTestCase
{
    /**
     * Create a tenant record without firing the provisioning pipeline
     * (no real database is created for these controller-level tests).
     */
    protected function makeTenant(string $id = 'acme', array $attributes = []): Tenant
    {
        return Tenant::withoutEvents(function () use ($id, $attributes) {
            $tenant = Tenant::create(array_merge([
                'id' => $id,
                'name' => 'Acme',
                'status' => 'active',
            ], $attributes));

            Domain::create(['domain' => $id.'.test', 'tenant_id' => $tenant->id]);

            return $tenant;
        });
    }

    public function test_super_admin_can_list_tenants()
    {
        $this->makeTenant();

        $this->actingAs($this->superAdmin(), 'superadmin')
            ->get(route('superadmin.tenants.index'))
            ->assertOk();
    }

    public function test_super_admin_can_suspend_and_resume_a_tenant()
    {
        $tenant = $this->makeTenant();
        $admin = $this->superAdmin();

        $this->actingAs($admin, 'superadmin')
            ->post(route('superadmin.tenants.suspend', $tenant))
            ->assertStatus(302);

        $this->assertSame('suspended', $tenant->fresh()->status);

        $this->actingAs($admin, 'superadmin')
            ->post(route('superadmin.tenants.resume', $tenant))
            ->assertStatus(302);

        $this->assertSame('active', $tenant->fresh()->status);
    }

    public function test_super_admin_can_create_a_plan()
    {
        $this->actingAs($this->superAdmin(), 'superadmin')
            ->post(route('superadmin.plans.store'), [
                'name' => 'Starter',
                'slug' => 'starter',
                'price' => 10,
                'max_users' => 5,
                'max_storage_mb' => 500,
                'is_active' => true,
            ])
            ->assertRedirect(route('superadmin.plans.index'));

        $this->assertDatabaseHas('plans', ['slug' => 'starter', 'max_users' => 5]);
    }

    public function test_cannot_delete_a_plan_that_still_has_tenants()
    {
        $plan = Plan::create(['name' => 'Pro', 'slug' => 'pro', 'price' => 20, 'max_users' => 10]);
        $this->makeTenant('withplan', ['plan_id' => $plan->id]);

        $this->actingAs($this->superAdmin(), 'superadmin')
            ->delete(route('superadmin.plans.destroy', $plan))
            ->assertStatus(422);

        $this->assertDatabaseHas('plans', ['id' => $plan->id]);
    }
}
