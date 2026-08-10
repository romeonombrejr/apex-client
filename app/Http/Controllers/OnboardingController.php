<?php

namespace App\Http\Controllers;

use App\Models\UserInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * First-time set-password screen, reached right after an invited user
     * accepts their magic link. Guarded by the onboarding session flag so it
     * isn't a general no-current-password reset for existing accounts.
     */
    public function edit(Request $request): Response|RedirectResponse
    {
        if (! $this->inOnboarding($request)) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/onboarding-password', [
            'name' => $request->user()->name,
            'email' => $request->user()->email,
            'company' => $request->user()->company,
        ]);
    }

    /**
     * Store the chosen password (and company) and complete onboarding.
     */
    public function update(Request $request): RedirectResponse
    {
        abort_unless($this->inOnboarding($request), 403);

        $request->validate([
            'company' => ['required', 'string', 'max:100'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->forceFill([
            'company' => $request->company,
            'password' => Hash::make($request->password),
        ])->save();

        // The invite has converted into a credentialed account: lift the
        // link-session leash (their session no longer dies with the link)
        // and retire the consumed invitation row.
        $request->session()->forget(['onboarding_user_id', 'link_session_id', 'link_session_bound']);
        UserInvitation::where('user_id', $request->user()->getKey())->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Password set. Welcome!')]);

        return redirect()->route('dashboard');
    }

    /**
     * The current session is mid-onboarding for the authenticated user.
     */
    protected function inOnboarding(Request $request): bool
    {
        return $request->user() !== null
            && (int) $request->session()->get('onboarding_user_id') === (int) $request->user()->getKey();
    }
}
