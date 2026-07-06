<?php

use App\Http\Controllers\Storefront\StorefrontController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Storefront Suite Routes
|--------------------------------------------------------------------------
|
| Registered inside the tenant group (see routes/tenant.php). Gated by the
| `suite:storefront` middleware (tenant must have the suite active) and the
| `storefront.view` permission. A disabled suite therefore 404s.
|
*/

Route::middleware(['auth', 'verified', 'suite:storefront', 'permission:storefront.view'])
    ->prefix('storefront')
    ->name('storefront.')
    ->group(function () {
        Route::get('/', [StorefrontController::class, 'index'])->name('index');
    });
