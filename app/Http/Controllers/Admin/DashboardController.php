<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;
use Spatie\Backup\BackupDestination\Backup;
use Spatie\Backup\BackupDestination\BackupDestination;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // ── Summary totals ───────────────────────────────────────────
        $totalUsers        = User::count();
        $totalActivityLogs = Activity::count();

        $backupFiles  = $this->backupFiles();
        $totalBackups = $backupFiles->count();

        // ── Monthly data: last 6 months (bar + line charts) ──────────
        $sixMonthsAgo = now()->subMonths(5)->startOfMonth();
        $months       = collect(range(0, 5))->map(fn ($i) => now()->subMonths(5 - $i));

        $usersByMonth = User::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as ym, COUNT(*) as count")
            ->where('created_at', '>=', $sixMonthsAgo)
            ->groupBy('ym')
            ->pluck('count', 'ym');

        $backupsByMonth = $backupFiles
            ->groupBy(fn (Backup $b) => $b->date()->format('Y-m'))
            ->map->count();

        $monthlyData = $months->map(fn ($month) => [
            'name'    => $month->format('M'),
            'Users'   => (int) ($usersByMonth[$month->format('Y-m')] ?? 0),
            'Backups' => (int) ($backupsByMonth[$month->format('Y-m')] ?? 0),
        ])->values();

        // ── Role distribution (pie chart) ────────────────────────────
        $roleDistribution = Role::withCount('users')
            ->get()
            ->map(fn (Role $role) => [
                'name'  => ucfirst($role->name),
                'value' => $role->users_count,
            ])
            ->values();

        // ── Resource usage: last 4 months (area chart) ───────────────
        $fourMonthsAgo = now()->subMonths(3)->startOfMonth();
        $areaMonths    = collect(range(0, 3))->map(fn ($i) => now()->subMonths(3 - $i));

        $activitiesByMonth = Activity::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as ym, COUNT(*) as count")
            ->where('created_at', '>=', $fourMonthsAgo)
            ->groupBy('ym')
            ->pluck('count', 'ym');

        $areaData = $areaMonths->map(fn ($month) => [
            'month'   => $month->format('M'),
            'users'   => (int) ($usersByMonth[$month->format('Y-m')] ?? 0),
            'backups' => (int) ($activitiesByMonth[$month->format('Y-m')] ?? 0),
        ])->values();

        // ── Performance metrics (radial bar) ─────────────────────────
        $totalRoles       = Role::count();
        $totalPermissions = Permission::count();

        $usersWithRoles     = DB::table('model_has_roles')->distinct()->count('model_id');
        $rolesWithUsers     = DB::table('model_has_roles')->distinct()->count('role_id');
        $permissionsInUse   = DB::table('role_has_permissions')->distinct()->count('permission_id');

        $performanceMetrics = [
            [
                'name'  => 'User Coverage',
                'value' => $totalUsers > 0 ? (int) round($usersWithRoles / $totalUsers * 100) : 0,
                'fill'  => '#8884d8',
            ],
            [
                'name'  => 'Role Usage',
                'value' => $totalRoles > 0 ? (int) round($rolesWithUsers / $totalRoles * 100) : 0,
                'fill'  => '#83a6ed',
            ],
            [
                'name'  => 'Permission Usage',
                'value' => $totalPermissions > 0 ? (int) round($permissionsInUse / $totalPermissions * 100) : 0,
                'fill'  => '#8dd1e1',
            ],
        ];

        return Inertia::render('admin/dashboard', [
            'totalUsers'         => $totalUsers,
            'totalBackups'       => $totalBackups,
            'totalActivityLogs'  => $totalActivityLogs,
            'monthlyData'        => $monthlyData,
            'roleDistribution'   => $roleDistribution,
            'areaData'           => $areaData,
            'performanceMetrics' => $performanceMetrics,
        ]);
    }

    private function backupFiles()
    {
        try {
            return BackupDestination::create(
                config('backup.backup.destination.disks')[0] ?? 'local',
                config('backup.backup.name'),
            )->backups();
        } catch (\Throwable) {
            return collect();
        }
    }
}
