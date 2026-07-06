<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\StoreCartItemRequest;
use App\Http\Requests\Storefront\UpdateCartItemRequest;
use App\Models\CartItem;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(Request $request): Response
    {
        $items = CartItem::with('service.form.fields')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (CartItem $item) => [
                'id' => $item->id,
                'quantity' => $item->quantity,
                'selected' => $item->selected,
                'answers' => $item->form_answers ?? [],
                'complete' => $item->isComplete(),
                'line_total' => round((float) $item->price_snapshot * $item->quantity, 2),
                'service' => $item->service->toCatalogArray(),
            ]);

        $selectedTotal = $items
            ->filter(fn (array $item) => $item['selected'])
            ->sum(fn (array $item) => $item['line_total']);

        return Inertia::render('storefront/cart', [
            'items' => $items,
            'creditBalance' => $request->user()->creditBalance(),
            'selectedTotal' => round($selectedTotal, 2),
        ]);
    }

    public function store(StoreCartItemRequest $request): RedirectResponse
    {
        $service = Service::findOrFail($request->service_id);
        abort_unless($service->is_active, 404);

        // Each add is its own line item so a client can order the same service
        // multiple times with different form answers.
        CartItem::create([
            'user_id' => $request->user()->id,
            'service_id' => $service->id,
            'quantity' => $request->quantity,
            'selected' => true,
            'form_answers' => $this->mergeAnswers($request, []) ?: null,
            'price_snapshot' => $service->price,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Added to cart.')]);

        return to_route('storefront.cart.index');
    }

    public function update(UpdateCartItemRequest $request, CartItem $cartItem): RedirectResponse
    {
        abort_unless($cartItem->user_id === $request->user()->id, 403);

        $data = [];

        if ($request->has('quantity')) {
            $data['quantity'] = $request->integer('quantity');
        }

        if ($request->has('selected')) {
            $data['selected'] = $request->boolean('selected');
        }

        if ($request->has('answers') || $request->hasFile('files')) {
            $data['form_answers'] = $this->mergeAnswers($request, $cartItem->form_answers ?? []) ?: null;
        }

        $cartItem->update($data);

        return back();
    }

    public function destroy(Request $request, CartItem $cartItem): RedirectResponse
    {
        abort_unless($cartItem->user_id === $request->user()->id, 403);

        $cartItem->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Item removed.')]);

        return back();
    }

    /**
     * Merge submitted scalar answers and uploaded files onto the existing
     * answers. Files are stored on the tenant public disk; their path is saved
     * under the field key (replacing any previous upload for that field).
     *
     * @param  array<string, mixed>  $existing
     * @return array<string, mixed>
     */
    protected function mergeAnswers(Request $request, array $existing): array
    {
        $answers = array_merge($existing, (array) $request->input('answers', []));

        foreach ((array) $request->file('files', []) as $key => $file) {
            $answers[$key] = $file->store('storefront/cart', 'public');
        }

        return array_filter($answers, fn ($value) => $value !== null && $value !== '');
    }
}
