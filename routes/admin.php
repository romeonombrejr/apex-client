<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\BackupController;
use App\Http\Controllers\Admin\MediaFileController;
use App\Http\Controllers\Admin\MediaFolderController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController;

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
    });

    Route::middleware('permission:backup.manage')->prefix('backup')->name('backup.')->group(function () {
        Route::get('/', [BackupController::class, 'index'])->name('index');
        Route::post('/', [BackupController::class, 'store'])->name('store');
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
});
