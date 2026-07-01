<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Config;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Passkeys\Contracts\PasskeyUser;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

class SuperAdmin extends Authenticatable implements PasskeyUser
{
    use CentralConnection;
    use Notifiable;
    use TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * The super admin's registered passkeys (WebAuthn credentials).
     *
     * Note: super admins use their own passkey table (not the tenant one), so
     * PasskeyUser is implemented directly rather than via the package trait.
     */
    public function passkeys(): HasMany
    {
        return $this->hasMany(SuperAdminPasskey::class);
    }

    public function hasPasskeysEnabled(): bool
    {
        return $this->passkeys()->exists();
    }

    public function getPasskeyUserHandle(): string
    {
        return hash_hmac(
            'sha256',
            $this->getTable().'|'.$this->getKey(),
            Config::string('passkeys.user_handle_secret'),
            binary: true,
        );
    }

    public function getPasskeyDisplayName(): string
    {
        return $this->name;
    }

    public function getPasskeyUsername(): string
    {
        return $this->email;
    }
}
