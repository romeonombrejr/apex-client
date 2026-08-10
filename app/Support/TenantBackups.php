<?php

namespace App\Support;

use App\Models\Tenant;
use Illuminate\Support\Facades\Artisan;
use Spatie\Backup\BackupDestination\BackupDestination;

/**
 * DB-only backups across the whole platform. Everything here is
 * context-sensitive: run inside an initialized tenant, it dumps the tenant
 * DB into the tenant-scoped 'local' disk; run centrally, it dumps the
 * central DB into central storage. `inContext()` does the switching.
 */
class TenantBackups
{
    /**
     * Back up the currently active database (DB only) and apply the
     * retention policy. Notifications are disabled — there is no mailer;
     * health is surfaced on the super-admin Backups page instead.
     */
    public static function runHere(): void
    {
        config(['backup.backup.source.databases' => [config('database.default')]]);

        Artisan::call('backup:run', ['--only-db' => true, '--disable-notifications' => true]);
        Artisan::call('backup:clean', ['--disable-notifications' => true]);
    }

    /**
     * The backup destination for the currently active context.
     */
    public static function destination(): BackupDestination
    {
        return BackupDestination::create(
            config('backup.backup.destination.disks')[0] ?? 'local',
            config('backup.backup.name'),
        );
    }

    /**
     * Run a callback inside a tenant's context (null = central), restoring
     * the previous context afterwards.
     */
    public static function inContext(?Tenant $tenant, callable $callback): mixed
    {
        if ($tenant === null) {
            return $callback();
        }

        tenancy()->initialize($tenant);

        try {
            return $callback();
        } finally {
            tenancy()->end();
        }
    }
}
