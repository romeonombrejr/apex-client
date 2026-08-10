<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TenantTestCase;

class UserCreateTest extends TenantTestCase
{
    protected function admin(): User
    {
        Permission::firstOrCreate(['name' => 'users.create', 'guard_name' => 'web']);
        $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $role->givePermissionTo('users.create');

        return User::factory()->create()->assignRole('admin');
    }

    /**
     * @return array<string, string>
     */
    protected function payload(array $overrides = []): array
    {
        Role::firstOrCreate(['name' => 'client', 'guard_name' => 'web']);

        return array_merge([
            'name' => 'New Person',
            'email' => 'new@example.com',
            'company' => 'Acme',
            'password' => 'a-strong-password-123',
            'password_confirmation' => 'a-strong-password-123',
            'role' => 'client',
        ], $overrides);
    }

    public function test_company_is_now_required()
    {
        $this->actingAs($this->admin())
            ->post(route('admin.users.store'), $this->payload(['company' => '']))
            ->assertSessionHasErrors('company');

        $this->assertNull(User::where('email', 'new@example.com')->first());
    }

    public function test_creating_a_user_with_a_company_works()
    {
        $this->actingAs($this->admin())
            ->post(route('admin.users.store'), $this->payload())
            ->assertRedirect();

        $user = User::where('email', 'new@example.com')->first();
        $this->assertNotNull($user);
        $this->assertSame('Acme', $user->company);
    }
}
