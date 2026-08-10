<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Nightly DB-only backups: every tenant database + the central one, with
// retention applied (see config/backup.php cleanup strategy).
Schedule::command('backup:all')->dailyAt('01:30');

// Auto-bill due storefront subscriptions from client credits.
Schedule::command('storefront:renew-subscriptions')->dailyAt('02:00');

// Prune audit-log entries (incl. IPs) past the retention window
// (config/activitylog.php delete_records_older_than_days).
Schedule::command('activitylog:clean')->dailyAt('03:00');
