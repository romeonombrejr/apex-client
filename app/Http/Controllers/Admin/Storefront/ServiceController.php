<?php

namespace App\Http\Controllers\Admin\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Storefront\SaveServiceRequest;
use App\Models\Form;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(): Response
    {
        $services = Service::with(['form:id,name', 'category:id,name'])->orderBy('position')->orderBy('name')->get()
            ->map(fn (Service $service) => [
                'id' => $service->id,
                'name' => $service->name,
                'type' => $service->type,
                'billing_interval' => $service->billing_interval,
                'price' => (float) $service->price,
                'form' => $service->form?->name,
                'category' => $service->category?->name,
                'is_active' => $service->is_active,
                'image_url' => $service->imageUrl(),
            ]);

        return Inertia::render('admin/storefront/services/index', [
            'services' => $services,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/storefront/services/create', [
            'forms' => $this->formOptions(),
            'categories' => $this->categoryOptions(),
            'types' => Service::TYPES,
            'intervals' => Service::INTERVALS,
        ]);
    }

    public function store(SaveServiceRequest $request): RedirectResponse
    {
        $service = new Service($this->attributes($request));
        $service->slug = $this->uniqueSlug($request->name);

        if ($request->hasFile('image')) {
            $service->image_path = $request->file('image')->store('storefront', 'public');
            $service->image_disk = 'public';
        }

        $service->save();

        activity()->causedBy($request->user())->performedOn($service)->log('Created service.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Service created.')]);

        return to_route('admin.storefront.services.index');
    }

    public function edit(Service $service): Response
    {
        return Inertia::render('admin/storefront/services/edit', [
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'type' => $service->type,
                'billing_interval' => $service->billing_interval,
                'price' => (float) $service->price,
                'form_id' => $service->form_id,
                'service_category_id' => $service->service_category_id,
                'is_active' => $service->is_active,
                'position' => $service->position,
                'image_url' => $service->imageUrl(),
            ],
            'forms' => $this->formOptions(),
            'categories' => $this->categoryOptions(),
            'types' => Service::TYPES,
            'intervals' => Service::INTERVALS,
        ]);
    }

    public function update(SaveServiceRequest $request, Service $service): RedirectResponse
    {
        $service->fill($this->attributes($request));

        if ($request->hasFile('image')) {
            if ($service->image_path) {
                Storage::disk($service->image_disk)->delete($service->image_path);
            }
            $service->image_path = $request->file('image')->store('storefront', 'public');
            $service->image_disk = 'public';
        }

        $service->save();

        activity()->causedBy($request->user())->performedOn($service)->log('Updated service.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Service updated.')]);

        return to_route('admin.storefront.services.index');
    }

    public function duplicate(Request $request, Service $service): RedirectResponse
    {
        $copy = $service->replicate(['slug', 'image_path']);
        $copy->slug = $this->uniqueSlug($service->name.' copy');
        $copy->is_active = false;

        if ($service->image_path && Storage::disk($service->image_disk)->exists($service->image_path)) {
            $ext = pathinfo($service->image_path, PATHINFO_EXTENSION);
            $newPath = 'storefront/'.Str::random(40).($ext ? '.'.$ext : '');
            Storage::disk($service->image_disk)->copy($service->image_path, $newPath);
            $copy->image_path = $newPath;
        }

        $copy->save();

        activity()->causedBy($request->user())->performedOn($copy)->log('Duplicated service.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Service duplicated.')]);

        return to_route('admin.storefront.services.edit', $copy->id);
    }

    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:services,id'],
        ]);

        foreach ($validated['ids'] as $position => $id) {
            Service::where('id', $id)->update(['position' => $position]);
        }

        return back();
    }

    public function destroy(Request $request, Service $service): RedirectResponse
    {
        if ($service->image_path) {
            Storage::disk($service->image_disk)->delete($service->image_path);
        }

        activity()->causedBy($request->user())->performedOn($service)->log('Deleted service.');

        $service->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Service deleted.')]);

        return to_route('admin.storefront.services.index');
    }

    /**
     * Non-file attributes shared by store and update.
     *
     * @return array<string, mixed>
     */
    protected function attributes(SaveServiceRequest $request): array
    {
        $isSubscription = $request->input('type') === 'subscription';

        return [
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'billing_interval' => $isSubscription ? $request->billing_interval : null,
            'price' => $request->price,
            'form_id' => $request->form_id,
            'service_category_id' => $request->service_category_id,
            'is_active' => $request->boolean('is_active'),
            'position' => (int) $request->input('position', 0),
        ];
    }

    protected function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'service';
        $slug = $base;
        $i = 1;

        while (Service::where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$i);
        }

        return $slug;
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    protected function formOptions()
    {
        return Form::orderBy('name')->get(['id', 'name'])
            ->map(fn (Form $form) => ['id' => $form->id, 'name' => $form->name]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    protected function categoryOptions()
    {
        return ServiceCategory::orderBy('position')->get(['id', 'name'])
            ->map(fn (ServiceCategory $category) => ['id' => $category->id, 'name' => $category->name]);
    }
}
