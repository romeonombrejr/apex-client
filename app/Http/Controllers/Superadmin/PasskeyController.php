<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\SuperAdminPasskey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Passkeys\Actions\GenerateRegistrationOptions;
use Laravel\Passkeys\Passkeys;
use Laravel\Passkeys\Support\WebAuthn;
use ParagonIE\ConstantTime\Base64UrlSafe;
use Throwable;
use Webauthn\AuthenticatorAttestationResponse;
use Webauthn\PublicKeyCredential;
use Webauthn\PublicKeyCredentialCreationOptions;

class PasskeyController extends Controller
{
    protected const SESSION_KEY = 'superadmin.passkey.registration_options';

    /**
     * Registration options for adding a passkey to the current super admin.
     */
    public function options(Request $request, GenerateRegistrationOptions $generate): JsonResponse
    {
        $options = $generate($request->user('superadmin'));

        $request->session()->put(self::SESSION_KEY, WebAuthn::toJson($options));

        return response()->json(['options' => WebAuthn::toBrowserArray($options)]);
    }

    /**
     * Verify the attestation and store the new passkey.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'credential' => ['required', 'array'],
        ]);

        $serialized = $request->session()->pull(self::SESSION_KEY);

        if (! $serialized) {
            throw ValidationException::withMessages([
                'credential' => __('Passkey registration session expired. Please try again.'),
            ]);
        }

        try {
            $credential = WebAuthn::fromJson(json_encode($request->input('credential')), PublicKeyCredential::class);
            $options = WebAuthn::fromJson($serialized, PublicKeyCredentialCreationOptions::class);
        } catch (Throwable) {
            throw ValidationException::withMessages(['credential' => __('Invalid credential format.')]);
        }

        if (! $credential->response instanceof AuthenticatorAttestationResponse) {
            throw ValidationException::withMessages(['credential' => __('Unable to register passkey. Please try again.')]);
        }

        try {
            $source = WebAuthn::attestationValidator()->check(
                authenticatorAttestationResponse: $credential->response,
                publicKeyCredentialCreationOptions: $options,
                host: Passkeys::relyingPartyId(),
            );
        } catch (Throwable) {
            throw ValidationException::withMessages(['credential' => __('Unable to register this passkey.')]);
        }

        $credentialId = Base64UrlSafe::encodeUnpadded($source->publicKeyCredentialId);

        if (SuperAdminPasskey::where('credential_id', $credentialId)->exists()) {
            throw ValidationException::withMessages(['credential' => __('This passkey is already registered.')]);
        }

        $request->user('superadmin')->passkeys()->create([
            'name' => $validated['name'],
            'credential_id' => $credentialId,
            'credential' => json_decode(WebAuthn::toJson($source), true),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Passkey added.')]);

        return back();
    }

    /**
     * Remove a passkey.
     */
    public function destroy(Request $request, SuperAdminPasskey $superAdminPasskey): RedirectResponse
    {
        abort_unless($superAdminPasskey->super_admin_id === $request->user('superadmin')->id, 403);

        $superAdminPasskey->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Passkey removed.')]);

        return back();
    }
}
