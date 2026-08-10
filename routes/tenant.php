<?php

declare(strict_types=1);

use App\Http\Controllers\InvitationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\TenantImpersonationController;
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

    // Magic-link invitation acceptance: public (the invitee is not yet logged
    // in). Two-step — the GET only shows a confirmation page; the POST behind
    // its button consumes the token, so prefetchers and link scanners that
    // only ever GET can't sign anyone in.
    Route::get('/invitations/{token}', [InvitationController::class, 'show'])->name('invitations.accept');
    Route::post('/invitations/{token}', [InvitationController::class, 'store'])->name('invitations.accept.store');

    // Auth-only, but not `verified`: onboarding sets the first password right
    // after acceptance, and stop-impersonating must work as the impersonated
    // (possibly non-admin) user.
    Route::middleware('auth')->group(function () {
        Route::get('onboarding/password', [OnboardingController::class, 'edit'])->name('onboarding.password.edit');
        Route::post('onboarding/password', [OnboardingController::class, 'update'])->name('onboarding.password.update');

        Route::post('stop-impersonating', [TenantImpersonationController::class, 'leave'])->name('impersonate.leave');
    });

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::inertia('dashboard', 'dashboard')->name('dashboard');

        Route::post('notifications/{id}/read', [NotificationController::class, 'read'])->name('notifications.read');
        Route::post('notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    });

    require __DIR__.'/settings.php';
    require __DIR__.'/admin.php';
    require __DIR__.'/storefront.php';
});
