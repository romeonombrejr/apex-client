<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use App\Models\Theme;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $branding = $this->branding();

        // Resolve guards explicitly: `auth:superadmin` sets the default guard to
        // `superadmin`, so a bare $request->user() on those routes would return a
        // SuperAdmin (which has no roles/permissions). Tenant users are always the
        // `web` guard; the super admin is the `superadmin` guard.
        $user = $request->user('web');

        return [
            ...parent::share($request),
            'name' => $branding['app_name'] ?? config('app.name'),
            'branding' => $branding,
            'theme' => tenant() ? Theme::activePayload() : null,
            'auth' => [
                'user' => $user,
                'roles' => $user?->getRoleNames() ?? [],
                'permissions' => $user?->getAllPermissions()->pluck('name') ?? [],
            ],
            'superAdmin' => $request->user('superadmin'),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * Branding comes from the tenant's `settings` table, which only exists once
     * tenancy is initialized. On central (super-admin) requests, fall back to
     * config defaults so we never query a nonexistent central `settings` table.
     *
     * @return array<string, string|null>
     */
    protected function branding(): array
    {
        if (tenant()) {
            return Setting::branding();
        }

        return [
            'app_name' => config('app.name'),
            'logo_path' => null,
            'favicon_path' => null,
            'primary_color' => null,
            'seo_title' => null,
            'seo_description' => null,
            'seo_keywords' => null,
        ];
    }
}
