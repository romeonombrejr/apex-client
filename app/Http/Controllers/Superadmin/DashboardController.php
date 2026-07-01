<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Super-admin overview with cross-tenant reporting.
     */
    public function index(): Response
    {
        return Inertia::render('superadmin/dashboard', [
            'stats' => [
                'tenants' => Tenant::count(),
                'active' => Tenant::where('status', 'active')->count(),
                'suspended' => Tenant::where('status', 'suspended')->count(),
                'plans' => Plan::count(),
            ],
            'report' => $this->crossTenantReport(),
        ]);
    }

    /**
     * Aggregate per-tenant usage by querying each tenant database.
     *
     * This is O(number of tenants) queries, so it is cached briefly. Tenants that
     * error (e.g. a missing database) are logged and reported as null rather than
     * silently dropped, so totals aren't misleading.
     *
     * @return array<string, mixed>
     */
    protected function crossTenantReport(): array
    {
        return Cache::remember('superadmin.cross_tenant_report', now()->addMinute(), function (): array {
            $totalUsers = 0;
            $rows = [];

            foreach (Tenant::with('plan')->get() as $tenant) {
                try {
                    $users = $tenant->run(fn () => User::count());
                } catch (\Throwable $e) {
                    Log::warning('Cross-tenant report skipped tenant '.$tenant->id.': '.$e->getMessage());
                    $users = null;
                }

                $totalUsers += $users ?? 0;

                $rows[] = [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'plan' => $tenant->plan?->name,
                    'users' => $users,
                    'max_users' => $tenant->plan?->max_users,
                ];
            }

            return [
                'total_users' => $totalUsers,
                'tenants' => $rows,
            ];
        });
    }
}
