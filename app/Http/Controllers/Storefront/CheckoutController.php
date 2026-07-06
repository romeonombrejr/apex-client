<?php

namespace App\Http\Controllers\Storefront;

use App\Actions\Storefront\ProcessCheckout;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function store(Request $request, ProcessCheckout $checkout): RedirectResponse
    {
        try {
            $invoice = $checkout($request->user());
        } catch (ValidationException $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $e->validator->errors()->first()]);

            return back();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Order placed.')]);

        return to_route('storefront.invoices.show', $invoice->id);
    }
}
