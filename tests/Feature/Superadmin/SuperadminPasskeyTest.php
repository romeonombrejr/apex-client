<?php

namespace Tests\Feature\Superadmin;

use App\Models\SuperAdmin;
use App\Models\SuperAdminPasskey;
use Tests\CentralTestCase;

class SuperadminPasskeyTest extends CentralTestCase
{
    public function test_registration_options_are_generated_for_the_super_admin()
    {
        $this->actingAs($this->superAdmin(), 'superadmin')
            ->getJson(route('superadmin.passkeys.register.options'))
            ->assertOk()
            ->assertJsonStructure(['options' => ['challenge', 'rp', 'user']]);
    }

    public function test_login_options_are_available_to_guests()
    {
        $this->getJson(route('superadmin.passkeys.login.options'))
            ->assertOk()
            ->assertJsonStructure(['options' => ['challenge']]);
    }

    public function test_super_admin_can_delete_their_passkey()
    {
        $admin = $this->superAdmin();
        $passkey = $this->makePasskey($admin->id);

        $this->actingAs($admin, 'superadmin')
            ->delete(route('superadmin.passkeys.destroy', $passkey))
            ->assertRedirect();

        $this->assertDatabaseMissing('super_admin_passkeys', ['id' => $passkey->id]);
    }

    public function test_super_admin_cannot_delete_another_admins_passkey()
    {
        $other = SuperAdmin::create([
            'name' => 'Other',
            'email' => 'other@test.com',
            'password' => bcrypt('password'),
        ]);
        $passkey = $this->makePasskey($other->id);

        $this->actingAs($this->superAdmin(), 'superadmin')
            ->delete(route('superadmin.passkeys.destroy', $passkey))
            ->assertForbidden();

        $this->assertDatabaseHas('super_admin_passkeys', ['id' => $passkey->id]);
    }

    protected function makePasskey(int $superAdminId): SuperAdminPasskey
    {
        return SuperAdminPasskey::create([
            'super_admin_id' => $superAdminId,
            'name' => 'Test key',
            'credential_id' => 'abc123',
            'credential' => ['type' => 'public-key'],
        ]);
    }
}
