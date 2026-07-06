<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = Order::with('status')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (Order $order) => $order->toRowArray());

        return Inertia::render('storefront/orders/index', [
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $order->load(['status', 'invoice', 'service.form.fields']);

        return Inertia::render('storefront/orders/show', [
            'order' => $order->toDetailArray(),
        ]);
    }
}
