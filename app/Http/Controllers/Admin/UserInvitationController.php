<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreInvitationRequest;
use App\Models\User;
use App\Models\UserInvitation;
use App\Support\TenantLimits;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class UserInvitationController extends Controller
{
    /**
     * Create a not-yet-activated user and issue a magic-link invitation. The
     * client is created immediately (so it shows in the roster and can receive
     * credits) with an unusable random password and an unverified email; the
     * link both verifies them and lets them set their own password.
     */
    public function store(StoreInvitationRequest $request): RedirectResponse
    {
        if (TenantLimits::reachedUserLimit()) {
            throw ValidationException::withMessages([
                'email' => __('Your plan\'s user limit (:max) has been reached. Upgrade to add more users.', ['max' => TenantLimits::maxUsers()]),
            ]);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'company' => $request->company,
            'password' => Hash::make(Str::random(40)),
        ]);

        $user->assignRole($request->role);

        $this->issueAndFlash($user, $request->input('expires'));

        activity()->causedBy($request->user())->performedOn($user)->log('Invited user.');

        return to_route('admin.users.index');
    }

    /**
     * Issue an access link for any existing user and flash it for copying. The
     * behaviour adapts to the user's state (decided at accept time):
     *  - not yet activated → an onboarding invite that sets a password;
     *  - already activated → a passwordless sign-in link.
     * This is the "get this person into the app" primitive — no credentials
     * handed out, no mail server required. The admin picks the validity
     * window (24h / 7d / 30d / never); defaults are 24h for sign-in links
     * and 7d for invites.
     */
    public function link(User $user): RedirectResponse
    {
        $activated = $user->email_verified_at !== null;

        request()->validate(['expires' => ['nullable', 'in:24h,7d,30d,never']]);

        $this->issueAndFlash($user, request()->input('expires'));

        activity()->causedBy(request()->user())->performedOn($user)
            ->log($activated ? 'Issued sign-in link.' : 'Re-sent invitation.');

        return to_route('admin.users.index');
    }

    /**
     * Revoke the user's link without minting a new one. For an unused link
     * this prevents entry; for a consumed one it also ends the session it
     * created — immediately via the direct session delete, and on the next
     * request via the enforcement middleware once the row is gone.
     */
    public function revoke(User $user): RedirectResponse
    {
        $user->invitations->each->killSession();
        $user->invitations()->delete();

        activity()->causedBy(request()->user())->performedOn($user)->log('Revoked access link.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Access link revoked.')]);

        return to_route('admin.users.index');
    }

    /**
     * Issue a password reset link for an activated user and flash it for
     * copying — the admin plays courier instead of a mail server. Uses the
     * standard Laravel password broker, so the link is single-use, superseded
     * by newer ones, and expires per auth.passwords.users.expire. Not-yet-
     * activated users have no password to reset — they get invite links.
     */
    public function resetLink(User $user): RedirectResponse
    {
        abort_if($user->email_verified_at === null, 400, 'This user has not activated their account yet — send them an invite link instead.');

        $url = URL::route('password.reset', [
            'token' => Password::createToken($user),
            'email' => $user->getEmailForPasswordReset(),
        ]);

        Inertia::flash('invite', [
            'url' => $url,
            'email' => $user->email,
            'mode' => 'reset',
        ]);

        activity()->causedBy(request()->user())->performedOn($user)->log('Issued password reset link.');

        return to_route('admin.users.index');
    }

    /**
     * Mint a fresh link for the user and flash it to the next page. `mode`
     * lets the UI word the dialog; `expires` carries the validity label
     * (null = never). Links stay single-use and superseded on re-mint.
     */
    protected function issueAndFlash(User $user, ?string $preset = null): void
    {
        $activated = $user->email_verified_at !== null;
        $preset ??= $activated ? '24h' : '7d';

        [$expiresAt, $label] = match ($preset) {
            '24h' => [now()->addDay(), __('24 hours')],
            '7d' => [now()->addDays(7), __('7 days')],
            '30d' => [now()->addDays(30), __('30 days')],
            default => [null, null],
        };

        $url = UserInvitation::issue($user, request()->user(), $expiresAt);

        Inertia::flash('invite', [
            'url' => $url,
            'email' => $user->email,
            'mode' => $activated ? 'login' : 'invite',
            'expires' => $label,
        ]);
    }
}
