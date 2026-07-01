<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\SuperAdminPasskey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Laravel\Passkeys\Actions\GenerateVerificationOptions;
use Laravel\Passkeys\Passkeys;
use Laravel\Passkeys\Support\WebAuthn;
use ParagonIE\ConstantTime\Base64UrlSafe;
use Throwable;
use Webauthn\AuthenticatorAssertionResponse;
use Webauthn\CredentialRecord;
use Webauthn\PublicKeyCredential;
use Webauthn\PublicKeyCredentialRequestOptions;

class PasskeyLoginController extends Controller
{
    protected const SESSION_KEY = 'superadmin.passkey.verification_options';

    /**
     * Login options (discoverable credential — no username required).
     */
    public function options(Request $request, GenerateVerificationOptions $generate): JsonResponse
    {
        $options = $generate();

        $request->session()->put(self::SESSION_KEY, WebAuthn::toJson($options));

        return response()->json(['options' => WebAuthn::toBrowserArray($options)]);
    }

    /**
     * Verify the assertion and log the super admin in.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate(['credential' => ['required', 'array']]);

        $serialized = $request->session()->pull(self::SESSION_KEY);

        if (! $serialized) {
            throw ValidationException::withMessages([
                'credential' => __('Passkey verification session expired. Please try again.'),
            ]);
        }

        try {
            $credential = WebAuthn::fromJson(json_encode($request->input('credential')), PublicKeyCredential::class);
            $options = WebAuthn::fromJson($serialized, PublicKeyCredentialRequestOptions::class);
        } catch (Throwable) {
            throw ValidationException::withMessages(['credential' => __('Invalid credential format.')]);
        }

        if (! $credential->response instanceof AuthenticatorAssertionResponse) {
            throw ValidationException::withMessages(['credential' => __('Unable to verify passkey. Please try again.')]);
        }

        $passkey = SuperAdminPasskey::where('credential_id', Base64UrlSafe::encodeUnpadded($credential->rawId))->first();

        if (! $passkey) {
            throw ValidationException::withMessages([
                'credential' => __('Passkey not recognized. It may have been removed.'),
            ]);
        }

        try {
            $source = WebAuthn::fromJson(json_encode($passkey->credential), CredentialRecord::class);

            $validated = WebAuthn::assertionValidator()->check(
                credentialRecord: $source,
                authenticatorAssertionResponse: $credential->response,
                publicKeyCredentialRequestOptions: $options,
                host: Passkeys::relyingPartyId(),
                userHandle: $source->userHandle,
            );
        } catch (Throwable) {
            throw ValidationException::withMessages(['credential' => __('Passkey verification failed.')]);
        }

        // Persist the updated signature counter (clone detection).
        $passkey->forceFill([
            'credential' => json_decode(WebAuthn::toJson($validated), true),
            'last_used_at' => now(),
        ])->save();

        Auth::guard('superadmin')->login($passkey->superAdmin, $request->boolean('remember'));

        $request->session()->regenerate();

        return response()->json(['redirect' => route('superadmin.dashboard')]);
    }
}
