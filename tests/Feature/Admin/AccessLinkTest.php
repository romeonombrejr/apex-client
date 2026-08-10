<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TenantTestCase;

class AccessLinkTest extends TenantTestCase
{
    protected function admin(): User
    {
        Permission::firstOrCreate(['name' => 'users.links', 'guard_name' => 'web']);
        $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $role->givePermissionTo('users.links');

        return User::factory()->create()->assignRole('admin');
    }

    public function test_expiry_presets_are_stored()
    {
        $this->freezeTime();
        $target = User::factory()->create();

        $this->actingAs($this->admin())
            ->post(route('admin.users.link', $target), ['expires' => '30d'])
            ->assertRedirect();

        $this->assertSame(
            now()->addDays(30)->toDateTimeString(),
            UserInvitation::sole()->expires_at->toDateTimeString(),
        );
    }

    public function test_never_stores_a_null_expiry()
    {
        $target = User::factory()->create();

        $this->actingAs($this->admin())
            ->post(route('admin.users.link', $target), ['expires' => 'never'])
            ->assertRedirect();

        $this->assertNull(UserInvitation::sole()->expires_at);
    }

    public function test_defaults_are_24h_for_signin_links_and_7d_for_invites()
    {
        $this->freezeTime();
        $activated = User::factory()->create();
        $pending = User::factory()->unverified()->create();
        $admin = $this->admin();

        $this->actingAs($admin)->post(route('admin.users.link', $activated));
        $this->assertSame(
            now()->addDay()->toDateTimeString(),
            $activated->invitations()->sole()->expires_at->toDateTimeString(),
        );

        $this->actingAs($admin)->post(route('admin.users.link', $pending));
        $this->assertSame(
            now()->addDays(7)->toDateTimeString(),
            $pending->invitations()->sole()->expires_at->toDateTimeString(),
        );
    }

    public function test_a_bogus_preset_is_rejected()
    {
        $target = User::factory()->create();

        $this->actingAs($this->admin())
            ->post(route('admin.users.link', $target), ['expires' => '99y'])
            ->assertSessionHasErrors('expires');

        $this->assertSame(0, UserInvitation::count());
    }

    public function test_revoke_deletes_the_pending_link()
    {
        $target = User::factory()->create();
        UserInvitation::issue($target);

        $this->actingAs($this->admin())
            ->delete(route('admin.users.link.revoke', $target))
            ->assertRedirect();

        $this->assertSame(0, UserInvitation::count());
    }

    public function test_issuing_prunes_expired_links_of_other_users()
    {
        $stale = User::factory()->create();
        UserInvitation::issue($stale, null, now()->subDay());

        $target = User::factory()->create();
        UserInvitation::issue($target);

        $this->assertSame(0, $stale->invitations()->count());
        $this->assertSame(1, UserInvitation::count());
    }

    public function test_the_active_link_url_is_recoverable_but_encrypted_at_rest()
    {
        $target = User::factory()->create();
        $url = UserInvitation::issue($target);

        // The roster can re-surface the exact same URL…
        $this->assertSame($url, UserInvitation::sole()->url());

        // …but the raw column never holds the plaintext token.
        $plain = basename(parse_url($url, PHP_URL_PATH));
        $raw = DB::table('user_invitations')->sole();
        $this->assertStringNotContainsString($plain, (string) $raw->plain_token);
        $this->assertSame(hash('sha256', $plain), $raw->token);
    }

    public function test_an_expired_link_bounces_to_login()
    {
        $target = User::factory()->create();
        $url = UserInvitation::issue($target, null, now()->addHour());

        $this->travel(2)->hours();

        $this->get($url)
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');
    }
}
