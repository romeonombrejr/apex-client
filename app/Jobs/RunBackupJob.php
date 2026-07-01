<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Artisan;

class RunBackupJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public int $timeout = 300;

    public int $tries = 1;

    public function handle(): void
    {
        // Back up whichever database is currently active. When this job runs in a
        // tenant context (re-initialized by the queue tenancy bootstrapper), the
        // default connection is the tenant DB and the 'local' disk is already
        // scoped to the tenant's storage, so backups are naturally per-tenant.
        config(['backup.backup.source.databases' => [config('database.default')]]);

        Artisan::call('backup:run', ['--only-db' => true]);
    }
}
