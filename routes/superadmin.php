<?php

use App\Http\Controllers\Superadmin\DashboardController;
use App\Http\Controllers\Superadmin\ImpersonationController;
use App\Http\Controllers\Superadmin\LoginController;
use App\Http\Controllers\Superadmin\PlanController;
use App\Http\Controllers\Superadmin\TenantController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Super-Admin Routes (central domain only)
|--------------------------------------------------------------------------
|
| Authenticated with the dedicated `superadmin` guard, separate from tenant
| users. Loaded from within the central-domain group in routes/web.php.
|
*/

Route::prefix('superadmin')->name('superadmin.')->group(function () {
    Route::middleware('guest:superadmin')->group(function () {
        Route::get('login', [LoginController::class, 'create'])->name('login');
        Route::post('login', [LoginController::class, 'store'])->name('login.store');
    });

    Route::middleware('auth:superadmin')->group(function () {
        Route::post('logout', [LoginController::class, 'destroy'])->name('logout');

        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::resource('tenants', TenantController::class)->except(['show']);
        Route::post('tenants/{tenant}/suspend', [TenantController::class, 'suspend'])->name('tenants.suspend');
        Route::post('tenants/{tenant}/resume', [TenantController::class, 'resume'])->name('tenants.resume');
        Route::post('tenants/{tenant}/domains', [TenantController::class, 'addDomain'])->name('tenants.domains.store');
        Route::delete('tenants/{tenant}/domains/{domain}', [TenantController::class, 'removeDomain'])->name('tenants.domains.destroy');
        Route::post('tenants/{tenant}/impersonate', [ImpersonationController::class, 'store'])->name('tenants.impersonate');

        Route::resource('plans', PlanController::class)->except(['show', 'create', 'edit']);
    });
});
