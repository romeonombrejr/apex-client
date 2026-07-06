<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $invoices = Invoice::where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (Invoice $invoice) => $invoice->toRowArray());

        return Inertia::render('storefront/invoices/index', [
            'invoices' => $invoices,
        ]);
    }

    public function show(Request $request, Invoice $invoice): Response
    {
        abort_unless($invoice->user_id === $request->user()->id, 403);

        $invoice->load('items.order');

        return Inertia::render('storefront/invoices/show', [
            'invoice' => $invoice->toDetailArray(),
        ]);
    }
}
