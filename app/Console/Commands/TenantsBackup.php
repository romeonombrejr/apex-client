<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class TenantsBackup extends Command
{
    protected $signature = 'tenants:backup';

    protected $description = 'Run a database backup for every tenant, each in its own context.';

    public function handle(): int
    {
        $tenants = Tenant::all();

        if ($tenants->isEmpty()) {
            $this->info('No tenants to back up.');

            return self::SUCCESS;
        }

        foreach ($tenants as $tenant) {
            $this->line("Backing up tenant {$tenant->id} ({$tenant->name})…");

            try {
                $tenant->run(function () {
                    config(['backup.backup.source.databases' => [config('database.default')]]);
                    Artisan::call('backup:run', ['--only-db' => true]);
                });
            } catch (\Throwable $e) {
                $this->error("  failed: {$e->getMessage()}");

                continue;
            }

            $this->info('  done.');
        }

        return self::SUCCESS;
    }
}
