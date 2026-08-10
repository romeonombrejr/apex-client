<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ThemeRequest;
use App\Models\Theme;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ThemeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/settings/themes', [
            'themes' => Theme::orderBy('name')->get()->map(fn (Theme $theme) => [
                'id' => $theme->id,
                'name' => $theme->name,
                'light' => $theme->light,
                'dark' => $theme->dark,
                'radius' => $theme->radius,
                'button_size' => $theme->button_size,
                'fonts' => $theme->fonts,
                'is_active' => $theme->is_active,
            ]),
            'activeThemeId' => Theme::where('is_active', true)->value('id'),
            'fontOptions' => config('theme-fonts.families'),
            'defaultFont' => config('theme-fonts.default'),
        ]);
    }

    public function store(ThemeRequest $request): RedirectResponse
    {
        $theme = Theme::create($request->validated());

        activity()->causedBy($request->user())->performedOn($theme)->log('Created theme.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Theme saved.')]);

        return to_route('admin.themes.index');
    }

    public function update(ThemeRequest $request, Theme $theme): RedirectResponse
    {
        $theme->update($request->validated());

        activity()->causedBy($request->user())->performedOn($theme)->log('Updated theme.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Theme updated.')]);

        return to_route('admin.themes.index');
    }

    public function activate(Request $request, Theme $theme): RedirectResponse
    {
        DB::transaction(function () use ($theme) {
            Theme::where('is_active', true)->update(['is_active' => false]);
            Theme::whereKey($theme->id)->update(['is_active' => true]);
        });

        // Bulk updates bypass model events, so flush the active-theme cache manually.
        Theme::flushActiveCache();

        activity()->causedBy($request->user())->performedOn($theme)->log('Activated theme.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Theme activated.')]);

        return back();
    }

    public function reset(Request $request): RedirectResponse
    {
        Theme::where('is_active', true)->update(['is_active' => false]);
        Theme::flushActiveCache();

        activity()->causedBy($request->user())->log('Reset theme to default.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Reset to the default theme.')]);

        return back();
    }

    public function destroy(Request $request, Theme $theme): RedirectResponse
    {
        $theme->delete();

        activity()->causedBy($request->user())->log('Deleted theme '.$theme->name.'.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Theme deleted.')]);

        return to_route('admin.themes.index');
    }
}
