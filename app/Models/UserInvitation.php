<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class UserInvitation extends Model
{
    protected $fillable = [
        'user_id',
        'email',
        'token',
        'plain_token',
        'expires_at',
        'accepted_at',
        'session_id',
        'invited_by',
    ];

    protected function casts(): array
    {
        return [
            // Encrypted at rest so a raw DB dump alone can't expose live
            // links (lookup still goes through the SHA-256 `token` hash);
            // kept so admins can re-copy an active link from the roster.
            'plain_token' => 'encrypted',
            'expires_at' => 'datetime',
            'accepted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    /**
     * Issue a fresh invitation for the given user, superseding any existing
     * one, and return the accept URL (which carries the plaintext token — the
     * DB stores its hash for lookup plus an encrypted copy for re-display).
     * $expiresAt null means the link never expires; either way it works any
     * number of times until it expires or is revoked/superseded.
     */
    public static function issue(User $user, ?User $invitedBy = null, ?\DateTimeInterface $expiresAt = null): string
    {
        // Opportunistic cleanup: expired links are dead weight (their
        // sessions, if any, are already dead via the expiry stamp).
        static::whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->delete();

        // Superseding kills any session the previous link created — the
        // direct session delete is immediate; the enforcement middleware
        // catches stragglers on their next request once the row is gone.
        $user->invitations->each->killSession();
        $user->invitations()->delete();

        $plain = Str::random(48);

        $user->invitations()->create([
            'email' => $user->email,
            'token' => hash('sha256', $plain),
            'plain_token' => $plain,
            'expires_at' => $expiresAt,
            'invited_by' => $invitedBy?->getKey(),
        ]);

        return URL::route('invitations.accept', ['token' => $plain]);
    }

    /**
     * The accept URL, recoverable while the link is live. Null for rows
     * minted before plaintext tokens were kept.
     */
    public function url(): ?string
    {
        return $this->plain_token
            ? URL::route('invitations.accept', ['token' => $this->plain_token])
            : null;
    }

    /**
     * Whether this link can still sign its user in: non-expiring (null) or
     * still within its window. Links are reusable until they expire or are
     * revoked/superseded — each use replaces the previous session.
     */
    public function isUsable(): bool
    {
        return $this->expires_at === null || $this->expires_at->isFuture();
    }

    /**
     * Whether the session this link last signed in is still alive — present
     * in the session store and active within the session lifetime. While it
     * is, the link is locked: new sign-ins are refused (first in wins).
     *
     * Only answerable with the database session driver; on other drivers
     * this returns false, degrading to the older replace-on-reuse behavior
     * rather than locking the link forever on unverifiable state.
     */
    public function hasLiveSession(): bool
    {
        if (! $this->session_id || config('session.driver') !== 'database') {
            return false;
        }

        $row = DB::connection(config('session.connection'))
            ->table(config('session.table', 'sessions'))
            ->where('id', $this->session_id)
            ->first();

        return $row !== null
            && $row->last_activity >= now()->subMinutes((int) config('session.lifetime'))->getTimestamp();
    }

    /**
     * Immediately end the session this link created, if any. Only possible
     * with the database session driver (the enforcement middleware remains
     * the driver-agnostic lazy backstop).
     */
    public function killSession(): void
    {
        if (! $this->session_id || config('session.driver') !== 'database') {
            return;
        }

        DB::connection(config('session.connection'))
            ->table(config('session.table', 'sessions'))
            ->where('id', $this->session_id)
            ->delete();
    }
}
