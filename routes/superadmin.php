<?php

use App\Http\Controllers\Superadmin\BackupController;
use App\Http\Controllers\Superadmin\DashboardController;
use App\Http\Controllers\Superadmin\ImpersonationController;
use App\Http\Controllers\Superadmin\LoginController;
use App\Http\Controllers\Superadmin\PasskeyController;
use App\Http\Controllers\Superadmin\PasskeyLoginController;
use App\Http\Controllers\Superadmin\PlanController;
use App\Http\Controllers\Superadmin\Settings\ProfileController;
use App\Http\Controllers\Superadmin\Settings\SecurityController;
use App\Http\Controllers\Superadmin\TenantController;
use App\Http\Controllers\Superadmin\TwoFactorChallengeController;
use App\Http\Controllers\Superadmin\TwoFactorController;
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
    // Unauthenticated: login + the second-factor challenge steps.
    Route::middleware('guest:superadmin')->group(function () {
        Route::get('login', [LoginController::class, 'create'])->name('login');
        Route::post('login', [LoginController::class, 'store'])->name('login.store');

        Route::get('two-factor-challenge', [TwoFactorChallengeController::class, 'create'])->name('two-factor.login');
        Route::post('two-factor-challenge', [TwoFactorChallengeController::class, 'store'])->name('two-factor.login.store');

        Route::get('passkeys/login/options', [PasskeyLoginController::class, 'options'])->name('passkeys.login.options');
        Route::post('passkeys/login', [PasskeyLoginController::class, 'store'])->name('passkeys.login');
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

        // Platform-wide DB backups (per tenant + central).
        Route::get('backups', [BackupController::class, 'index'])->name('backups.index');
        Route::post('backups/run', [BackupController::class, 'run'])->name('backups.run');
        Route::get('backups/{scope}/{path}/download', [BackupController::class, 'download'])->name('backups.download');
        Route::delete('backups/{scope}/{path}', [BackupController::class, 'destroy'])->name('backups.destroy');

        // Account settings
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::redirect('/', '/superadmin/settings/profile');
            Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
            Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
            Route::get('security', [SecurityController::class, 'edit'])->name('security.edit');
            Route::put('password', [SecurityController::class, 'updatePassword'])->name('password.update');
        });

        // Two-factor management
        Route::post('two-factor', [TwoFactorController::class, 'store'])->name('two-factor.enable');
        Route::post('two-factor/confirm', [TwoFactorController::class, 'confirm'])->name('two-factor.confirm');
        Route::delete('two-factor', [TwoFactorController::class, 'destroy'])->name('two-factor.disable');
        Route::get('two-factor/qr-code', [TwoFactorController::class, 'qrCode'])->name('two-factor.qr-code');
        Route::get('two-factor/recovery-codes', [TwoFactorController::class, 'recoveryCodes'])->name('two-factor.recovery-codes');

        // Passkey management
        Route::get('passkeys/register/options', [PasskeyController::class, 'options'])->name('passkeys.register.options');
        Route::post('passkeys', [PasskeyController::class, 'store'])->name('passkeys.store');
        Route::delete('passkeys/{superAdminPasskey}', [PasskeyController::class, 'destroy'])->name('passkeys.destroy');
    });
});
