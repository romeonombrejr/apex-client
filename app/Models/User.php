<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'company', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /** The frontend renders `user.avatar` everywhere a user is shown. */
    protected $appends = ['avatar'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Public URL for the profile photo (tenant asset route), or null when
     * none is set — the UI then falls back to initials.
     */
    public function getAvatarAttribute(): ?string
    {
        return $this->avatar_path
            ? route('stancl.tenancy.asset', ['path' => $this->avatar_path], false)
            : null;
    }

    /**
     * Access links issued for this account. At most one is live at a time —
     * minting a new one supersedes (and deletes) the previous.
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(UserInvitation::class);
    }

    // ── Storefront (tenant) relationships ────────────────────────────

    public function creditTransactions(): HasMany
    {
        return $this->hasMany(CreditTransaction::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Current credit balance: the sum of the signed ledger entries.
     */
    public function creditBalance(): float
    {
        return (float) $this->creditTransactions()->sum('amount');
    }
}
