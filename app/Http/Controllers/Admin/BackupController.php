<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Backup\BackupDestination\Backup;
use Spatie\Backup\BackupDestination\BackupDestination;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupController extends Controller
{
    /**
     * Display a listing of all backups.
     */
    public function index(): Response
    {
        $backups = $this->destination()->backups()
            ->map(fn (Backup $backup) => [
                'name' => basename($backup->path()),
                'path' => base64_encode($backup->path()),
                'size' => $this->formatBytes($backup->sizeInBytes()),
                'date' => $backup->date(),
            ])
            ->values();

        return Inertia::render('admin/backup/index', [
            'backups' => $backups,
        ]);
    }

    /**
     * Run a new database backup.
     */
    public function store(Request $request): RedirectResponse
    {
        $exitCode = Artisan::call('backup:run', ['--only-db' => true]);

        if ($exitCode !== 0) {
            report(new \RuntimeException('backup:run failed: '.Artisan::output()));

            Inertia::flash('toast', ['type' => 'error', 'message' => __('Backup failed. Check the logs for details.')]);

            return to_route('admin.backup.index');
        }

        activity()->causedBy($request->user())->log('Created a database backup.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Backup created.')]);

        return to_route('admin.backup.index');
    }

    /**
     * Download the specified backup.
     */
    public function download(string $path): StreamedResponse
    {
        $backup = $this->findBackup($path);

        abort_unless($backup?->exists(), 404);

        return $this->destination()->disk()->download($backup->path());
    }

    /**
     * Delete the specified backup.
     */
    public function destroy(Request $request, string $path): RedirectResponse
    {
        $backup = $this->findBackup($path);

        abort_unless($backup?->exists(), 404);

        activity()->causedBy($request->user())->log('Deleted backup: '.basename($backup->path()));

        $backup->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Backup deleted.')]);

        return to_route('admin.backup.index');
    }

    protected function findBackup(string $encodedPath): ?Backup
    {
        $path = base64_decode($encodedPath);

        return $this->destination()->backups()->first(fn (Backup $backup) => $backup->path() === $path);
    }

    protected function destination(): BackupDestination
    {
        return BackupDestination::create(
            config('backup.backup.destination.disks')[0] ?? 'local',
            config('backup.backup.name'),
        );
    }

    protected function formatBytes(float $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $power = $bytes > 0 ? min((int) floor(log($bytes, 1024)), count($units) - 1) : 0;

        return round($bytes / (1024 ** $power), 2).' '.$units[$power];
    }
}
