<?php

namespace App\Http\Controllers\Superadmin\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the super admin's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('superadmin/settings/profile', [
            'superAdminProfile' => $request->user('superadmin')->only('name', 'email'),
        ]);
    }

    /**
     * Update the super admin's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $admin = $request->user('superadmin');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('super_admins', 'email')->ignore($admin->id)],
        ]);

        $admin->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('superadmin.settings.profile.edit');
    }
}
