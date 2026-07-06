<?php

use App\Http\Controllers\Storefront\CartController;
use App\Http\Controllers\Storefront\CheckoutController;
use App\Http\Controllers\Storefront\CreditController;
use App\Http\Controllers\Storefront\InvoiceController;
use App\Http\Controllers\Storefront\OrderController;
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

        Route::get('cart', [CartController::class, 'index'])->name('cart.index');
        Route::post('cart', [CartController::class, 'store'])->name('cart.store');
        Route::match(['put', 'patch'], 'cart/{cartItem}', [CartController::class, 'update'])->name('cart.update');
        Route::delete('cart/{cartItem}', [CartController::class, 'destroy'])->name('cart.destroy');

        Route::post('checkout', [CheckoutController::class, 'store'])->name('checkout.store');

        Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');

        Route::get('invoices', [InvoiceController::class, 'index'])->name('invoices.index');
        Route::get('invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');

        Route::get('credits', [CreditController::class, 'index'])->name('credits.index');
    });
