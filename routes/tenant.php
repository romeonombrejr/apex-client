<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Features\UserImpersonation;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| These are the routes for the tenant application. They are only reachable
| on tenant domains; PreventAccessFromCentralDomains blocks central domains,
| and InitializeTenancyByDomain swaps the DB/cache/storage to the tenant.
|
| Tenant auth routes (login/register/2FA/passkeys) are registered by Fortify
| with the tenancy middleware configured in config/fortify.php.
|
*/

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
    'tenant.active',
])->group(function () {
    Route::inertia('/', 'welcome')->name('home');

    // Super-admin impersonation landing: consumes a one-time token and logs the
    // super admin in as the given tenant user, then redirects into the app.
    Route::get('/impersonate/{token}', function (string $token) {
        return UserImpersonation::makeResponse($token);
    })->name('impersonate');

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::inertia('dashboard', 'dashboard')->name('dashboard');
    });

    require __DIR__.'/settings.php';
    require __DIR__.'/admin.php';
});
