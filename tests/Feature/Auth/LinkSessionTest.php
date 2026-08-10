<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TenantTestCase;

class LinkSessionTest extends TenantTestCase
{
    /**
     * Accept a fresh link for the user (real HTTP flow) and return the
     * invitation row.
     */
    protected function acceptLink(User $user, ?\DateTimeInterface $expiresAt = null): UserInvitation
    {
        $url = UserInvitation::issue($user, null, $expiresAt);
        $token = basename(parse_url($url, PHP_URL_PATH));

        $this->post(route('invitations.accept.store', $token));

        return UserInvitation::sole();
    }

    public function test_accepting_records_the_session_on_the_invitation()
    {
        $invitation = $this->acceptLink(User::factory()->create());

        $this->assertAuthenticated();
        $this->assertNotNull($invitation->session_id);
        $this->assertSame(session()->getId(), $invitation->session_id);
    }

    public function test_the_session_dies_when_the_link_expires()
    {
        $user = User::factory()->create();
        $this->acceptLink($user, now()->addHour());

        $this->get(route('dashboard'))->assertOk(); // in — not bounced to login
        $this->assertAuthenticated();

        $this->travel(2)->hours();

        $this->get(route('dashboard'))
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_the_session_dies_when_the_link_row_disappears()
    {
        $this->acceptLink(User::factory()->create(), now()->addDays(30));
        $this->assertAuthenticated();

        // Revocation and rotation both end with the row gone.
        UserInvitation::query()->delete();

        $this->get(route('dashboard'))->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_minting_a_new_link_supersedes_the_old_sessions()
    {
        $user = User::factory()->create();
        $this->acceptLink($user, now()->addDays(30));
        $this->assertAuthenticated();

        UserInvitation::issue($user, null, now()->addDay());

        $this->get(route('dashboard'))->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_completing_onboarding_lifts_the_leash()
    {
        Role::firstOrCreate(['name' => 'client', 'guard_name' => 'web']);
        $user = User::factory()->unverified()->create(['company' => null]);
        $user->assignRole('client');

        $this->acceptLink($user, now()->addDays(7));

        $this->post(route('onboarding.password.update'), [
            'company' => 'Acme',
            'password' => 'brand-new-secret-123',
            'password_confirmation' => 'brand-new-secret-123',
        ])->assertRedirect(route('dashboard'));

        $this->travel(30)->days();

        // A client's dashboard renders (200) — no kick to login.
        $this->get(route('dashboard'))->assertOk();
        $this->assertAuthenticated();
        $this->assertSame(0, UserInvitation::count());
    }

    /**
     * Point the invitation at a foreign session, optionally backing it with
     * a live (or stale) row in the sessions table so hasLiveSession() can
     * see it. The lock only engages on the database session driver.
     */
    protected function bindForeignSession(UserInvitation $invitation, ?int $lastActivity): void
    {
        config(['session.driver' => 'database']);

        $invitation->forceFill([
            'accepted_at' => now(),
            'session_id' => 'foreign-session',
        ])->save();

        if ($lastActivity !== null) {
            DB::table('sessions')->insert([
                'id' => 'foreign-session',
                'payload' => '',
                'last_activity' => $lastActivity,
            ]);
        }
    }

    public function test_a_second_device_is_refused_while_the_links_session_is_live()
    {
        $user = User::factory()->create();
        $url = UserInvitation::issue($user, null, now()->addDays(30));
        $token = basename(parse_url($url, PHP_URL_PATH));

        // Someone else is signed in with this link right now.
        $this->bindForeignSession(UserInvitation::sole(), now()->getTimestamp());

        $this->get(route('invitations.accept', $token))
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');

        $this->post(route('invitations.accept.store', $token))
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');

        $this->assertGuest();
        // The holder keeps the link — nothing was taken over.
        $this->assertSame('foreign-session', UserInvitation::sole()->session_id);
    }

    public function test_the_link_frees_up_once_the_previous_session_goes_idle()
    {
        $user = User::factory()->create();
        $url = UserInvitation::issue($user, null, now()->addDays(30));
        $token = basename(parse_url($url, PHP_URL_PATH));

        // The previous session idled out past the session lifetime.
        $this->bindForeignSession(
            UserInvitation::sole(),
            now()->subMinutes((int) config('session.lifetime') + 10)->getTimestamp(),
        );

        $this->post(route('invitations.accept.store', $token))
            ->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user);
        $this->assertNotSame('foreign-session', UserInvitation::sole()->session_id);
    }

    public function test_the_link_frees_up_once_the_previous_session_is_gone()
    {
        $user = User::factory()->create();
        $url = UserInvitation::issue($user, null, now()->addDays(30));
        $token = basename(parse_url($url, PHP_URL_PATH));

        // Logout destroyed the session row; only the stale pointer remains.
        $this->bindForeignSession(UserInvitation::sole(), null);

        $this->post(route('invitations.accept.store', $token))
            ->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_the_holder_can_reopen_their_own_link()
    {
        $user = User::factory()->create();
        $url = UserInvitation::issue($user, null, now()->addDays(30));
        $token = basename(parse_url($url, PHP_URL_PATH));

        $this->post(route('invitations.accept.store', $token));
        $boundSession = UserInvitation::sole()->session_id;
        $this->assertAuthenticated();

        // Clicking the same link again in the same browser: straight back in,
        // no refusal, no new session bound.
        $this->get(route('invitations.accept', $token))
            ->assertRedirect(route('dashboard'));
        $this->post(route('invitations.accept.store', $token))
            ->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user);
        $this->assertSame($boundSession, UserInvitation::sole()->session_id);
    }

    public function test_a_session_replaced_by_a_newer_use_is_kicked()
    {
        $this->acceptLink(User::factory()->create(), now()->addDays(30));
        $this->assertAuthenticated();

        // Someone (the same person on another device) re-used the link: the
        // row now points at a different session. Ours is no longer current.
        UserInvitation::sole()->forceFill(['session_id' => 'a-newer-session'])->save();

        $this->get(route('dashboard'))->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_never_expiring_link_sessions_survive_until_revoked()
    {
        $this->acceptLink(User::factory()->create(), null);

        $this->travel(100)->days();

        $this->get(route('dashboard'))->assertOk();
        $this->assertAuthenticated();
    }

    public function test_revoke_removes_consumed_links_too()
    {
        Permission::firstOrCreate(['name' => 'users.links', 'guard_name' => 'web']);
        $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $role->givePermissionTo('users.links');
        $admin = User::factory()->create()->assignRole('admin');

        $target = User::factory()->create();
        UserInvitation::issue($target, null, now()->addDay());
        UserInvitation::sole()->forceFill([
            'accepted_at' => now(),
            'session_id' => 'some-session-id',
        ])->save();

        $this->actingAs($admin)
            ->delete(route('admin.users.link.revoke', $target))
            ->assertRedirect();

        $this->assertSame(0, UserInvitation::count());
    }
}
