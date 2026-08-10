<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TenantTestCase;

class PasswordResetLinkTest extends TenantTestCase
{
    protected function admin(): User
    {
        Permission::firstOrCreate(['name' => 'users.reset', 'guard_name' => 'web']);
        $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $role->givePermissionTo('users.reset');

        return User::factory()->create()->assignRole('admin');
    }

    public function test_requires_permission()
    {
        $target = User::factory()->create();

        $this->actingAs(User::factory()->create())
            ->post(route('admin.users.reset-link', $target))
            ->assertForbidden();
    }

    public function test_issues_a_reset_token_for_an_activated_user()
    {
        $target = User::factory()->create();

        $this->actingAs($this->admin())
            ->post(route('admin.users.reset-link', $target))
            ->assertRedirect(route('admin.users.index'));

        $this->assertTrue(
            DB::table('password_reset_tokens')->where('email', $target->email)->exists(),
        );
    }

    public function test_rejects_a_not_yet_activated_user()
    {
        $target = User::factory()->unverified()->create();

        $this->actingAs($this->admin())
            ->post(route('admin.users.reset-link', $target))
            ->assertBadRequest();

        $this->assertFalse(
            DB::table('password_reset_tokens')->where('email', $target->email)->exists(),
        );
    }
}
