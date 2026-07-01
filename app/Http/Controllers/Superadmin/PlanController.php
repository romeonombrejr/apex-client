<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Superadmin\StorePlanRequest;
use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('superadmin/plans/index', [
            'plans' => Plan::orderBy('price')->get()->map(fn (Plan $plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'price' => (float) $plan->price,
                'max_users' => $plan->max_users,
                'max_storage_mb' => $plan->max_storage_mb,
                'is_active' => $plan->is_active,
                'tenants_count' => Tenant::where('plan_id', $plan->id)->count(),
            ]),
        ]);
    }

    public function store(StorePlanRequest $request): RedirectResponse
    {
        Plan::create($request->validated());

        return redirect()->route('superadmin.plans.index');
    }

    public function update(StorePlanRequest $request, Plan $plan): RedirectResponse
    {
        $plan->update($request->validated());

        return redirect()->route('superadmin.plans.index');
    }

    public function destroy(Plan $plan): RedirectResponse
    {
        abort_if($plan->tenants()->exists(), 422, 'Cannot delete a plan that still has tenants.');

        $plan->delete();

        return redirect()->route('superadmin.plans.index');
    }
}
