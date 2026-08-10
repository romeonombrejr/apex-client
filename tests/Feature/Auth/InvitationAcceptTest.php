<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\UserInvitation;
use Tests\TenantTestCase;

class InvitationAcceptTest extends TenantTestCase
{
    /**
     * Issue an invitation and return [user, plaintext token].
     *
     * @return array{0: User, 1: string}
     */
    protected function issue(bool $activated = false): array
    {
        $user = $activated
            ? User::factory()->create()
            : User::factory()->unverified()->create();

        $url = UserInvitation::issue($user);

        return [$user, basename(parse_url($url, PHP_URL_PATH))];
    }

    public function test_the_get_shows_the_confirmation_page_without_consuming_the_token()
    {
        [, $token] = $this->issue();

        $this->get(route('invitations.accept', $token))->assertOk();
        // Even repeatedly — scanners and prefetchers can hit it all day.
        $this->get(route('invitations.accept', $token))->assertOk();

        $this->assertNull(UserInvitation::sole()->accepted_at);
        $this->assertGuest();
    }

    public function test_a_declared_prefetch_get_does_not_consume_the_token_either()
    {
        [, $token] = $this->issue();

        $this->withHeaders(['Sec-Purpose' => 'prefetch'])
            ->get(route('invitations.accept', $token))
            ->assertOk();

        $this->assertNull(UserInvitation::sole()->accepted_at);
    }

    public function test_the_post_signs_in_a_first_time_user_and_routes_to_onboarding()
    {
        [$user, $token] = $this->issue();

        $this->post(route('invitations.accept.store', $token))
            ->assertRedirect(route('onboarding.password.edit'));

        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertNotNull(UserInvitation::sole()->accepted_at);
    }

    public function test_the_post_signs_an_activated_user_straight_into_the_app()
    {
        [$user, $token] = $this->issue(activated: true);

        $this->post(route('invitations.accept.store', $token))
            ->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_the_link_is_reusable_and_each_use_takes_over_the_session()
    {
        [$user, $token] = $this->issue(activated: true);

        $this->post(route('invitations.accept.store', $token));
        $firstSession = UserInvitation::sole()->session_id;
        auth()->logout();

        // Re-using the link signs in again — and the row now points at the
        // NEW session (the previous one is replaced, not joined).
        $this->post(route('invitations.accept.store', $token))
            ->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user);
        $this->assertNotSame($firstSession, UserInvitation::sole()->session_id);
    }

    public function test_a_bogus_token_bounces_to_login_with_an_error()
    {
        $this->get(route('invitations.accept', 'nope'))
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');
        $this->post(route('invitations.accept.store', 'nope'))
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }
}
