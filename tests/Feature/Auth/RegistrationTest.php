<?php

namespace Tests\Feature\Auth;

use Laravel\Fortify\Features;
use Tests\TenantTestCase;

class RegistrationTest extends TenantTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyHas(Features::registration());
    }

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            // Self-registered accounts must state their company (invited
            // accounts provide it during onboarding instead).
            'company' => 'Acme',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $this->assertSame('Acme', auth()->user()->company);
        $response->assertRedirect(route('dashboard', absolute: false));
    }
}
