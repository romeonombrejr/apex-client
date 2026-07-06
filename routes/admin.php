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
use App\Http\Controllers\Admin\Storefront\OrderStatusController;
use App\Http\Controllers\Admin\Storefront\ServiceController;
use App\Http\Controllers\Admin\ThemeController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::redirect('/', '/admin/dashboard');

    Route::middleware('permission:users.manage')->group(function () {
        Route::resource('users', UserController::class)->except(['show']);
    });

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
            Route::resource('forms', FormController::class)->except(['show']);
            Route::resource('services', ServiceController::class)->except(['show']);
            Route::resource('statuses', OrderStatusController::class)->only(['index', 'store', 'update', 'destroy']);

            Route::get('credits', [CreditController::class, 'index'])->name('credits.index');
            Route::post('credits', [CreditController::class, 'store'])->name('credits.store');
            Route::get('credits/{user}', [CreditController::class, 'show'])->name('credits.show');

            Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
            Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
            Route::put('orders/{order}', [OrderController::class, 'update'])->name('orders.update');

            Route::get('invoices', [InvoiceController::class, 'index'])->name('invoices.index');
            Route::get('invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');
            Route::post('invoices/{invoice}/refund', [InvoiceController::class, 'refund'])->name('invoices.refund');
        });
});
