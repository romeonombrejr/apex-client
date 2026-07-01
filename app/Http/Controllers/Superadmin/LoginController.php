<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\SuperAdmin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    /**
     * Show the super-admin login page.
     */
    public function create(): Response
    {
        return Inertia::render('superadmin/login');
    }

    /**
     * Authenticate a super admin against the `superadmin` guard.
     *
     * If the account has two-factor enabled, the password step only stashes a
     * pending login in the session and defers to the two-factor challenge.
     */
    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $admin = SuperAdmin::where('email', $credentials['email'])->first();

        if (! $admin || ! Hash::check($credentials['password'], $admin->password)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        if ($admin->hasEnabledTwoFactorAuthentication()) {
            $request->session()->put('superadmin.2fa', [
                'id' => $admin->id,
                'remember' => $request->boolean('remember'),
            ]);

            return redirect()->route('superadmin.two-factor.login');
        }

        Auth::guard('superadmin')->login($admin, $request->boolean('remember'));

        $request->session()->regenerate();

        return redirect()->intended(route('superadmin.dashboard'));
    }

    /**
     * Log the super admin out.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('superadmin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('superadmin.login');
    }
}
