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
                'suites' => $plan->allowedSuites(),
                'tenants_count' => Tenant::where('plan_id', $plan->id)->count(),
            ]),
            'availableSuites' => $this->availableSuites(),
        ]);
    }

    public function store(StorePlanRequest $request): RedirectResponse
    {
        Plan::create($this->planAttributes($request));

        return redirect()->route('superadmin.plans.index');
    }

    public function update(StorePlanRequest $request, Plan $plan): RedirectResponse
    {
        $plan->update($this->planAttributes($request, $plan));

        return redirect()->route('superadmin.plans.index');
    }

    public function destroy(Plan $plan): RedirectResponse
    {
        abort_if($plan->tenants()->exists(), 422, 'Cannot delete a plan that still has tenants.');

        $plan->delete();

        return redirect()->route('superadmin.plans.index');
    }

    /**
     * Map the validated request onto plan columns, folding the `suites`
     * entitlement into the `features` JSON while preserving other feature keys.
     *
     * @return array<string, mixed>
     */
    protected function planAttributes(StorePlanRequest $request, ?Plan $plan = null): array
    {
        $data = $request->validated();
        $suites = $data['suites'] ?? [];
        unset($data['suites']);

        $features = $plan?->features ?? [];
        $features['suites'] = array_values($suites);
        $data['features'] = $features;

        return $data;
    }

    /**
     * The registered suites available to unlock, for the plan form UI.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function availableSuites(): array
    {
        return collect(config('suites', []))
            ->map(fn (array $suite, string $slug) => [
                'slug' => $slug,
                'name' => $suite['name'],
                'description' => $suite['description'] ?? null,
            ])
            ->values()
            ->all();
    }
}
