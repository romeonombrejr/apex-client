<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Superadmin\StoreDomainRequest;
use App\Http\Requests\Superadmin\StoreTenantRequest;
use App\Http\Requests\Superadmin\UpdateTenantRequest;
use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Stancl\Tenancy\Database\Models\Domain;

class TenantController extends Controller
{
    public function index(): Response
    {
        $tenants = Tenant::with(['plan', 'domains'])->latest()->get()->map(fn (Tenant $tenant) => [
            'id' => $tenant->id,
            'name' => $tenant->name,
            'status' => $tenant->status,
            'plan' => $tenant->plan?->name,
            'domains' => $tenant->domains->pluck('domain'),
            'created_at' => $tenant->created_at?->toDateString(),
        ]);

        return Inertia::render('superadmin/tenants/index', [
            'tenants' => $tenants,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('superadmin/tenants/create', [
            'plans' => $this->planOptions(),
        ]);
    }

    public function store(StoreTenantRequest $request): RedirectResponse
    {
        $tenant = Tenant::create([
            'name' => $request->name,
            'plan_id' => $request->plan_id,
            'status' => 'active',
        ]);

        // Triggers the tenancy pipeline: creates the DB, migrates and seeds it.
        $tenant->domains()->create(['domain' => $request->domain]);

        activity()
            ->causedBy($request->user('superadmin'))
            ->performedOn($tenant)
            ->withProperties(['domain' => $request->domain])
            ->log('Provisioned tenant.');

        return redirect()->route('superadmin.tenants.index');
    }

    public function edit(Tenant $tenant): Response
    {
        $tenant->load('domains');

        return Inertia::render('superadmin/tenants/edit', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'status' => $tenant->status,
                'plan_id' => $tenant->plan_id,
                'enabled_suites' => $tenant->enabledSuites(),
                'domains' => $tenant->domains->map(fn (Domain $d) => [
                    'id' => $d->id,
                    'domain' => $d->domain,
                ]),
            ],
            'plans' => $this->planOptions(),
            'availableSuites' => $this->availableSuites(),
        ]);
    }

    public function update(UpdateTenantRequest $request, Tenant $tenant): RedirectResponse
    {
        $tenant->update([
            'name' => $request->name,
            'plan_id' => $request->plan_id,
            'enabled_suites' => array_values((array) $request->input('enabled_suites', [])),
        ]);

        activity()
            ->causedBy($request->user('superadmin'))
            ->performedOn($tenant)
            ->log('Updated tenant.');

        return redirect()->route('superadmin.tenants.index');
    }

    public function suspend(Request $request, Tenant $tenant): RedirectResponse
    {
        $tenant->update(['status' => 'suspended']);

        activity()->causedBy($request->user('superadmin'))->performedOn($tenant)->log('Suspended tenant.');

        return back();
    }

    public function resume(Request $request, Tenant $tenant): RedirectResponse
    {
        $tenant->update(['status' => 'active']);

        activity()->causedBy($request->user('superadmin'))->performedOn($tenant)->log('Resumed tenant.');

        return back();
    }

    public function destroy(Request $request, Tenant $tenant): RedirectResponse
    {
        // Triggers the DeleteDatabase job, dropping the tenant's database.
        $tenant->delete();

        activity()->causedBy($request->user('superadmin'))->log('Deleted tenant '.$tenant->name.'.');

        return redirect()->route('superadmin.tenants.index');
    }

    public function addDomain(StoreDomainRequest $request, Tenant $tenant): RedirectResponse
    {
        $tenant->domains()->create(['domain' => $request->domain]);

        return back();
    }

    public function removeDomain(Tenant $tenant, Domain $domain): RedirectResponse
    {
        abort_unless($domain->tenant_id === $tenant->id, 404);

        $domain->delete();

        return back();
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    protected function planOptions()
    {
        return Plan::where('is_active', true)->orderBy('price')->get()
            ->map(fn (Plan $plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'max_users' => $plan->max_users,
                'suites' => $plan->allowedSuites(),
            ]);
    }

    /**
     * The registered suites, keyed for the enablement UI labels.
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
