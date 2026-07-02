<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    /**
     * Paths for a single unified test schema.
     *
     * In production the schema is split across central and tenant databases,
     * with `cache` and `activity_log` defined in both. For tests we migrate all
     * central tables plus the tenant tables that don't collide, so both central
     * (super-admin) and tenant feature tests can share one database. The central
     * `activity_log` (string morphs) is a superset of the tenant one, so we use it
     * for both and skip the tenant cache/activity_log migrations.
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
        return [
            'database/migrations',
            'database/migrations/tenant/0001_01_01_000000_create_users_table.php',
            'database/migrations/tenant/2024_01_01_000000_create_passkeys_table.php',
            'database/migrations/tenant/2025_08_14_170933_add_two_factor_columns_to_users_table.php',
            'database/migrations/tenant/2026_06_11_000000_create_permission_tables.php',
            'database/migrations/tenant/2026_06_16_052159_add_group_to_permissions_table.php',
            'database/migrations/tenant/2026_06_16_052159_create_settings_table.php',
            'database/migrations/tenant/2026_06_16_052200_create_media_folders_table.php',
            'database/migrations/tenant/2026_06_16_052201_create_media_files_table.php',
            'database/migrations/tenant/2026_07_02_000001_create_themes_table.php',
        ];
    }

    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
