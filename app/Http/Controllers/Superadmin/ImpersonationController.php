<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ImpersonationController extends Controller
{
    /**
     * Log the super admin into the tenant as its admin user.
     *
     * Mints a short-lived stancl impersonation token, then sends the browser to
     * the tenant domain's /impersonate/{token} route which establishes the session.
     * Uses Inertia::location because the target is a different (tenant) origin.
     */
    public function store(Request $request, Tenant $tenant): Response
    {
        $domain = $tenant->domains()->first();

        abort_if($domain === null, 422, 'This tenant has no domain to impersonate into.');

        // Resolve the tenant's admin user id from inside the tenant database.
        $userId = $tenant->run(function () {
            return User::role('admin')->value('id') ?? User::value('id');
        });

        abort_if($userId === null, 422, 'This tenant has no users to impersonate.');

        $token = tenancy()->impersonate($tenant, (string) $userId, '/dashboard', 'web');

        activity()
            ->causedBy($request->user('superadmin'))
            ->performedOn($tenant)
            ->log('Impersonated tenant admin.');

        return Inertia::location($this->impersonationUrl($request, $domain->domain, $token->token));
    }

    /**
     * Build the tenant-domain URL, preserving the current scheme and (dev) port.
     */
    protected function impersonationUrl(Request $request, string $domain, string $token): string
    {
        $port = $request->getPort();
        $host = $domain.(in_array($port, [80, 443, null], true) ? '' : ':'.$port);

        return $request->getScheme().'://'.$host.'/impersonate/'.$token;
    }
}
