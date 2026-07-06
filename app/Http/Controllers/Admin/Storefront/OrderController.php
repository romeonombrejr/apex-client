<?php

namespace App\Http\Controllers\Admin\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Storefront\UpdateOrderRequest;
use App\Models\Order;
use App\Models\OrderStatus;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): Response
    {
        $orders = Order::with(['status', 'user', 'assignee'])->latest()->get()
            ->map(fn (Order $order) => $order->toRowArray());

        return Inertia::render('admin/storefront/orders/index', [
            'orders' => $orders,
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['status', 'user', 'assignee', 'invoice', 'service.form.fields']);

        return Inertia::render('admin/storefront/orders/show', [
            'order' => $order->toDetailArray(),
            'statuses' => OrderStatus::orderBy('position')->get(['id', 'name', 'color']),
            'assignees' => User::role(['admin', 'staff'])->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateOrderRequest $request, Order $order): RedirectResponse
    {
        $status = OrderStatus::findOrFail($request->order_status_id);

        $order->order_status_id = $status->id;
        $order->assigned_to = $request->assigned_to;
        $order->completed_at = $status->is_completed ? ($order->completed_at ?? now()) : null;
        $order->save();

        activity()->causedBy($request->user())->performedOn($order)->log('Updated order.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Order updated.')]);

        return to_route('admin.storefront.orders.show', $order->id);
    }
}
