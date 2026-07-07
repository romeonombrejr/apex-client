<?php

namespace App\Console\Commands;

use App\Models\CreditTransaction;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use App\Notifications\Storefront\StorefrontNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Schema;

class RenewSubscriptions extends Command
{
    protected $signature = 'storefront:renew-subscriptions';

    protected $description = 'Auto-bill due storefront subscriptions from client credits (all tenants).';

    public function handle(): int
    {
        Tenant::all()->each(function (Tenant $tenant) {
            $tenant->run(function () {
                if (! Schema::hasTable('subscriptions')) {
                    return;
                }

                Subscription::with(['user', 'service'])
                    ->where('status', 'active')
                    ->whereDate('next_renewal_at', '<=', now())
                    ->get()
                    ->each(fn (Subscription $sub) => $this->renew($sub));
            });
        });

        return self::SUCCESS;
    }

    protected function renew(Subscription $sub): void
    {
        $user = $sub->user;

        if (! $user) {
            return;
        }

        $price = (float) $sub->price;
        $name = $sub->service?->name ?? __('Subscription');

        if ($user->creditBalance() < $price) {
            $sub->update(['status' => 'past_due']);

            $user->notify(new StorefrontNotification(
                title: __('Subscription payment failed'),
                message: __('Not enough credits to renew :name.', ['name' => $name]),
                url: route('storefront.credits.index', [], false),
            ));

            Notification::send(
                User::permission('storefront.manage')->get(),
                new StorefrontNotification(
                    title: __('Subscription past due'),
                    message: __(':client could not renew :name.', ['client' => $user->name, 'name' => $name]),
                ),
            );

            return;
        }

        DB::transaction(function () use ($sub, $user, $price, $name) {
            $invoice = Invoice::create([
                'number' => 'PENDING',
                'user_id' => $user->id,
                'status' => 'paid',
                'subtotal' => $price,
                'total' => $price,
                'paid_at' => now(),
            ]);
            $invoice->update(['number' => 'INV-'.str_pad((string) $invoice->id, 5, '0', STR_PAD_LEFT)]);

            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'service_id' => $sub->service_id,
                'name' => __(':name renewal', ['name' => $name]),
                'unit_price' => $price,
                'quantity' => 1,
                'total' => $price,
            ]);

            CreditTransaction::create([
                'user_id' => $user->id,
                'amount' => -$price,
                'type' => 'purchase',
                'invoice_id' => $invoice->id,
                'note' => __('Subscription renewal (:number)', ['number' => $invoice->number]),
            ]);

            $start = $sub->current_period_end;
            $end = $sub->interval === 'yearly' ? $start->copy()->addYear() : $start->copy()->addMonth();

            $sub->update([
                'current_period_start' => $start,
                'current_period_end' => $end,
                'next_renewal_at' => $end,
            ]);
        });

        $user->notify(new StorefrontNotification(
            title: __('Subscription renewed'),
            message: __(':name renewed for another period.', ['name' => $name]),
            url: route('storefront.invoices.index', [], false),
        ));
    }
}
