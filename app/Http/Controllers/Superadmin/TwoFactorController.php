<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\RecoveryCode;

class TwoFactorController extends Controller
{
    public function __construct(protected TwoFactorAuthenticationProvider $provider) {}

    /**
     * Begin enabling two-factor: generate a secret and recovery codes (unconfirmed).
     */
    public function store(Request $request): RedirectResponse
    {
        $request->user('superadmin')->forceFill([
            'two_factor_secret' => Fortify::currentEncrypter()->encrypt($this->provider->generateSecretKey()),
            'two_factor_recovery_codes' => Fortify::currentEncrypter()->encrypt(json_encode(
                Collection::times(8, fn () => RecoveryCode::generate())->all()
            )),
            'two_factor_confirmed_at' => null,
        ])->save();

        return back();
    }

    /**
     * Confirm two-factor with a valid code from the authenticator app.
     */
    public function confirm(Request $request): RedirectResponse
    {
        $request->validate(['code' => ['required', 'string']]);

        $admin = $request->user('superadmin');

        $valid = $admin->two_factor_secret && $this->provider->verify(
            Fortify::currentEncrypter()->decrypt($admin->two_factor_secret),
            $request->input('code')
        );

        if (! $valid) {
            throw ValidationException::withMessages([
                'code' => __('The provided two factor authentication code was invalid.'),
            ]);
        }

        $admin->forceFill(['two_factor_confirmed_at' => now()])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Two-factor authentication enabled.')]);

        return back();
    }

    /**
     * Disable two-factor authentication.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->user('superadmin')->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Two-factor authentication disabled.')]);

        return back();
    }

    /**
     * The setup QR code (SVG) + otpauth URL.
     */
    public function qrCode(Request $request): JsonResponse
    {
        $admin = $request->user('superadmin');

        if (! $admin->two_factor_secret) {
            return response()->json(['svg' => null, 'url' => null]);
        }

        return response()->json([
            'svg' => $admin->twoFactorQrCodeSvg(),
            'url' => $admin->twoFactorQrCodeUrl(),
        ]);
    }

    /**
     * The current recovery codes.
     */
    public function recoveryCodes(Request $request): JsonResponse
    {
        return response()->json($request->user('superadmin')->recoveryCodes());
    }
}
