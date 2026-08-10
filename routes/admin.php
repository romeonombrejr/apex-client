<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\BackupController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MediaFileController;
use App\Http\Controllers\Admin\MediaFolderController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\Storefront\CreditController;
use App\Http\Controllers\Admin\Storefront\FormController;
use App\Http\Controllers\Admin\Storefront\InvoiceController;
use App\Http\Controllers\Admin\Storefront\OrderController;
use App\Http\Controllers\Admin\Storefront\OrderMessageController;
use App\Http\Controllers\Admin\Storefront\OrderStatusController;
use App\Http\Controllers\Admin\Storefront\ServiceCategoryController;
use App\Http\Controllers\Admin\Storefront\ServiceController;
use App\Http\Controllers\Admin\ThemeController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserInvitationController;
use App\Http\Controllers\TenantImpersonationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::redirect('/', '/admin/dashboard');

    // User administration is split per action (see the users.* permissions):
    // staff can typically view the roster (and copy existing links) while
    // minting links, resets, edits, deletes and impersonation stay admin-only.
    // Literal segments are declared before {user} routes so they aren't
    // captured as parameters.
    Route::middleware('permission:users.create')->group(function () {
        Route::post('users/invitations', [UserInvitationController::class, 'store'])->name('users.invitations.store');
        Route::get('users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
    });

    Route::middleware('permission:users.links')->group(function () {
        Route::post('users/{user}/link', [UserInvitationController::class, 'link'])->name('users.link');
        Route::delete('users/{user}/link', [UserInvitationController::class, 'revoke'])->name('users.link.revoke');
    });

    Route::middleware('permission:users.reset')
        ->post('users/{user}/reset-link', [UserInvitationController::class, 'resetLink'])->name('users.reset-link');

    Route::middleware('permission:users.impersonate')
        ->post('users/{user}/impersonate', [TenantImpersonationController::class, 'store'])->name('users.impersonate');

    Route::middleware('permission:users.view')
        ->get('users', [UserController::class, 'index'])->name('users.index');

    Route::middleware('permission:users.edit')->group(function () {
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::match(['put', 'patch'], 'users/{user}', [UserController::class, 'update'])->name('users.update');
    });

    Route::middleware('permission:users.delete')
        ->delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    Route::middleware('permission:roles.manage')->group(function () {
        Route::resource('roles', RoleController::class)->except(['show']);
    });

    Route::middleware('permission:permissions.manage')->group(function () {
        Route::resource('permissions', PermissionController::class)->except(['show']);
    });

    Route::middleware('permission:settings.manage')->group(function () {
        Route::get('settings', [SettingController::class, 'edit'])->name('settings.edit');
        Route::post('settings', [SettingController::class, 'update'])->name('settings.update');

        Route::post('themes/reset', [ThemeController::class, 'reset'])->name('themes.reset');
        Route::post('themes/{theme}/activate', [ThemeController::class, 'activate'])->name('themes.activate');
        Route::resource('themes', ThemeController::class)->only(['index', 'store', 'update', 'destroy']);
    });

    Route::middleware('permission:backup.manage')->prefix('backup')->name('backup.')->group(function () {
        Route::get('/', [BackupController::class, 'index'])->name('index');
        Route::post('/', [BackupController::class, 'store'])->name('store');
        Route::post('{path}/restore', [BackupController::class, 'restore'])->name('restore');
        Route::get('{path}/download', [BackupController::class, 'download'])->name('download');
        Route::delete('{path}', [BackupController::class, 'destroy'])->name('destroy');
    });

    Route::middleware('permission:files.manage')->prefix('files')->name('files.')->group(function () {
        Route::get('/', [MediaFolderController::class, 'index'])->name('index');
        Route::post('folders', [MediaFolderController::class, 'store'])->name('folders.store');
        Route::delete('folders/{mediaFolder}', [MediaFolderController::class, 'destroy'])->name('folders.destroy');
        Route::post('upload', [MediaFileController::class, 'store'])->name('upload');
        Route::get('{mediaFile}/download', [MediaFileController::class, 'download'])->name('download');
        Route::delete('{mediaFile}', [MediaFileController::class, 'destroy'])->name('destroy');
    });

    Route::middleware('permission:audit-logs.view')->get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    // Storefront suite management (gated by the suite being active for the tenant).
    Route::middleware(['suite:storefront', 'permission:storefront.manage'])
        ->prefix('storefront')->name('storefront.')->group(function () {
            Route::post('forms/{form}/duplicate', [FormController::class, 'duplicate'])->name('forms.duplicate');
            Route::resource('forms', FormController::class)->except(['show']);

            Route::post('services/reorder', [ServiceController::class, 'reorder'])->name('services.reorder');
            Route::post('services/{service}/duplicate', [ServiceController::class, 'duplicate'])->name('services.duplicate');
            Route::resource('services', ServiceController::class)->except(['show']);

            Route::post('categories/reorder', [ServiceCategoryController::class, 'reorder'])->name('categories.reorder');
            Route::resource('categories', ServiceCategoryController::class)->only(['index', 'store', 'update', 'destroy']);

            Route::post('statuses/reorder', [OrderStatusController::class, 'reorder'])->name('statuses.reorder');
            Route::resource('statuses', OrderStatusController::class)->only(['index', 'store', 'update', 'destroy']);

            Route::get('credits', [CreditController::class, 'index'])->name('credits.index');
            Route::post('credits', [CreditController::class, 'store'])->name('credits.store');
            Route::get('credits/{user}', [CreditController::class, 'show'])->name('credits.show');

            Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
            Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
            Route::put('orders/{order}', [OrderController::class, 'update'])->name('orders.update');
            Route::post('orders/{order}/messages', [OrderMessageController::class, 'store'])->name('orders.messages.store');

            Route::get('invoices', [InvoiceController::class, 'index'])->name('invoices.index');
            Route::get('invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');
            Route::post('invoices/{invoice}/refund', [InvoiceController::class, 'refund'])->name('invoices.refund');
        });
});
