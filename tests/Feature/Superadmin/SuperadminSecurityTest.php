<?php

namespace Tests\Feature\Superadmin;

use App\Models\SuperAdmin;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Fortify;
use PragmaRX\Google2FA\Google2FA;
use Tests\CentralTestCase;

class SuperadminSecurityTest extends CentralTestCase
{
    public function test_settings_pages_render()
    {
        $admin = $this->superAdmin();

        $this->actingAs($admin, 'superadmin')->get(route('superadmin.settings.profile.edit'))->assertOk();
        $this->actingAs($admin, 'superadmin')->get(route('superadmin.settings.security.edit'))->assertOk();
    }

    public function test_super_admin_can_update_their_profile()
    {
        $admin = $this->superAdmin();

        $this->actingAs($admin, 'superadmin')
            ->patch(route('superadmin.settings.profile.update'), [
                'name' => 'Renamed',
                'email' => 'renamed@test.com',
            ])
            ->assertRedirect(route('superadmin.settings.profile.edit'));

        $admin->refresh();
        $this->assertSame('Renamed', $admin->name);
        $this->assertSame('renamed@test.com', $admin->email);
    }

    public function test_super_admin_can_change_their_password()
    {
        $admin = $this->superAdmin();

        $this->actingAs($admin, 'superadmin')
            ->put(route('superadmin.settings.password.update'), [
                'current_password' => 'password',
                'password' => 'new-password-123',
                'password_confirmation' => 'new-password-123',
            ])
            ->assertSessionHasNoErrors();

        $this->assertTrue(Hash::check('new-password-123', $admin->fresh()->password));
    }

    public function test_wrong_current_password_is_rejected()
    {
        $admin = $this->superAdmin();

        $this->actingAs($admin, 'superadmin')
            ->put(route('superadmin.settings.password.update'), [
                'current_password' => 'wrong',
                'password' => 'new-password-123',
                'password_confirmation' => 'new-password-123',
            ])
            ->assertSessionHasErrors('current_password');
    }

    public function test_super_admin_can_enable_and_confirm_two_factor()
    {
        $admin = $this->superAdmin();

        // Enable → secret generated, still pending (unconfirmed).
        $this->actingAs($admin, 'superadmin')->post(route('superadmin.two-factor.enable'));

        $admin->refresh();
        $this->assertNotNull($admin->two_factor_secret);
        $this->assertFalse($admin->hasEnabledTwoFactorAuthentication());

        // Confirm with a valid TOTP code.
        $code = $this->currentOtp($admin);

        $this->actingAs($admin, 'superadmin')
            ->post(route('superadmin.two-factor.confirm'), ['code' => $code])
            ->assertSessionHasNoErrors();

        $this->assertTrue($admin->fresh()->hasEnabledTwoFactorAuthentication());
    }

    public function test_login_defers_to_two_factor_challenge_when_enabled()
    {
        $admin = $this->enableTwoFactor($this->superAdmin());

        // Password step should NOT authenticate; it defers to the challenge.
        $this->post(route('superadmin.login.store'), [
            'email' => $admin->email,
            'password' => 'password',
        ])->assertRedirect(route('superadmin.two-factor.login'));

        $this->assertGuest('superadmin');
        $this->assertNotNull(session('superadmin.2fa'));

        // Completing the challenge logs in.
        $this->post(route('superadmin.two-factor.login.store'), [
            'code' => $this->currentOtp($admin),
        ])->assertRedirect(route('superadmin.dashboard'));

        $this->assertAuthenticatedAs($admin, 'superadmin');
    }

    public function test_super_admin_can_disable_two_factor()
    {
        $admin = $this->enableTwoFactor($this->superAdmin());

        $this->actingAs($admin, 'superadmin')->delete(route('superadmin.two-factor.disable'));

        $this->assertFalse($admin->fresh()->hasEnabledTwoFactorAuthentication());
    }

    protected function enableTwoFactor(SuperAdmin $admin): SuperAdmin
    {
        $admin->forceFill([
            'two_factor_secret' => Fortify::currentEncrypter()->encrypt((new Google2FA)->generateSecretKey()),
            'two_factor_recovery_codes' => Fortify::currentEncrypter()->encrypt(json_encode(['AAAA-BBBB'])),
            'two_factor_confirmed_at' => now(),
        ])->save();

        return $admin;
    }

    protected function currentOtp(SuperAdmin $admin): string
    {
        $secret = Fortify::currentEncrypter()->decrypt($admin->two_factor_secret);

        return (new Google2FA)->getCurrentOtp($secret);
    }
}
