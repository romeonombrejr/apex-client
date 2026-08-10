<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    /**
     * Hard stop before RefreshDatabase can migrate:fresh a real database.
     *
     * phpunit.xml points the suite at an in-memory SQLite DB, but a stale
     * bootstrap/cache/config.php overrides those env vars — which once made
     * `php artisan test` run migrate:fresh against the live MySQL dev DB and
     * wipe it. This runs right after the app boots (so config is resolved,
     * cache and all) and before the RefreshDatabase trait fires in setUp(),
     * refusing to proceed unless we're truly on the throwaway SQLite database.
     */
    protected function refreshApplication()
    {
        parent::refreshApplication();

        $connection = config('database.default');
        $database = config("database.connections.{$connection}.database");

        if ($connection !== 'sqlite' || $database !== ':memory:') {
            throw new \RuntimeException(
                "Refusing to run tests against [{$connection}: {$database}] — expected in-memory SQLite. "
                .'A stale config cache is the usual cause; run `php artisan config:clear` (never `config:cache`/`optimize` in local dev).'
            );
        }
    }

    /**
     * Paths for a single unified test schema.
     *
     * In production the schema is split across central and tenant databases,
     * with `cache` and `activity_log` defined in both. For tests we migrate all
     * central tables plus every tenant migration that doesn't collide, so both
     * central (super-admin) and tenant feature tests can share one database. The
     * central `activity_log` (string morphs) is a superset of the tenant one, so
     * we use it for both and skip the tenant cache/activity_log migrations.
     *
     * Consumed by RefreshDatabase via the migrateFreshUsing() override on the
     * concrete test bases (TenantTestCase / CentralTestCase) — it must live there
     * rather than here because a trait method (RefreshDatabase) shadows an
     * inherited parent method.
     *
     * @return array<int, string>
     */
    protected function unifiedMigrationPaths(): array
    {
        $tenant = collect(glob(database_path('migrations/tenant/*.php')))
            ->map(fn (string $path) => 'database/migrations/tenant/'.basename($path))
            ->reject(fn (string $path) => str_contains($path, 'cache_table') || str_contains($path, 'activity_log'))
            ->values()
            ->all();

        return ['database/migrations', ...$tenant];
    }

    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
