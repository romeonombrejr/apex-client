<?php

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

Route::domain($centralDomain)->group(function () {
    Route::get('/', fn () => redirect()->route('superadmin.login'));

    require __DIR__.'/superadmin.php';
});
