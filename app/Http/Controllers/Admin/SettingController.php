<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Show the app settings form.
     */
    public function edit(): Response
    {
        return Inertia::render('admin/settings/edit', [
            'setting' => Setting::branding(),
        ]);
    }

    /**
     * Update the app settings.
     */
    public function update(UpdateSettingRequest $request): RedirectResponse
    {
        $setting = Setting::current();

        $setting->fill([
            'app_name' => $request->app_name,
            'primary_color' => $request->primary_color,
            'seo_title' => $request->seo_title,
            'seo_description' => $request->seo_description,
            'seo_keywords' => $request->seo_keywords,
        ]);

        if ($request->hasFile('logo')) {
            if ($setting->logo_path) {
                Storage::disk('public')->delete($setting->logo_path);
            }
            $setting->logo_path = $request->file('logo')->store('settings', 'public');
        }

        if ($request->hasFile('favicon')) {
            if ($setting->favicon_path) {
                Storage::disk('public')->delete($setting->favicon_path);
            }
            $setting->favicon_path = $request->file('favicon')->store('settings', 'public');
        }

        $setting->save();

        activity()->causedBy($request->user())->performedOn($setting)->log('Updated app settings.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Settings updated.')]);

        return to_route('admin.settings.edit');
    }
}
