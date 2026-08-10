<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Support\TenantBackups;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Backup\BackupDestination\Backup;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Platform-wide backup overview: one section per tenant plus the central
 * database. Super admins can run backups on demand, download archives, and
 * delete tenant archives (central is download-only; retention prunes it).
 * Restores stay out of this panel by design — tenant admins restore their
 * own tenant, and a central restore is a deliberate SSH operation.
 */
class BackupController extends Controller
{
    public function index(): Response
    {
        $sections = collect([$this->section(null)])
            ->concat(Tenant::all()->map(fn (Tenant $tenant) => $this->section($tenant)))
            ->values();

        return Inertia::render('superadmin/backups', [
            'sections' => $sections,
        ]);
    }

    /**
     * Run a backup now: for one tenant, the central DB, or everything.
     */
    public function run(Request $request): RedirectResponse
    {
        $request->validate(['scope' => ['required', 'string']]);

        foreach ($this->scopes($request->string('scope')) as $tenant) {
            TenantBackups::inContext($tenant, fn () => TenantBackups::runHere());
        }

        return to_route('superadmin.backups.index');
    }

    public function download(string $scope, string $path): StreamedResponse
    {
        $tenant = $this->tenantForScope($scope);

        return TenantBackups::inContext($tenant, function () use ($path) {
            $backup = $this->findBackup($path);

            abort_unless($backup?->exists(), 404);

            return TenantBackups::destination()->disk()->download($backup->path());
        });
    }

    public function destroy(string $scope, string $path): RedirectResponse
    {
        // Central archives are download-only; retention prunes them.
        abort_if($scope === 'central', 403);

        $tenant = $this->tenantForScope($scope);

        TenantBackups::inContext($tenant, function () use ($path) {
            $backup = $this->findBackup($path);

            abort_unless($backup?->exists(), 404);

            $backup->delete();
        });

        return to_route('superadmin.backups.index');
    }

    /**
     * One page section: the scope's archives, newest first, plus a health
     * verdict (green while the newest dump is younger than ~a day).
     *
     * @return array<string, mixed>
     */
    protected function section(?Tenant $tenant): array
    {
        return TenantBackups::inContext($tenant, function () use ($tenant) {
            $backups = TenantBackups::destination()->backups()
                ->map(fn (Backup $backup) => [
                    'name' => basename($backup->path()),
                    'path' => bin2hex($backup->path()),
                    'size' => $backup->sizeInBytes(),
                    'date' => $backup->date()->format('M j, Y H:i'),
                ])
                ->values();

            $newest = TenantBackups::destination()->newestBackup();

            return [
                'scope' => $tenant?->id ?? 'central',
                'label' => $tenant?->name ?? 'Central',
                'central' => $tenant === null,
                'backups' => $backups,
                'newest_at' => $newest?->date()->diffForHumans(),
                // 25h: a daily schedule plus slack, so a slightly late run
                // doesn't flap the badge.
                'healthy' => $newest !== null && $newest->date()->gt(now()->subHours(25)),
            ];
        });
    }

    /**
     * @return array<int, ?Tenant>
     */
    protected function scopes(string $scope): array
    {
        return match (true) {
            $scope === 'all' => [null, ...Tenant::all()->all()],
            $scope === 'central' => [null],
            default => [Tenant::findOrFail($scope)],
        };
    }

    protected function tenantForScope(string $scope): ?Tenant
    {
        return $scope === 'central' ? null : Tenant::findOrFail($scope);
    }

    protected function findBackup(string $hexPath): ?Backup
    {
        $path = hex2bin($hexPath) ?: '';

        return TenantBackups::destination()->backups()
            ->first(fn (Backup $backup) => $backup->path() === $path);
    }
}
