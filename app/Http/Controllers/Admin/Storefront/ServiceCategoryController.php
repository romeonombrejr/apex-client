<?php

namespace App\Http\Controllers\Admin\Storefront;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceCategoryController extends Controller
{
    public function index(): Response
    {
        $categories = ServiceCategory::withCount('services')->orderBy('position')->get()
            ->map(fn (ServiceCategory $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'services_count' => $category->services_count,
            ]);

        return Inertia::render('admin/storefront/categories/index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate(['name' => ['required', 'string', 'max:255']]);

        ServiceCategory::create([
            'name' => $validated['name'],
            'position' => ServiceCategory::max('position') + 1,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category created.')]);

        return back();
    }

    public function update(Request $request, ServiceCategory $category): RedirectResponse
    {
        $validated = $request->validate(['name' => ['required', 'string', 'max:255']]);

        $category->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category updated.')]);

        return back();
    }

    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:service_categories,id'],
        ]);

        foreach ($validated['ids'] as $position => $id) {
            ServiceCategory::where('id', $id)->update(['position' => $position]);
        }

        return back();
    }

    public function destroy(ServiceCategory $category): RedirectResponse
    {
        // Services keep existing; their service_category_id is null-on-delete.
        $category->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category deleted.')]);

        return back();
    }
}
