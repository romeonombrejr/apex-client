<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\User;
use App\Support\TenantLimits;
use Tests\TenantTestCase;

class PlanLimitTest extends TenantTestCase
{
    public function test_user_limit_reflects_the_tenants_plan()
    {
        $plan = Plan::create(['name' => 'Solo', 'slug' => 'solo', 'price' => 0, 'max_users' => 1]);

        $this->tenant->update(['plan_id' => $plan->id]);
        tenancy()->end();
        tenancy()->initialize($this->tenant->fresh());

        $this->assertFalse(TenantLimits::reachedUserLimit(), 'No users yet — limit not reached.');

        User::factory()->create();

        $this->assertTrue(TenantLimits::reachedUserLimit(), 'One user with a max of 1 — limit reached.');
    }

    public function test_no_limit_when_plan_is_unlimited()
    {
        $plan = Plan::create(['name' => 'Unlimited', 'slug' => 'unlimited', 'price' => 0, 'max_users' => null]);

        $this->tenant->update(['plan_id' => $plan->id]);
        tenancy()->end();
        tenancy()->initialize($this->tenant->fresh());

        User::factory()->count(5)->create();

        $this->assertFalse(TenantLimits::reachedUserLimit());
    }
}
