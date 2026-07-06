<?php

namespace App\Models;

use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase;
    use HasDomains;

    /**
     * Columns that are real table columns rather than keys inside the `data` JSON.
     */
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'plan_id',
            'status',
        ];
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    /**
     * Suite slugs the super admin has switched on for this tenant (enablement).
     * Stored transparently in the tenancy `data` JSON (not a custom column).
     *
     * @return array<int, string>
     */
    public function enabledSuites(): array
    {
        return (array) ($this->enabled_suites ?? []);
    }

    /**
     * Suites the tenant effectively runs: registered ∩ plan-entitled ∩ enabled.
     * The intersection means a plan downgrade auto-locks a suite without ever
     * discarding the stored enablement.
     *
     * @return array<int, string>
     */
    public function activeSuites(): array
    {
        $registered = array_keys(config('suites', []));
        $entitled = $this->plan?->allowedSuites() ?? [];

        return array_values(array_intersect($this->enabledSuites(), $entitled, $registered));
    }

    public function hasSuite(string $slug): bool
    {
        return in_array($slug, $this->activeSuites(), true);
    }
}
