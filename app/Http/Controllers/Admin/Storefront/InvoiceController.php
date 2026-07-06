<?php

namespace App\Http\Controllers\Admin\Storefront;

use App\Http\Controllers\Controller;
use App\Models\CreditTransaction;
use App\Models\Invoice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(): Response
    {
        $invoices = Invoice::with('user')->latest()->get()
            ->map(fn (Invoice $invoice) => $invoice->toRowArray());

        return Inertia::render('admin/storefront/invoices/index', [
            'invoices' => $invoices,
        ]);
    }

    public function show(Invoice $invoice): Response
    {
        $invoice->load(['items.order', 'user']);

        return Inertia::render('admin/storefront/invoices/show', [
            'invoice' => $invoice->toDetailArray(),
        ]);
    }

    public function refund(Request $request, Invoice $invoice): RedirectResponse
    {
        abort_unless($invoice->status === 'paid', 422, 'Only a paid invoice can be refunded.');

        CreditTransaction::create([
            'user_id' => $invoice->user_id,
            'amount' => (float) $invoice->total,
            'type' => 'refund',
            'invoice_id' => $invoice->id,
            'note' => __('Refund for :number', ['number' => $invoice->number]),
            'created_by' => $request->user()->id,
        ]);

        $invoice->update(['status' => 'refunded']);

        activity()->causedBy($request->user())->performedOn($invoice)->log('Refunded invoice.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Invoice refunded.')]);

        return to_route('admin.storefront.invoices.show', $invoice->id);
    }
}
