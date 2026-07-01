<?php

namespace Tests\Feature\Superadmin;

use Tests\CentralTestCase;

class SuperadminAuthTest extends CentralTestCase
{
    public function test_login_screen_can_be_rendered()
    {
        $this->get(route('superadmin.login'))->assertOk();
    }

    public function test_super_admin_can_authenticate()
    {
        $admin = $this->superAdmin();

        $response = $this->post(route('superadmin.login.store'), [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('superadmin.dashboard'));
        $this->assertAuthenticatedAs($admin, 'superadmin');
    }

    public function test_super_admin_cannot_authenticate_with_wrong_password()
    {
        $admin = $this->superAdmin();

        $this->post(route('superadmin.login.store'), [
            'email' => $admin->email,
            'password' => 'nope',
        ])->assertSessionHasErrors('email');

        $this->assertGuest('superadmin');
    }

    public function test_dashboard_requires_authentication()
    {
        $this->get(route('superadmin.dashboard'))->assertRedirect(route('superadmin.login'));
    }

    public function test_super_admin_can_view_dashboard()
    {
        $this->actingAs($this->superAdmin(), 'superadmin')
            ->get(route('superadmin.dashboard'))
            ->assertOk();
    }

    public function test_tenant_login_route_is_not_available_on_central_domain()
    {
        // Fortify's /login is scoped to tenant domains; on central it 404s.
        $this->get('http://localhost/login')->assertNotFound();
    }
}
