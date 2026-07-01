<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\SuperAdmin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;
use Laravel\Fortify\Fortify;

class TwoFactorChallengeController extends Controller
{
    public function __construct(protected TwoFactorAuthenticationProvider $provider) {}

    /**
     * Show the two-factor challenge (only reachable mid-login).
     */
    public function create(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('superadmin.2fa')) {
            return redirect()->route('superadmin.login');
        }

        return Inertia::render('superadmin/two-factor-challenge');
    }

    /**
     * Verify a TOTP code or a recovery code and complete the login.
     */
    public function store(Request $request): RedirectResponse
    {
        $pending = $request->session()->get('superadmin.2fa');

        if (! $pending || ! $admin = SuperAdmin::find($pending['id'])) {
            return redirect()->route('superadmin.login');
        }

        $code = $request->input('code');
        $recovery = $request->input('recovery_code');

        if ($code && $this->provider->verify(Fortify::currentEncrypter()->decrypt($admin->two_factor_secret), $code)) {
            // valid TOTP code
        } elseif ($recovery && in_array($recovery, $admin->recoveryCodes(), true)) {
            $admin->replaceRecoveryCode($recovery);
        } else {
            throw ValidationException::withMessages([
                'code' => __('The provided two factor authentication code was invalid.'),
            ]);
        }

        Auth::guard('superadmin')->login($admin, $pending['remember'] ?? false);

        $request->session()->forget('superadmin.2fa');
        $request->session()->regenerate();

        return redirect()->intended(route('superadmin.dashboard'));
    }
}
