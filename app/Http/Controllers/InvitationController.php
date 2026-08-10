<?php

namespace App\Http\Controllers;

use App\Models\UserInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Two-step magic-link acceptance. The GET only shows a confirmation page —
 * signing in happens on the POST behind the button, out of reach of link
 * prefetchers, antivirus scanners and chat unfurlers (which only ever GET).
 *
 * Links are reusable until they expire or are revoked/superseded, but FIRST
 * IN WINS: while the session a link signed in is still alive, any further
 * use of the link is refused. The link frees up on logout or when that
 * session goes idle past the session lifetime; the browser that holds the
 * live session can always re-open its own link.
 */
class InvitationController extends Controller
{
    /**
     * Show the accept page without touching the token.
     */
    public function show(Request $request, string $token): Response|RedirectResponse
    {
        $invitation = $this->usable($token);

        if (! $invitation) {
            return $this->invalid();
        }

        // The session that already holds this link doesn't need to sign in
        // again — send it onward.
        if ($this->isHolder($request, $invitation)) {
            return $this->onward($request);
        }

        if ($invitation->hasLiveSession()) {
            return $this->inUse();
        }

        return Inertia::render('auth/invitation-accept', [
            'token' => $token,
            'name' => $invitation->user->name,
        ]);
    }

    /**
     * Sign the user in with the link: verify their email on first use, log
     * them in, and route them onward — the set-password screen for
     * first-timers, the dashboard for everyone else. Refused while the
     * link's previous session is still alive (first in wins).
     */
    public function store(Request $request, string $token): RedirectResponse
    {
        $invitation = $this->usable($token);

        if (! $invitation) {
            return $this->invalid();
        }

        if ($this->isHolder($request, $invitation)) {
            return $this->onward($request);
        }

        if ($invitation->hasLiveSession()) {
            return $this->inUse();
        }

        $user = $invitation->user;

        // The previous session is dead (logout, idle past the lifetime, or a
        // driver we can't verify on) — clear any lingering row and take over.
        $invitation->killSession();

        // A never-activated account (no known password) must set one; an already
        // activated user is getting a passwordless sign-in link and skips straight
        // into the app.
        $isFirstTime = $user->email_verified_at === null;

        if ($isFirstTime) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        // The session lives and dies with its link: the invitation remembers
        // its (single) current session — so revoke/rotate can kill it, and a
        // later re-use replaces it — and the session carries the link's
        // identity for the enforcement middleware. Completing onboarding
        // converts the account and lifts the leash (see OnboardingController).
        $sessionId = $request->session()->getId();

        $invitation->forceFill([
            'accepted_at' => now(),
            'session_id' => $sessionId,
        ])->save();

        $request->session()->put('link_session_id', $invitation->getKey());
        // Self-copy of the bound session id: the middleware compares this
        // against the row, so a later re-use (which repoints the row at a new
        // session) orphans this one.
        $request->session()->put('link_session_bound', $sessionId);

        if (! $isFirstTime) {
            return redirect()->route('dashboard');
        }

        // Flag the fresh account so the onboarding password screen knows this is
        // a first-time set (no current-password challenge required).
        $request->session()->put('onboarding_user_id', $user->getKey());

        return redirect()->route('onboarding.password.edit');
    }

    /**
     * The invitation for this token, if it can still sign someone in.
     */
    protected function usable(string $token): ?UserInvitation
    {
        $invitation = UserInvitation::where('token', hash('sha256', $token))->first();

        if (! $invitation || ! $invitation->isUsable() || $invitation->user === null) {
            return null;
        }

        return $invitation;
    }

    /**
     * Whether the current session is the one this link signed in.
     */
    protected function isHolder(Request $request, UserInvitation $invitation): bool
    {
        $bound = $request->session()->get('link_session_bound');

        return $bound !== null
            && $bound === $invitation->session_id
            && $request->user('web')?->is($invitation->user) === true;
    }

    /**
     * Route an already-signed-in holder to wherever they left off.
     */
    protected function onward(Request $request): RedirectResponse
    {
        return redirect()->route(
            $request->session()->has('onboarding_user_id')
                ? 'onboarding.password.edit'
                : 'dashboard',
        );
    }

    protected function inUse(): RedirectResponse
    {
        return redirect()->route('login')->withErrors([
            'email' => __('This sign-in link is already in use on another device. Sign out there first, or ask your administrator for a new link.'),
        ]);
    }

    protected function invalid(): RedirectResponse
    {
        return redirect()->route('login')->withErrors([
            'email' => __('This invitation link is invalid or has expired. Ask your administrator for a new one.'),
        ]);
    }
}
