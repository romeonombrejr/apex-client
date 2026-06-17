<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Spatie\Backup\BackupDestination\Backup;
use Spatie\Backup\BackupDestination\BackupDestination;
use Symfony\Component\Process\Process;
use ZipArchive;

class RestoreBackupJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public int $timeout = 300;
    public int $tries = 1;

    public function __construct(public readonly string $encodedPath) {}

    public function handle(): void
    {
        $destination = BackupDestination::create(
            config('backup.backup.destination.disks')[0] ?? 'local',
            config('backup.backup.name'),
        );

        $path = base64_decode($this->encodedPath);
        $backup = $destination->backups()->first(fn (Backup $b) => $b->path() === $path);

        if (! $backup?->exists()) {
            throw new \RuntimeException("Backup file not found: {$path}");
        }

        $zipPath = $destination->disk()->path($backup->path());
        $tempDir = storage_path('app/backup-restore-temp/'.uniqid());
        mkdir($tempDir, 0755, true);

        try {
            $sqlFile = $this->extractSql($zipPath, $tempDir);
            $this->importSql($sqlFile);
        } finally {
            $this->removeDirectory($tempDir);
        }
    }

    private function extractSql(string $zipPath, string $tempDir): string
    {
        $zip = new ZipArchive();

        if ($zip->open($zipPath) !== true) {
            throw new \RuntimeException("Failed to open backup archive: {$zipPath}");
        }

        $sqlEntry = null;
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            if (str_ends_with($name, '.sql')) {
                $zip->extractTo($tempDir, $name);
                $sqlEntry = $name;
                break;
            }
        }
        $zip->close();

        if (! $sqlEntry) {
            throw new \RuntimeException('No SQL dump found inside the backup archive.');
        }

        return $tempDir.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $sqlEntry);
    }

    private function importSql(string $sqlFile): void
    {
        $binaryPath = config('database.connections.mysql.dump.dump_binary_path', '');
        $mysql = $binaryPath !== ''
            ? rtrim($binaryPath, '/\\').DIRECTORY_SEPARATOR.'mysql'
            : 'mysql';

        $host     = config('database.connections.mysql.host', '127.0.0.1');
        $port     = config('database.connections.mysql.port', '3306');
        $username = config('database.connections.mysql.username', 'root');
        $password = config('database.connections.mysql.password', '');
        $database = config('database.connections.mysql.database');

        $process = new Process([$mysql, "--host={$host}", "--port={$port}", "--user={$username}", $database]);

        if ($password !== '') {
            $process->setEnv(['MYSQL_PWD' => $password]);
        }

        $process->setInput(fopen($sqlFile, 'r'));
        $process->setTimeout(300);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new \RuntimeException('Database restore failed: '.$process->getErrorOutput());
        }
    }

    private function removeDirectory(string $dir): void
    {
        if (! is_dir($dir)) {
            return;
        }

        foreach (scandir($dir) as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }
            $path = $dir.DIRECTORY_SEPARATOR.$item;
            is_dir($path) ? $this->removeDirectory($path) : unlink($path);
        }

        rmdir($dir);
    }
}
