<?php

namespace App\Support;

use App\Models\User;

class TenantLimits
{
    /**
     * Whether the current tenant has reached its plan's user limit.
     *
     * Returns false in the central context (no tenant) or when the plan has no
     * user cap. Must be called inside a tenant context so User::count() targets
     * the tenant database.
     */
    public static function reachedUserLimit(): bool
    {
        $max = self::maxUsers();

        return $max !== null && User::count() >= $max;
    }

    /**
     * The current tenant's max user count, or null when unlimited / no tenant.
     */
    public static function maxUsers(): ?int
    {
        $tenant = tenant();

        return $tenant?->plan?->max_users;
    }
}
