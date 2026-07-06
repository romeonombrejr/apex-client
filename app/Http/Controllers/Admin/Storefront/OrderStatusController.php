<?php

namespace App\Http\Controllers\Admin\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Storefront\SaveOrderStatusRequest;
use App\Models\OrderStatus;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrderStatusController extends Controller
{
    public function index(): Response
    {
        $statuses = OrderStatus::withCount('orders')->orderBy('position')->get()
            ->map(fn (OrderStatus $status) => [
                'id' => $status->id,
                'name' => $status->name,
                'color' => $status->color,
                'position' => $status->position,
                'is_default' => $status->is_default,
                'is_completed' => $status->is_completed,
                'is_protected' => $status->is_protected,
                'orders_count' => $status->orders_count,
            ]);

        return Inertia::render('admin/storefront/statuses/index', [
            'statuses' => $statuses,
        ]);
    }

    public function store(SaveOrderStatusRequest $request): RedirectResponse
    {
        $status = OrderStatus::create([
            ...$request->validated(),
            'position' => $request->input('position', OrderStatus::max('position') + 1),
        ]);

        $this->enforceSingleDefault($status);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Status created.')]);

        return to_route('admin.storefront.statuses.index');
    }

    public function update(SaveOrderStatusRequest $request, OrderStatus $status): RedirectResponse
    {
        $status->update($request->validated());

        $this->enforceSingleDefault($status);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Status updated.')]);

        return to_route('admin.storefront.statuses.index');
    }

    public function destroy(OrderStatus $status): RedirectResponse
    {
        abort_if($status->is_protected, 403, 'This status cannot be deleted.');
        abort_if($status->orders()->exists(), 422, 'Cannot delete a status that is in use.');

        $status->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Status deleted.')]);

        return to_route('admin.storefront.statuses.index');
    }

    /**
     * Only one status may be the default at a time.
     */
    protected function enforceSingleDefault(OrderStatus $status): void
    {
        if ($status->is_default) {
            OrderStatus::where('id', '!=', $status->id)->update(['is_default' => false]);
        }
    }
}
