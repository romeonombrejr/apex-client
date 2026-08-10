<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Support\TenantBackups;
use Illuminate\Console\Command;

/**
 * The nightly platform backup: a DB-only dump per tenant plus the (small)
 * central database, each into its own scoped storage, with the retention
 * policy applied after every run. Scheduled daily; also runnable on demand
 * from the super-admin Backups page.
 */
class BackupAllCommand extends Command
{
    protected $signature = 'backup:all';

    protected $description = 'Back up the central database and every tenant database (DB only)';

    public function handle(): int
    {
        $failures = 0;

        // Central first: tiny, but it is the map that makes tenant dumps
        // restorable (tenants, domains, plans, super admins).
        $failures += $this->attempt(null, 'central');

        foreach (Tenant::all() as $tenant) {
            $failures += $this->attempt($tenant, "tenant {$tenant->id}");
        }

        return $failures === 0 ? self::SUCCESS : self::FAILURE;
    }

    /**
     * Run one scoped backup; a failure is reported but never stops the rest.
     */
    protected function attempt(?Tenant $tenant, string $label): int
    {
        try {
            TenantBackups::inContext($tenant, fn () => TenantBackups::runHere());
            $this->info("Backed up {$label}.");

            return 0;
        } catch (\Throwable $e) {
            report($e);
            $this->error("FAILED {$label}: {$e->getMessage()}");

            return 1;
        }
    }
}
