<?php

namespace App\Actions\Storefront;

use App\Models\CartItem;
use App\Models\CreditTransaction;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Order;
use App\Models\OrderStatus;
use App\Models\Subscription;
use App\Models\User;
use App\Notifications\Storefront\StorefrontNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

class ProcessCheckout
{
    /**
     * Turn a client's selected cart items into a paid invoice, fulfillment
     * orders (and subscriptions), and a credit debit — atomically.
     *
     * @throws ValidationException when the cart is empty/incomplete or the
     *                             client cannot afford the total.
     */
    public function __invoke(User $user): Invoice
    {
        $items = CartItem::with('service.form.fields')
            ->where('user_id', $user->id)
            ->where('selected', true)
            ->get();

        if ($items->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => __('Select at least one item to check out.'),
            ]);
        }

        if ($items->contains(fn (CartItem $item) => ! $item->isComplete())) {
            throw ValidationException::withMessages([
                'cart' => __('Complete the required fields on all selected items first.'),
            ]);
        }

        $total = $items->sum(fn (CartItem $item) => (float) $item->price_snapshot * $item->quantity);

        if ($user->creditBalance() < $total) {
            throw ValidationException::withMessages([
                'cart' => __('Insufficient credits for this order.'),
            ]);
        }

        $invoice = DB::transaction(function () use ($user, $items, $total): Invoice {
            $invoice = Invoice::create([
                'number' => 'PENDING',
                'user_id' => $user->id,
                'status' => 'paid',
                'subtotal' => $total,
                'total' => $total,
                'paid_at' => now(),
            ]);
            $invoice->update(['number' => $this->number('INV', $invoice->id)]);

            $status = OrderStatus::default();

            foreach ($items as $item) {
                $service = $item->service;
                $lineTotal = (float) $item->price_snapshot * $item->quantity;

                $order = Order::create([
                    'number' => 'PENDING',
                    'user_id' => $user->id,
                    'service_id' => $service?->id,
                    'invoice_id' => $invoice->id,
                    'order_status_id' => $status?->id,
                    'name' => $service?->name ?? __('Service'),
                    'quantity' => $item->quantity,
                    'form_answers' => $item->form_answers,
                ]);
                $order->update(['number' => $this->number('ORD', $order->id)]);

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'service_id' => $service?->id,
                    'order_id' => $order->id,
                    'name' => $service?->name ?? __('Service'),
                    'unit_price' => $item->price_snapshot,
                    'quantity' => $item->quantity,
                    'total' => $lineTotal,
                ]);

                // Link any prior orders the client referenced (their own only).
                $refIds = Order::where('user_id', $user->id)
                    ->whereIn('id', (array) ($item->referenced_order_ids ?? []))
                    ->where('invoice_id', '!=', $invoice->id)
                    ->pluck('id');

                if ($refIds->isNotEmpty()) {
                    $order->references()->attach($refIds);
                }

                if ($service && $service->type === 'subscription') {
                    $start = now();
                    $end = ($service->billing_interval === 'yearly')
                        ? $start->copy()->addYear()
                        : $start->copy()->addMonth();

                    Subscription::create([
                        'user_id' => $user->id,
                        'service_id' => $service->id,
                        'order_id' => $order->id,
                        'status' => 'active',
                        'interval' => $service->billing_interval ?? 'monthly',
                        'price' => $service->price,
                        'current_period_start' => $start,
                        'current_period_end' => $end,
                        'next_renewal_at' => $end,
                    ]);
                }
            }

            CreditTransaction::create([
                'user_id' => $user->id,
                'amount' => -$total,
                'type' => 'purchase',
                'invoice_id' => $invoice->id,
                'note' => __('Order payment (:number)', ['number' => $invoice->number]),
            ]);

            CartItem::whereIn('id', $items->pluck('id'))->delete();

            return $invoice;
        });

        // Notify staff/admins after the checkout commits.
        Notification::send(
            User::permission('storefront.manage')->get(),
            new StorefrontNotification(
                title: __('New order placed'),
                message: __(':name placed :number', ['name' => $user->name, 'number' => $invoice->number]),
                url: route('admin.storefront.invoices.show', $invoice->id, false),
            ),
        );

        return $invoice;
    }

    protected function number(string $prefix, int $id): string
    {
        return $prefix.'-'.str_pad((string) $id, 5, '0', STR_PAD_LEFT);
    }
}
