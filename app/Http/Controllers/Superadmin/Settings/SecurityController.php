<?php

namespace App\Http\Controllers\Superadmin\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SecurityController extends Controller
{
    /**
     * Show the super admin's security settings page.
     */
    public function edit(Request $request): Response
    {
        $admin = $request->user('superadmin');

        return Inertia::render('superadmin/settings/security', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'twoFactorEnabled' => $admin->hasEnabledTwoFactorAuthentication(),
            'twoFactorPending' => ! is_null($admin->two_factor_secret) && is_null($admin->two_factor_confirmed_at),
            'passkeys' => $admin->passkeys()
                ->select(['id', 'name', 'created_at', 'last_used_at'])
                ->latest()
                ->get()
                ->map(fn ($passkey) => [
                    'id' => $passkey->id,
                    'name' => $passkey->name,
                    'created_at_diff' => $passkey->created_at->diffForHumans(),
                    'last_used_at_diff' => $passkey->last_used_at?->diffForHumans(),
                ])
                ->values(),
        ]);
    }

    /**
     * Update the super admin's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password:superadmin'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user('superadmin')->update([
            'password' => $request->password,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Password updated.')]);

        return back();
    }
}
