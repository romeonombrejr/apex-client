<?php

use App\Http\Middleware\DiscourageSearchIndexing;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Central Routes
|--------------------------------------------------------------------------
|
| These routes are served only on the central domain(s) — the super-admin
| console. They are constrained to the central domain so they never shadow
| tenant routes (which are registered domain-agnostically in tenant.php).
|
*/

$centralDomain = config('tenancy.central_domains')[0] ?? 'localhost';

// The console is invite-only knowledge — keep the whole central hostname out
// of search indexes so nobody stumbles onto the login page via a result.
Route::domain($centralDomain)->middleware(DiscourageSearchIndexing::class)->group(function () {
    Route::get('/', fn () => redirect()->route('superadmin.login'));

    require __DIR__.'/superadmin.php';
});
