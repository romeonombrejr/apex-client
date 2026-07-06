<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
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
        $services = Service::with('form.fields')
            ->where('is_active', true)
            ->orderBy('position')
            ->orderBy('name')
            ->get()
            ->map(fn (Service $service) => $service->toCatalogArray());

        return Inertia::render('storefront/index', [
            'services' => $services,
            'cartCount' => CartItem::where('user_id', $request->user()->id)->count(),
        ]);
    }
}
