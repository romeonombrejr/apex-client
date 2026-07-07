<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    /**
     * The client-facing catalog of active services, each with its attached
     * form definition so the detail modal renders client-side.
     */
    public function index(Request $request): Response
    {
        $services = Service::with(['form.fields', 'category'])
            ->where('is_active', true)
            ->orderBy('position')
            ->orderBy('name')
            ->get()
            ->map(fn (Service $service) => $service->toCatalogArray());

        $myOrders = Order::where('user_id', $request->user()->id)
            ->latest()
            ->get(['id', 'number', 'name'])
            ->map(fn (Order $order) => [
                'id' => $order->id,
                'number' => $order->number,
                'name' => $order->name,
            ]);

        return Inertia::render('storefront/index', [
            'services' => $services,
            'myOrders' => $myOrders,
            'cartCount' => CartItem::where('user_id', $request->user()->id)->count(),
        ]);
    }
}
